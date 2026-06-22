/**
 * extractionProvider.js — AI Extraction Provider Interface
 *
 * This file defines the contract that every AI extraction provider must fulfill.
 * Family Sync ships with the Base44 provider, but swapping to OpenAI,
 * Anthropic Claude API, Gemini, or a custom edge function requires only:
 *   1. Implementing this interface in a new provider file.
 *   2. Calling setExtractionProvider() in main.jsx before the app mounts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROVIDER INTERFACE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A provider is a plain object with:
 *
 *   {
 *     name: string,
 *     extract(rawText: string, familyContext?: FamilyContext): Promise<ExtractionResult>
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INPUT TYPES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @typedef {Object} FamilyContext
 * @property {string[]} memberNames    - e.g. ["Sofia", "Marco", "Sarah"]
 * @property {string[]} sports         - e.g. ["soccer", "hockey"]
 * @property {string[]} teamNames      - e.g. ["Storm U10", "Northside Jets U12"]
 * @property {string}   [homeLocation] - e.g. "Naperville, IL"
 * @property {string}   [timezone]     - e.g. "America/Chicago"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OUTPUT TYPES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @typedef {Object} ExtractionResult
 * @property {ExtractedItem[]} items
 * @property {string}          summary              - 1–2 sentence human summary
 * @property {number}          extraction_confidence - 0.0–1.0 overall confidence
 *
 * @typedef {Object} ExtractedItem
 * @property {string}   title
 * @property {string}   item_type       - See ITEM_TYPES below
 * @property {number}   confidence_score  - 0.0–1.0
 * @property {string}   [description]
 * @property {string}   [sport_activity]
 * @property {string}   [event_date]    - ISO 8601 date "YYYY-MM-DD"
 * @property {string}   [start_time]    - "HH:MM"
 * @property {string}   [end_time]      - "HH:MM"
 * @property {string}   [arrival_time]  - "HH:MM"
 * @property {string}   [leave_by_time] - "HH:MM" — when family must leave home
 * @property {string}   [location_name]
 * @property {string}   [location_address]
 * @property {number}   [amount]        - Dollar amount for payment items
 * @property {string}   [payable_to]
 * @property {string}   [deadline]      - ISO 8601 date
 * @property {string}   [form_name]
 * @property {string}   [form_url]
 * @property {string[]} [packing_items] - For packing_item type
 * @property {string}   [source_text]   - The exact text this was extracted from
 * @property {string[]} [flags]         - See FLAGS below
 * @property {boolean}  [is_recurring]
 * @property {string}   [recurrence_pattern] - "weekly", "biweekly", etc.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ITEM TYPES
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ITEM_TYPES = {
  CALENDAR_EVENT:   "calendar_event",
  TASK:             "task",
  PAYMENT:          "payment",
  FORM_REQUIRED:    "form_required",
  PACKING_ITEM:     "packing_item",
  TRAVEL_NOTE:      "travel_note",
  CONFLICT_WARNING: "conflict_warning",
  GENERAL_NOTE:     "general_note",
};

/**
 * FLAGS — applied by the extraction engine to items that need extra attention.
 */
export const FLAGS = {
  LOW_CONFIDENCE:  "low_confidence",    // confidence_score < 0.70
  TIME_SENSITIVE:  "time_sensitive",    // deadline within 48h
  MISSING_DATE:    "missing_date",
  MISSING_LOCATION:"missing_location",
  CONFLICT:        "conflict",          // overlaps with existing event
  FAMILY_CONFLICT: "family_conflict",   // two family members needed at same time
};

/**
 * Validates that an object conforms to the provider interface.
 * Throws if invalid. Use this when registering a custom provider.
 *
 * @param {Object} provider
 */
export function validateProvider(provider) {
  if (!provider || typeof provider !== "object") {
    throw new TypeError("Provider must be an object");
  }
  if (typeof provider.name !== "string") {
    throw new TypeError("Provider must have a string 'name' property");
  }
  if (typeof provider.extract !== "function") {
    throw new TypeError("Provider must implement extract(rawText, familyContext)");
  }
}
