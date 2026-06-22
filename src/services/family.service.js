/**
 * family.service.js — Family profile and member management
 *
 * Manages the Family and FamilyMember entities. Also exports
 * buildFamilyContext() which packages member data for the AI extraction
 * function without coupling the AI layer to entity shape.
 *
 * Migration path: replace entity calls with your new database client.
 */
import { entities, DEMO_MODE } from "./base44Client.js";
import { MOCK_FAMILY, MOCK_FAMILY_MEMBERS } from "./mock/mockData.js";

// ─── Family ──────────────────────────────────────────────────────────────────

/**
 * Returns the first family for the current user.
 * Base44 RLS ensures users only see their own families.
 * @returns {Promise<Object|null>}
 */
export async function getUserFamily() {
  if (DEMO_MODE) return MOCK_FAMILY;
  const families = await entities.Family.filter({});
  return families?.[0] ?? null;
}

/** @param {{ name: string, home_location?: string, timezone?: string }} data */
export async function createFamily(data) {
  if (DEMO_MODE) return { ...MOCK_FAMILY, ...data, id: "demo-family" };
  return entities.Family.create(data);
}

export async function updateFamily(id, data) {
  if (DEMO_MODE) return { ...MOCK_FAMILY, ...data };
  return entities.Family.update(id, data);
}

// ─── Family Members ───────────────────────────────────────────────────────────

/** @returns {Promise<Object[]>} */
export async function getFamilyMembers() {
  if (DEMO_MODE) return MOCK_FAMILY_MEMBERS;
  const members = await entities.FamilyMember.filter({});
  return members || [];
}

/** @param {Object} data */
export async function createFamilyMember(data) {
  if (DEMO_MODE) {
    return { ...data, id: `member-${Date.now()}` };
  }
  return entities.FamilyMember.create(data);
}

export async function updateFamilyMember(id, data) {
  if (DEMO_MODE) return { id, ...data };
  return entities.FamilyMember.update(id, data);
}

export async function deleteFamilyMember(id) {
  if (DEMO_MODE) return;
  return entities.FamilyMember.delete(id);
}

// ─── AI Context Builder ───────────────────────────────────────────────────────

/**
 * Packages family data into the shape the AI extraction function expects.
 * This is the bridge between entity data and the AI provider interface —
 * neither knows about the other's internal structure.
 *
 * @param {Object} family
 * @param {Object[]} members
 * @returns {{ memberNames: string[], sports: string[], teamNames: string[], homeLocation?: string }}
 */
export function buildFamilyContext(family, members) {
  return {
    memberNames: members.map((m) => m.name).filter(Boolean),
    sports: [...new Set(members.flatMap((m) => m.sports || []))],
    teamNames: [...new Set(members.flatMap((m) => m.team_names || []))],
    homeLocation: family?.home_location,
    timezone: family?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
