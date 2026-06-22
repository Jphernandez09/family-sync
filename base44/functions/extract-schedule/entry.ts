/**
 * Family Sync — AI Schedule Extraction Function
 *
 * Takes raw text (from pasted email, OCR'd image, or PDF) and returns
 * a normalized array of extracted items ready for parent review.
 *
 * Invoked via: base44.functions.invoke("extract-schedule", { rawText, familyContext })
 */

import { base44 } from "@base44/sdk/functions";

interface FamilyContext {
  memberNames: string[];   // e.g. ["Sofia", "Marco", "Dad", "Mom"]
  sports: string[];        // e.g. ["soccer", "hockey", "swimming"]
  teamNames: string[];     // e.g. ["Storm U10", "Lightning"]
  homeLocation?: string;   // e.g. "Chicago, IL"
}

interface ExtractedItem {
  item_type:
    | "calendar_event"
    | "task"
    | "payment"
    | "form_required"
    | "packing_item"
    | "travel_note"
    | "conflict_warning"
    | "general_note";
  confidence_score: number;
  title: string;
  description?: string;
  sport_activity?: string;
  family_member_name?: string;
  event_date?: string;         // ISO date YYYY-MM-DD
  start_time?: string;         // HH:MM 24hr
  end_time?: string;
  arrival_time?: string;
  leave_by_time?: string;
  location_name?: string;
  location_address?: string;
  deadline?: string;           // ISO date for tasks/forms/payments
  amount?: number;
  payable_to?: string;
  payment_method?: string;
  form_name?: string;
  form_url?: string;
  packing_items?: string[];
  uniform_notes?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  source_text?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  flags?: string[];
}

interface ExtractionResult {
  items: ExtractedItem[];
  summary: string;
  extraction_confidence: number;
  raw_prompt_used?: string;
}

export default async function handler(input: {
  rawText: string;
  familyContext?: FamilyContext;
  uploadId?: string;
}) {
  const { rawText, familyContext } = input;

  if (!rawText || rawText.trim().length < 10) {
    return {
      items: [],
      summary: "No meaningful content to extract.",
      extraction_confidence: 0,
    } as ExtractionResult;
  }

  const memberContext = familyContext?.memberNames?.length
    ? `Family members: ${familyContext.memberNames.join(", ")}`
    : "Family members: unknown";

  const sportsContext = familyContext?.sports?.length
    ? `Known sports/activities: ${familyContext.sports.join(", ")}`
    : "";

  const teamsContext = familyContext?.teamNames?.length
    ? `Known team names: ${familyContext.teamNames.join(", ")}`
    : "";

  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are an AI assistant for Family Sync, a family sports organizer app.
Your job is to extract structured information from messy schedule content — coach emails, tournament PDFs, camp notices, school reminders, permission slips, pasted text, and screenshots.

Today's date: ${today}
${memberContext}
${sportsContext}
${teamsContext}

Extract ALL actionable items from the provided text. Be thorough — parents miss things.

For each item, determine its type:
- calendar_event: A game, practice, tournament, camp session, school event, or any time-based event
- task: Something the parent needs to do (register, sign up, submit something)
- payment: A fee, registration cost, or payment due
- form_required: Permission slip, waiver, medical form, registration form
- packing_item: Gear, equipment, uniform, or items to bring
- travel_note: Parking info, carpool notes, gate codes, venue directions
- conflict_warning: Two events that might overlap or conflict
- general_note: Important info that doesn't fit above categories

Rules:
1. Assign confidence_score 0.0–1.0. Use 0.9+ only when date/time/location are explicit. Use 0.6–0.79 when inferred or partial.
2. Always try to match family_member_name to one of the known family members.
3. Parse dates into ISO YYYY-MM-DD format. If the year is ambiguous, assume the nearest future date.
4. Parse times into HH:MM 24hr format.
5. If arrival_time is mentioned separately, include it. If not but a "warm-up" or "check-in" is mentioned, infer arrival_time as 15–30 min before start_time.
6. Estimate leave_by_time only when location_address is provided or home_location is known — otherwise omit it.
7. For recurring events, set is_recurring: true and describe the recurrence_pattern in plain English.
8. Add flags array with relevant: "needs_payment", "needs_form", "low_confidence" (score < 0.7), "possible_conflict", "time_sensitive" (deadline within 7 days).
9. Include source_text — the exact excerpt from the input that produced this item (max 200 chars).
10. Do NOT duplicate items. If the same event appears multiple times in the text, create ONE item.

Return a JSON object with this exact shape:
{
  "items": [...],
  "summary": "One sentence describing what was found overall",
  "extraction_confidence": 0.0-1.0
}`;

  const userPrompt = `Extract all schedule items from this content:\n\n---\n${rawText.slice(0, 8000)}\n---`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      system_prompt: systemPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item_type: { type: "string" },
                confidence_score: { type: "number" },
                title: { type: "string" },
                description: { type: "string" },
                sport_activity: { type: "string" },
                family_member_name: { type: "string" },
                event_date: { type: "string" },
                start_time: { type: "string" },
                end_time: { type: "string" },
                arrival_time: { type: "string" },
                leave_by_time: { type: "string" },
                location_name: { type: "string" },
                location_address: { type: "string" },
                deadline: { type: "string" },
                amount: { type: "number" },
                payable_to: { type: "string" },
                payment_method: { type: "string" },
                form_name: { type: "string" },
                form_url: { type: "string" },
                packing_items: { type: "array", items: { type: "string" } },
                uniform_notes: { type: "string" },
                contact_name: { type: "string" },
                contact_phone: { type: "string" },
                contact_email: { type: "string" },
                source_text: { type: "string" },
                is_recurring: { type: "boolean" },
                recurrence_pattern: { type: "string" },
                flags: { type: "array", items: { type: "string" } },
              },
              required: ["item_type", "confidence_score", "title"],
            },
          },
          summary: { type: "string" },
          extraction_confidence: { type: "number" },
        },
        required: ["items", "summary", "extraction_confidence"],
      },
    });

    // Normalize and sanitize the response
    const result = response as ExtractionResult;

    result.items = result.items.map((item) => ({
      ...item,
      // Ensure confidence flags
      flags: [
        ...(item.flags || []),
        ...(item.confidence_score < 0.7 && !item.flags?.includes("low_confidence")
          ? ["low_confidence"]
          : []),
      ],
    }));

    return result;
  } catch (error) {
    console.error("Extraction failed:", error);
    return {
      items: [],
      summary: "Extraction failed. Please try again or enter items manually.",
      extraction_confidence: 0,
      error: String(error),
    };
  }
}
