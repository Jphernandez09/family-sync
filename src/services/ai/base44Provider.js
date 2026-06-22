/**
 * base44Provider.js — Base44 InvokeLLM extraction provider
 *
 * Calls the `extract-schedule` backend function deployed in base44/functions/.
 * All AI prompt engineering lives in that server-side function (entry.ts),
 * so the model, prompt, and JSON schema can be updated without a frontend deploy.
 *
 * This is the DEFAULT provider. To swap in another backend:
 *   import { openaiProvider } from './openaiProvider.js';
 *   setExtractionProvider(openaiProvider);  // in main.jsx
 */
import { functions } from "../base44Client.js";
import { FLAGS } from "./extractionProvider.js";

export const base44Provider = {
  name: "base44",

  /**
   * @param {string} rawText
   * @param {import('./extractionProvider.js').FamilyContext} [familyContext]
   * @returns {Promise<import('./extractionProvider.js').ExtractionResult>}
   */
  async extract(rawText, familyContext = {}) {
    const result = await functions.invoke("extract-schedule", {
      rawText,
      familyContext,
    });

    // Normalise: flag low-confidence items if the backend didn't already
    const items = (result?.items || []).map((item) => {
      const flags = item.flags || [];
      if (
        item.confidence_score < 0.7 &&
        !flags.includes(FLAGS.LOW_CONFIDENCE)
      ) {
        return { ...item, flags: [...flags, FLAGS.LOW_CONFIDENCE] };
      }
      return item;
    });

    return {
      items,
      summary: result?.summary || "",
      extraction_confidence: result?.extraction_confidence ?? 0,
    };
  },
};
