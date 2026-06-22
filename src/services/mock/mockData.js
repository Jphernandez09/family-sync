/**
 * mockData.js — Demo mode data
 *
 * Used by all services when DEMO_MODE is true (no Base44 app ID configured).
 * Provides realistic sports-family data so the full UI is exercisable
 * before any backend is wired up.
 *
 * Sports families represented: the Hernandez family — two kids in
 * soccer and hockey, one parent managing everything.
 */

// ─── Family ───────────────────────────────────────────────────────────────────

export const MOCK_FAMILY = {
  id: "demo-family",
  name: "Hernandez Family",
  home_location: "Naperville, IL",
  timezone: "America/Chicago",
  created_at: "2026-05-01T00:00:00Z",
};

export const MOCK_FAMILY_MEMBERS = [
  {
    id: "member-1",
    name: "Sofia",
    role: "child",
    sports: ["soccer"],
    team_names: ["Storm U10"],
    jersey_number: "7",
    age: 10,
    school: "Lincoln Elementary",
  },
  {
    id: "member-2",
    name: "Marco",
    role: "child",
    sports: ["hockey"],
    team_names: ["Northside Jets U12"],
    jersey_number: "14",
    age: 12,
    school: "Jefferson Middle School",
  },
  {
    id: "member-3",
    name: "Sarah",
    role: "parent",
    sports: [],
    team_names: [],
    age: null,
    school: null,
  },
];

// ─── Uploads ──────────────────────────────────────────────────────────────────

export const MOCK_UPLOADS = [
  {
    id: "upload-1",
    source_type: "text",
    status: "review_ready",
    title: "Coach Mike — Storm U10 May schedule",
    raw_text:
      "Hi Parents, Here is the schedule for May:\n" +
      "Practice: Tues May 7, 6:00–7:30 PM, Naperville Soccer Complex Field 3\n" +
      "Game vs. Lightning FC: Sat May 11, 10:00 AM, Westfield Park\n" +
      "Tournament at Downers Grove Sports Campus: Sat–Sun May 18–19\n" +
      "Forms due May 10 — sign the liability waiver\n" +
      "Registration fee $75 due May 8 to Coach Mike\n",
    items_extracted: 5,
    created_at: "2026-05-02T14:22:00Z",
  },
  {
    id: "upload-2",
    source_type: "image",
    status: "completed",
    title: "Jets U12 tournament bracket.jpg",
    file_name: "jets_tournament_bracket.jpg",
    raw_text: "[Image: tournament bracket]",
    items_extracted: 3,
    created_at: "2026-05-01T09:15:00Z",
  },
];

// ─── Extracted Items (Review Queue) ───────────────────────────────────────────

export const MOCK_EXTRACTED_ITEMS = [
  {
    id: "item-1",
    upload_id: "upload-1",
    item_type: "calendar_event",
    title: "Storm U10 Practice",
    sport_activity: "Soccer Practice",
    confidence_score: 0.97,
    review_status: "pending",
    event_date: "2026-06-24",
    start_time: "18:00",
    end_time: "19:30",
    arrival_time: "17:50",
    leave_by_time: "17:30",
    location_name: "Naperville Soccer Complex",
    location_address: "2564 Ogden Ave, Naperville, IL 60540",
    description: "Regular weekly practice for Sofia — Storm U10",
    source_text: "Practice: Tues May 7, 6:00–7:30 PM, Naperville Soccer Complex Field 3",
    flags: [],
  },
  {
    id: "item-2",
    upload_id: "upload-1",
    item_type: "calendar_event",
    title: "Storm U10 vs. Lightning FC",
    sport_activity: "Soccer Game",
    confidence_score: 0.93,
    review_status: "pending",
    event_date: "2026-06-28",
    start_time: "10:00",
    end_time: "11:30",
    arrival_time: "09:30",
    leave_by_time: "09:00",
    location_name: "Westfield Park",
    location_address: "1200 Westfield Dr, Naperville, IL 60565",
    description: "Away game — check weather for field conditions",
    source_text: "Game vs. Lightning FC: Sat May 11, 10:00 AM, Westfield Park",
    flags: [],
  },
  {
    id: "item-3",
    upload_id: "upload-1",
    item_type: "calendar_event",
    title: "Storm U10 Tournament — Downers Grove",
    sport_activity: "Soccer Tournament",
    confidence_score: 0.61,
    review_status: "pending",
    event_date: "2026-06-29",
    start_time: null,
    end_time: null,
    arrival_time: null,
    leave_by_time: null,
    location_name: "Downers Grove Sports Campus",
    location_address: "4250 Saratoga Ave, Downers Grove, IL 60515",
    description: "Two-day tournament. Start time not confirmed — check with coach.",
    source_text:
      "Tournament at Downers Grove Sports Campus: Sat–Sun May 18–19",
    flags: ["low_confidence", "missing_date"],
  },
  {
    id: "item-4",
    upload_id: "upload-1",
    item_type: "payment",
    title: "Tournament Registration Fee — $75",
    confidence_score: 0.98,
    review_status: "pending",
    amount: 75,
    payable_to: "Coach Mike",
    deadline: "2026-06-25",
    description: "Registration fee for May tournament",
    source_text: "Registration fee $75 due May 8 to Coach Mike",
    flags: ["time_sensitive"],
  },
  {
    id: "item-5",
    upload_id: "upload-1",
    item_type: "form_required",
    title: "Liability Waiver — Storm U10",
    confidence_score: 0.91,
    review_status: "pending",
    form_name: "Liability Waiver",
    deadline: "2026-06-27",
    description: "Sign and return to coach before May 10",
    source_text: "Forms due May 10 — sign the liability waiver",
    flags: [],
  },
  {
    id: "item-6",
    upload_id: "upload-2",
    item_type: "packing_item",
    title: "Hockey Tournament Packing List",
    confidence_score: 0.88,
    review_status: "pending",
    packing_items: [
      "Hockey bag + skates",
      "Helmet with cage",
      "Mouth guard",
      "Water bottle (labeled)",
      "Healthy snacks for 2 games",
      "Team jersey #14",
      "Cash for rink food",
    ],
    source_text: "[Extracted from tournament welcome packet]",
    flags: [],
  },
];

// ─── Approved Events ──────────────────────────────────────────────────────────

export const MOCK_APPROVED_EVENTS = [
  {
    id: "event-1",
    title: "Storm U10 Practice",
    sport_activity: "Soccer Practice",
    event_date: "2026-06-24",
    start_time: "18:00",
    end_time: "19:30",
    arrival_time: "17:50",
    leave_by_time: "17:30",
    location_name: "Naperville Soccer Complex",
    location_address: "2564 Ogden Ave, Naperville, IL 60540",
    ics_uid: "family-sync-event-1@familysync.app",
  },
  {
    id: "event-2",
    title: "Storm U10 vs. Lightning FC",
    sport_activity: "Soccer Game",
    event_date: "2026-06-28",
    start_time: "10:00",
    end_time: "11:30",
    arrival_time: "09:30",
    leave_by_time: "09:00",
    location_name: "Westfield Park",
    location_address: "1200 Westfield Dr, Naperville, IL 60565",
    ics_uid: "family-sync-event-2@familysync.app",
  },
  {
    id: "event-3",
    title: "Jets U12 Practice",
    sport_activity: "Hockey Practice",
    event_date: "2026-06-25",
    start_time: "07:00",
    end_time: "08:30",
    arrival_time: "06:45",
    leave_by_time: "06:15",
    location_name: "Canlan Ice Sports",
    location_address: "1851 W Lake St, Addison, IL 60101",
    notes: "Marco needs to gear up before stepping on ice",
    ics_uid: "family-sync-event-3@familysync.app",
  },
  {
    id: "event-4",
    title: "Storm U10 Tournament — Day 1",
    sport_activity: "Soccer Tournament",
    event_date: "2026-06-29",
    start_time: "08:00",
    end_time: "18:00",
    arrival_time: "07:30",
    leave_by_time: "07:00",
    location_name: "Downers Grove Sports Campus",
    location_address: "4250 Saratoga Ave, Downers Grove, IL 60515",
    ics_uid: "family-sync-event-4@familysync.app",
  },
  {
    id: "event-5",
    title: "Storm U10 Tournament — Day 2",
    sport_activity: "Soccer Tournament",
    event_date: "2026-06-30",
    start_time: "08:00",
    end_time: "17:00",
    arrival_time: "07:30",
    leave_by_time: "07:00",
    location_name: "Downers Grove Sports Campus",
    location_address: "4250 Saratoga Ave, Downers Grove, IL 60515",
    ics_uid: "family-sync-event-5@familysync.app",
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const MOCK_TASKS = [
  {
    id: "task-1",
    task_type: "payment",
    title: "Tournament Registration Fee — $75",
    amount: 75,
    payable_to: "Coach Mike",
    deadline: "2026-06-25",
    status: "pending",
    is_urgent: true,
  },
  {
    id: "task-2",
    task_type: "form_required",
    title: "Liability Waiver — Storm U10",
    form_name: "Liability Waiver",
    deadline: "2026-06-27",
    status: "pending",
    is_urgent: false,
  },
];

// ─── Packing Items ────────────────────────────────────────────────────────────

export const MOCK_PACKING_ITEMS = [
  { id: "pack-1", item_name: "Hockey bag + skates", category: "gear", is_packed: false },
  { id: "pack-2", item_name: "Helmet with cage", category: "gear", is_packed: false },
  { id: "pack-3", item_name: "Mouth guard", category: "gear", is_packed: true },
  { id: "pack-4", item_name: "Water bottle (labeled)", category: "food", is_packed: false },
  { id: "pack-5", item_name: "Healthy snacks for 2 games", category: "food", is_packed: false },
  { id: "pack-6", item_name: "Team jersey #14", category: "gear", is_packed: false },
  { id: "pack-7", item_name: "Cash for rink food", category: "other", is_packed: false },
];
