/**
 * demoStore.js — In-memory state for demo mode
 *
 * Acts as a lightweight in-memory database so the demo feels real:
 * uploading new content adds new items, approving removes them, etc.
 * State resets on page reload (intentional for demo).
 */
import { MOCK_EXTRACTED_ITEMS, MOCK_APPROVED_EVENTS, MOCK_TASKS, MOCK_PACKING_ITEMS } from "./mockData.js";

// Deep-clone so mutations don't affect the original constants
const clone = (obj) => JSON.parse(JSON.stringify(obj));

const store = {
  extractedItems: clone(MOCK_EXTRACTED_ITEMS),
  approvedEvents: clone(MOCK_APPROVED_EVENTS),
  tasks: clone(MOCK_TASKS),
  packingItems: clone(MOCK_PACKING_ITEMS),
};

// ─── Extracted Items ──────────────────────────────────────────────────────────

export function getPendingExtractedItems() {
  return store.extractedItems
    .filter((i) => i.review_status === "pending")
    .sort((a, b) => (a.confidence_score || 1) - (b.confidence_score || 1));
}

export function addExtractedItems(items) {
  store.extractedItems.push(...items);
}

export function updateExtractedItem(id, data) {
  const idx = store.extractedItems.findIndex((i) => i.id === id);
  if (idx !== -1) store.extractedItems[idx] = { ...store.extractedItems[idx], ...data };
}

// ─── Approved Events ──────────────────────────────────────────────────────────

export function getApprovedEvents() {
  return [...store.approvedEvents].sort(
    (a, b) => new Date(a.event_date) - new Date(b.event_date)
  );
}

export function addApprovedEvent(event) {
  store.approvedEvents.push({ ...event, id: `event-${Date.now()}` });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function getPendingTasksFromStore() {
  return store.tasks.filter((t) => t.status === "pending");
}

export function addTask(task) {
  store.tasks.push({ ...task, id: `task-${Date.now()}`, status: "pending" });
}

export function updateTask(id, data) {
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx !== -1) store.tasks[idx] = { ...store.tasks[idx], ...data };
}

// ─── Packing Items ────────────────────────────────────────────────────────────

export function getPackingItemsFromStore() {
  return store.packingItems;
}

export function addPackingItem(item) {
  store.packingItems.push({ ...item, id: `pack-${Date.now()}`, is_packed: false });
}

export function updatePackingItem(id, data) {
  const idx = store.packingItems.findIndex((p) => p.id === id);
  if (idx !== -1) store.packingItems[idx] = { ...store.packingItems[idx], ...data };
}

// ─── Demo extraction — generates unique items per upload ─────────────────────

let uploadCounter = 0;

const IMAGE_TEMPLATES = [
  {
    item_type: "calendar_event",
    title: "Team Practice",
    sport_activity: "Practice",
    confidence_score: 0.82,
    event_date: daysFromNow(3),
    start_time: "17:00",
    end_time: "18:30",
    arrival_time: "16:50",
    leave_by_time: "16:25",
    location_name: "Community Sports Park",
    description: "Extracted from uploaded screenshot",
    flags: [],
  },
  {
    item_type: "calendar_event",
    title: "Weekend Tournament",
    sport_activity: "Tournament",
    confidence_score: 0.71,
    event_date: daysFromNow(10),
    start_time: "08:00",
    end_time: "17:00",
    arrival_time: "07:30",
    leave_by_time: "07:00",
    location_name: "Regional Sports Complex",
    description: "Full-day tournament — check bracket for game times",
    flags: ["low_confidence"],
  },
  {
    item_type: "packing_item",
    title: "Tournament Packing List",
    confidence_score: 0.91,
    packing_items: ["Jersey", "Cleats / skates", "Water bottle", "Snacks", "Sunscreen", "Folding chair"],
    description: "Extracted from screenshot",
    flags: [],
  },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Generates a set of demo ExtractedItems for a new upload.
 * Each call produces slightly different items so multiple uploads feel distinct.
 */
export function generateDemoItems(uploadId, sourceType) {
  uploadCounter++;
  const base = uploadCounter;

  const templates = sourceType === "note"
    ? [IMAGE_TEMPLATES[0]]  // Quick note → single event
    : IMAGE_TEMPLATES;

  return templates.map((t, i) => ({
    ...t,
    id: `demo-item-${base}-${i}`,
    upload_id: uploadId,
    review_status: "pending",
    source_text: `[Demo: extracted from ${sourceType} upload #${base}]`,
  }));
}
