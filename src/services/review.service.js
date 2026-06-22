/**
 * review.service.js — Review queue operations
 *
 * Manages the parent review workflow: loading pending items, approving,
 * editing, and rejecting. Approval creates downstream records (ApprovedEvent,
 * TaskItem, or PackingItem) and marks the ExtractedItem as approved.
 *
 * Migration path: replace entity calls with your database client.
 */
import { entities, DEMO_MODE } from "./base44Client.js";
import {
  getPendingExtractedItems,
  updateExtractedItem,
  addApprovedEvent,
  addTask,
  addPackingItem,
} from "./mock/demoStore.js";

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns pending items sorted by confidence ascending (lowest confidence
 * first so parents review the shakiest extractions early).
 *
 * @returns {Promise<Object[]>}
 */
export async function getPendingItems() {
  if (DEMO_MODE) {
    return getPendingExtractedItems();
  }

  const items = await entities.ExtractedItem.filter({
    review_status: "pending",
  });
  return (items || []).sort(
    (a, b) => (a.confidence_score || 1) - (b.confidence_score || 1)
  );
}

/** @returns {Promise<number>} */
export async function getPendingCount() {
  if (DEMO_MODE) {
    return getPendingExtractedItems().length;
  }
  const items = await entities.ExtractedItem.filter({
    review_status: "pending",
  });
  return items?.length || 0;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Approves an extracted item. Creates the appropriate downstream record and
 * marks the ExtractedItem as approved.
 *
 * Supported downstream targets:
 *   calendar_event → ApprovedEvent
 *   task / payment / form_required → TaskItem
 *   packing_item → PackingItem (one per string in packing_items array)
 *
 * @param {Object} item - The ExtractedItem to approve
 */
export async function approveItem(item) {
  if (DEMO_MODE) {
    updateExtractedItem(item.id, { review_status: item._wasEdited ? "edited_approved" : "approved" });
    if (item.item_type === "calendar_event") {
      addApprovedEvent({
        title: item.title,
        sport_activity: item.sport_activity,
        event_date: item.event_date,
        start_time: item.start_time,
        end_time: item.end_time,
        arrival_time: item.arrival_time,
        leave_by_time: item.leave_by_time,
        location_name: item.location_name,
        location_address: item.location_address,
        notes: item.description,
        ics_uid: `family-sync-${item.id}@familysync.app`,
      });
    } else if (["task", "payment", "form_required"].includes(item.item_type)) {
      addTask({
        task_type: item.item_type === "payment" ? "payment"
          : item.item_type === "form_required" ? "form_required" : "general_task",
        title: item.title,
        deadline: item.deadline,
        amount: item.amount,
        is_urgent: item.flags?.includes("time_sensitive") || false,
      });
    } else if (item.item_type === "packing_item" && item.packing_items?.length) {
      item.packing_items.forEach((name) => addPackingItem({ item_name: name, category: "gear" }));
    }
    return;
  }

  // Create downstream record based on item type
  try {
    if (item.item_type === "calendar_event") {
      await entities.ApprovedEvent.create({
        extracted_item_id: item.id,
        upload_id: item.upload_id,
        title: item.title,
        sport_activity: item.sport_activity,
        event_date: item.event_date,
        start_time: item.start_time,
        end_time: item.end_time,
        arrival_time: item.arrival_time,
        leave_by_time: item.leave_by_time,
        location_name: item.location_name,
        location_address: item.location_address,
        notes: item.description,
        is_recurring: item.is_recurring || false,
        recurrence_pattern: item.recurrence_pattern,
        ics_uid: `family-sync-${item.id}-${Date.now()}@familysync.app`,
      });
    } else if (
      item.item_type === "task" ||
      item.item_type === "payment" ||
      item.item_type === "form_required"
    ) {
      const taskTypeMap = {
        payment: "payment",
        form_required: "form_required",
        task: "general_task",
      };
      await entities.TaskItem.create({
        extracted_item_id: item.id,
        upload_id: item.upload_id,
        task_type: taskTypeMap[item.item_type] || "general_task",
        title: item.title,
        description: item.description,
        deadline: item.deadline,
        amount: item.amount,
        payable_to: item.payable_to,
        form_name: item.form_name,
        form_url: item.form_url,
        status: "pending",
        is_urgent: item.flags?.includes("time_sensitive") || false,
      });
    } else if (
      item.item_type === "packing_item" &&
      item.packing_items?.length
    ) {
      for (const packItem of item.packing_items) {
        await entities.PackingItem.create({
          item_name: packItem,
          category: "gear",
          is_packed: false,
          source_upload_id: item.upload_id,
        });
      }
    }
  } catch (err) {
    console.warn(
      "[review.service] Downstream record creation failed:",
      err
    );
    // Still mark as approved even if downstream record fails
    // so the parent is not stuck in a loop
  }

  // Mark the item itself as approved
  const status = item._wasEdited ? "edited_approved" : "approved";
  await entities.ExtractedItem.update(item.id, { review_status: status });
}

/**
 * Rejects an extracted item.
 * @param {string} itemId
 */
export async function rejectItem(itemId) {
  if (DEMO_MODE) {
    updateExtractedItem(itemId, { review_status: "rejected" });
    return;
  }
  return entities.ExtractedItem.update(itemId, { review_status: "rejected" });
}

/**
 * Updates an extracted item's fields (edit before approve).
 * Does NOT change review_status — call approveItem after editing.
 *
 * @param {string} itemId
 * @param {Object} data - Partial ExtractedItem fields to update
 */
export async function updateItem(itemId, data) {
  if (DEMO_MODE) {
    updateExtractedItem(itemId, data);
    return { id: itemId, ...data };
  }
  return entities.ExtractedItem.update(itemId, data);
}
