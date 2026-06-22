/**
 * extraction.service.js — AI extraction orchestrator
 *
 * This is the single entry point for all AI extraction work. It:
 *   1. Delegates to the active AI provider (swappable at runtime).
 *   2. Persists extracted items to the database.
 *   3. Updates upload status through the full lifecycle.
 *
 * The active provider defaults to base44Provider. Swap it via
 * setExtractionProvider() — useful for A/B testing or migration.
 *
 * Migration path: the only Base44-specific code here is the Upload status
 * updates. The core extract() call goes to the provider, which is already
 * decoupled. Swap entity calls with your database client to finish migration.
 */
import { entities, DEMO_MODE } from "./base44Client.js";
import { base44Provider } from "./ai/base44Provider.js";
import { validateProvider } from "./ai/extractionProvider.js";
import { generateDemoItems, addExtractedItems } from "./mock/demoStore.js";

// ─── Provider Registry ────────────────────────────────────────────────────────

let _provider = base44Provider;

/**
 * Swap the active AI extraction provider at runtime.
 * Call this in main.jsx before the app mounts.
 *
 * @param {import('./ai/extractionProvider.js').Provider} provider
 */
export function setExtractionProvider(provider) {
  validateProvider(provider);
  _provider = provider;
  console.info(`[extraction.service] Provider set to: ${provider.name}`);
}

/** @returns {string} Name of the currently active provider */
export function getActiveProviderName() {
  return _provider.name;
}

// ─── Core Extraction ──────────────────────────────────────────────────────────

/**
 * Runs AI extraction on raw text and returns structured items.
 * Does NOT persist to the database — use processUpload() for the full flow.
 *
 * @param {string} rawText
 * @param {import('./ai/extractionProvider.js').FamilyContext} [familyContext]
 * @returns {Promise<import('./ai/extractionProvider.js').ExtractionResult>}
 */
export async function extractFromText(rawText, familyContext = {}, uploadId, sourceType) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    const items = generateDemoItems(uploadId || "demo", sourceType || "text");
    return {
      items,
      summary: `Found ${items.length} item${items.length !== 1 ? "s" : ""} in your upload.`,
      extraction_confidence: 0.88,
    };
  }

  return _provider.extract(rawText, familyContext);
}

// ─── Full Upload Processing Pipeline ─────────────────────────────────────────

/**
 * Full pipeline: extract → persist items → update upload status.
 *
 * @param {string} uploadId    - ID of the Upload entity to process
 * @param {string} rawText     - The text to extract from
 * @param {import('./ai/extractionProvider.js').FamilyContext} [familyContext]
 * @returns {Promise<{ success: boolean, itemCount: number, result: ExtractionResult }>}
 */
export async function processUpload(uploadId, rawText, familyContext = {}, sourceType = "text") {
  // 1. Mark as in progress
  if (!DEMO_MODE) {
    await entities.Upload.update(uploadId, { status: "extracting" });
  }

  try {
    // 2. Run extraction
    const result = await extractFromText(rawText, familyContext, uploadId, sourceType);
    const items = result?.items || [];

    // 3. Persist items
    if (DEMO_MODE) {
      addExtractedItems(items);
    } else if (!DEMO_MODE) {
      for (const item of items) {
        await entities.ExtractedItem.create({
          ...item,
          upload_id: uploadId,
          review_status: "pending",
          created_at: new Date().toISOString(),
        });
      }
    }

    // 4. Update upload to review-ready
    if (!DEMO_MODE) {
      await entities.Upload.update(uploadId, {
        status: items.length > 0 ? "review_ready" : "completed",
        extraction_result: {
          summary: result.summary,
          extraction_confidence: result.extraction_confidence,
        },
        items_extracted: items.length,
      });
    }

    return { success: true, itemCount: items.length, result };
  } catch (error) {
    // 5. Mark as failed so parent knows to surface error
    if (!DEMO_MODE) {
      await entities.Upload.update(uploadId, {
        status: "failed",
        extraction_error: String(error),
      });
    }
    throw error;
  }
}
