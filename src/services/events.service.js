/**
 * events.service.js — Approved event management
 *
 * Reads and manages ApprovedEvent records — the source of truth for the
 * weekly GamePlan view and calendar export.
 *
 * Migration path: replace entity calls with your database client.
 */
import { entities, DEMO_MODE } from "./base44Client.js";
import {
  isWithinInterval,
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { getApprovedEvents as getDemoEvents } from "./mock/demoStore.js";

// ─── Read ─────────────────────────────────────────────────────────────────────

/** @returns {Promise<Object[]>} All approved events, sorted by date */
export async function getApprovedEvents() {
  if (DEMO_MODE) return getDemoEvents();
  const events = await entities.ApprovedEvent.filter({});
  return (events || []).sort(
    (a, b) => new Date(a.event_date) - new Date(b.event_date)
  );
}

/**
 * Returns events for a given week.
 *
 * @param {number} [weekOffset=0] - 0 = this week, 1 = next week, -1 = last week
 * @returns {Promise<Object[]>}
 */
export async function getWeeklyEvents(weekOffset = 0) {
  const allEvents = await getApprovedEvents();
  const anchor = addDays(new Date(), weekOffset * 7);
  const weekStart = startOfWeek(anchor, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 0 });

  return allEvents.filter((e) => {
    try {
      return isWithinInterval(parseISO(e.event_date), {
        start: weekStart,
        end: weekEnd,
      });
    } catch {
      return false;
    }
  });
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createEvent(data) {
  if (DEMO_MODE) return { ...data, id: `event-${Date.now()}` };
  return entities.ApprovedEvent.create(data);
}

export async function updateEvent(id, data) {
  if (DEMO_MODE) return { id, ...data };
  return entities.ApprovedEvent.update(id, data);
}

export async function deleteEvent(id) {
  if (DEMO_MODE) return;
  return entities.ApprovedEvent.delete(id);
}
