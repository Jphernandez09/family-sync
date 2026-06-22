/**
 * Mock seed data for development and demo purposes.
 * Replace with real Base44 entity data in production.
 */

export const MOCK_FAMILY_MEMBERS = [
  {
    id: "m1",
    name: "Sofia",
    role: "child",
    sports: ["Soccer", "Swimming"],
    team_names: ["Storm U10"],
    birth_year: 2014,
    coach_contact: "Coach Rivera · 555-0182",
    color: "#f97316",
  },
  {
    id: "m2",
    name: "Marco",
    role: "child",
    sports: ["Hockey"],
    team_names: ["Northside Jets U12"],
    birth_year: 2012,
    coach_contact: "Coach Johnson · 555-0193",
    color: "#3b82f6",
  },
  {
    id: "m3",
    name: "Sarah (Mom)",
    role: "parent",
    sports: [],
    team_names: [],
    color: "#a855f7",
  },
];

export const MOCK_UPLOADS = [
  {
    id: "u1",
    source_type: "text",
    status: "review_ready",
    title: "Coach Rivera — Week 3 schedule",
    items_extracted: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: "u2",
    source_type: "pdf",
    status: "completed",
    title: "Northside Tournament Bracket.pdf",
    items_extracted: 6,
    items_approved: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // yesterday
  },
  {
    id: "u3",
    source_type: "image",
    status: "pending_extraction",
    title: "Swimming camp info",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
  },
];

export const MOCK_EXTRACTED_ITEMS = [
  {
    id: "ei1",
    upload_id: "u1",
    item_type: "calendar_event",
    review_status: "pending",
    confidence_score: 0.92,
    title: "Storm U10 Practice",
    family_member_name: "Sofia",
    sport_activity: "Soccer",
    event_date: (() => {
      const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0];
    })(),
    start_time: "17:30",
    end_time: "19:00",
    location_name: "Riverside Soccer Complex, Field 4",
    location_address: "400 Riverside Dr",
    arrival_time: "17:15",
    source_text: "Sofia's U10 practice Tue 5:30pm–7pm, Field 4 Riverside Complex. Arrive 15 min early.",
    flags: [],
  },
  {
    id: "ei2",
    upload_id: "u1",
    item_type: "payment",
    review_status: "pending",
    confidence_score: 0.88,
    title: "Tournament registration fee",
    family_member_name: "Sofia",
    amount: 75,
    payable_to: "Storm Soccer Club",
    deadline: (() => {
      const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split("T")[0];
    })(),
    source_text: "$75 tournament fee due Friday — Venmo @StormSoccer or bring cash/check.",
    flags: ["needs_payment", "time_sensitive"],
  },
  {
    id: "ei3",
    upload_id: "u1",
    item_type: "form_required",
    review_status: "pending",
    confidence_score: 0.85,
    title: "Medical consent form — State Cup",
    family_member_name: "Sofia",
    form_name: "State Cup Medical Consent",
    form_url: "https://example.com/forms/medical-consent",
    deadline: (() => {
      const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0];
    })(),
    source_text: "All players must submit medical consent form before State Cup. Link in portal.",
    flags: ["needs_form"],
  },
  {
    id: "ei4",
    upload_id: "u1",
    item_type: "calendar_event",
    review_status: "pending",
    confidence_score: 0.62,
    title: "Northside Jets Away Game",
    family_member_name: "Marco",
    sport_activity: "Hockey",
    event_date: (() => {
      const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split("T")[0];
    })(),
    start_time: "09:00",
    location_name: "Lakefront Ice Arena",
    source_text: "Saturday morning game — Lakefront, check portal for exact time",
    flags: ["low_confidence"],
  },
  {
    id: "ei5",
    upload_id: "u1",
    item_type: "packing_item",
    review_status: "pending",
    confidence_score: 0.90,
    title: "Tournament gear checklist",
    family_member_name: "Sofia",
    packing_items: ["Jersey #7", "Shin guards", "Cleats", "Water bottle", "Sun screen", "Team snack"],
    source_text: "Reminder: bring jersey, shin guards, cleats, water bottle, sunscreen. Sofia has team snack duty this week.",
    flags: [],
  },
];

export const MOCK_EVENTS = [
  {
    id: "ae1",
    title: "Storm U10 Practice",
    event_type: "practice",
    sport_activity: "Soccer",
    event_date: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0]; })(),
    start_time: "17:30",
    end_time: "19:00",
    arrival_time: "17:15",
    leave_by_time: "17:00",
    location_name: "Riverside Soccer Complex, Field 4",
  },
  {
    id: "ae2",
    title: "Northside Jets Away Game",
    event_type: "game",
    sport_activity: "Hockey",
    event_date: (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split("T")[0]; })(),
    start_time: "09:00",
    end_time: "11:00",
    arrival_time: "08:30",
    leave_by_time: "08:00",
    location_name: "Lakefront Ice Arena",
  },
  {
    id: "ae3",
    title: "Storm U10 — State Cup Qualifier",
    event_type: "tournament",
    sport_activity: "Soccer",
    event_date: (() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().split("T")[0]; })(),
    start_time: "08:00",
    end_time: "18:00",
    location_name: "Metro Sports Complex",
    flags: [],
  },
];

export const MOCK_TASKS = [
  {
    id: "t1",
    task_type: "payment",
    title: "Tournament registration fee — Sofia",
    amount: 75,
    payable_to: "Storm Soccer Club",
    deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split("T")[0]; })(),
    status: "pending",
    is_urgent: true,
  },
  {
    id: "t2",
    task_type: "form_required",
    title: "Medical consent form — State Cup",
    form_name: "State Cup Medical Consent",
    deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; })(),
    status: "pending",
    is_urgent: false,
  },
  {
    id: "t3",
    task_type: "general_task",
    title: "Confirm carpool with Rivera family",
    status: "pending",
    is_urgent: false,
  },
];

export const MOCK_PACKING = [
  { id: "p1", item_name: "Jersey #7", category: "uniform", is_packed: false },
  { id: "p2", item_name: "Shin guards", category: "gear", is_packed: false },
  { id: "p3", item_name: "Cleats", category: "gear", is_packed: false },
  { id: "p4", item_name: "Water bottle (x2)", category: "food_drink", is_packed: false },
  { id: "p5", item_name: "Sun screen", category: "other", is_packed: false },
  { id: "p6", item_name: "Team snack — Sofia's turn", category: "food_drink", is_packed: false },
];
