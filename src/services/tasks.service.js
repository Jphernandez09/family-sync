/**
 * tasks.service.js — Task and packing item management
 *
 * Manages TaskItem (payments, forms, to-dos) and PackingItem records.
 *
 * Migration path: replace entity calls with your database client.
 */
import { entities, DEMO_MODE } from "./base44Client.js";
import {
  getPendingTasksFromStore,
  getPackingItemsFromStore,
  updateTask as updateDemoTask,
  updatePackingItem as updateDemoPackingItem,
} from "./mock/demoStore.js";

// ─── Tasks ────────────────────────────────────────────────────────────────────

/** @returns {Promise<Object[]>} Pending tasks, urgent first */
export async function getPendingTasks() {
  if (DEMO_MODE) return getPendingTasksFromStore();
  const tasks = await entities.TaskItem.filter({ status: "pending" });
  return (tasks || []).sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0));
}

/** @returns {Promise<Object[]>} All tasks regardless of status */
export async function getAllTasks() {
  if (DEMO_MODE) return MOCK_TASKS;
  return entities.TaskItem.filter({});
}

export async function updateTask(id, data) {
  if (DEMO_MODE) return { id, ...data };
  return entities.TaskItem.update(id, data);
}

export async function completeTask(id) {
  if (DEMO_MODE) return;
  return entities.TaskItem.update(id, {
    status: "done",
    completed_at: new Date().toISOString(),
  });
}

export async function createTask(data) {
  if (DEMO_MODE) return { ...data, id: `task-${Date.now()}` };
  return entities.TaskItem.create({
    ...data,
    status: "pending",
    created_at: new Date().toISOString(),
  });
}

// ─── Packing Items ────────────────────────────────────────────────────────────

/** @returns {Promise<Object[]>} Unpacked items only */
export async function getPackingItems() {
  if (DEMO_MODE) return getPackingItemsFromStore();
  const items = await entities.PackingItem.filter({ is_packed: false });
  return items || [];
}

/** @returns {Promise<Object[]>} All packing items */
export async function getAllPackingItems() {
  if (DEMO_MODE) return MOCK_PACKING_ITEMS;
  return entities.PackingItem.filter({});
}

export async function togglePackingItem(id, isPacked) {
  if (DEMO_MODE) {
    updateDemoPackingItem(id, { is_packed: isPacked });
    return;
  }
  return entities.PackingItem.update(id, { is_packed: isPacked });
}

export async function createPackingItem(data) {
  if (DEMO_MODE) return { ...data, id: `pack-${Date.now()}` };
  return entities.PackingItem.create({
    ...data,
    is_packed: false,
    created_at: new Date().toISOString(),
  });
}
