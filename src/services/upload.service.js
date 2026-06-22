/**
 * upload.service.js — Upload inbox management
 *
 * Handles creating Upload records and storing files in Base44 object storage.
 * File upload (UploadFile) is the only integration call here; all other
 * operations are entity CRUD.
 *
 * Migration path: replace integrations.Core.UploadFile with your storage
 * provider (S3, Supabase Storage, Cloudflare R2, etc.) and update entity
 * calls with your database client.
 */
import { entities, integrations, DEMO_MODE } from "./base44Client.js";
import { MOCK_UPLOADS } from "./mock/mockData.js";

// ─── Read ─────────────────────────────────────────────────────────────────────

/** @returns {Promise<Object[]>} Most recent uploads first */
export async function getUploads() {
  if (DEMO_MODE) return MOCK_UPLOADS;
  const uploads = await entities.Upload.filter({});
  return (uploads || []).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates an Upload record.
 * If a file is provided, it is uploaded to storage first.
 *
 * @param {{
 *   sourceType: 'image'|'pdf'|'text'|'note',
 *   rawText?: string,
 *   file?: File,
 *   familyId?: string,
 *   userId?: string,
 * }} params
 * @returns {Promise<Object>} The created Upload entity
 */
export async function createUpload({ sourceType, rawText, file, familyId, userId }) {
  let fileUrl = null;
  let fileName = null;
  let fileSizeBytes = null;

  // Store file if provided
  if (file && !DEMO_MODE) {
    try {
      const result = await integrations.Core.UploadFile({ file });
      fileUrl = result?.file_url ?? null;
    } catch (err) {
      console.warn("[upload.service] File storage failed:", err);
      // Continue without file URL — text extraction can still run
    }
  }

  if (file) {
    fileName = file.name;
    fileSizeBytes = file.size;
  }

  const title = fileName || rawText?.slice(0, 60) || "Quick note";

  if (DEMO_MODE) {
    return {
      id: `upload-${Date.now()}`,
      source_type: sourceType,
      status: "pending_extraction",
      title,
      raw_text: rawText || (fileName ? `[File: ${fileName}]` : ""),
      file_url: fileUrl,
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      family_id: familyId || "demo-family",
      uploaded_by: userId || "demo-user",
      created_at: new Date().toISOString(),
    };
  }

  return entities.Upload.create({
    source_type: sourceType,
    status: "pending_extraction",
    title,
    raw_text: rawText || (fileName ? `[File: ${fileName}]` : ""),
    file_url: fileUrl,
    file_name: fileName,
    file_size_bytes: fileSizeBytes,
    family_id: familyId,
    uploaded_by: userId,
    created_at: new Date().toISOString(),
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Updates the processing status of an upload.
 * @param {string} id
 * @param {'pending_extraction'|'extracting'|'review_ready'|'completed'|'failed'} status
 * @param {Object} [extra] Additional fields to update
 */
export async function updateUploadStatus(id, status, extra = {}) {
  if (DEMO_MODE) return;
  return entities.Upload.update(id, { status, ...extra });
}
