/**
 * calendar.service.js — ICS / iCalendar export
 *
 * Generates RFC 5545-compliant .ics files from ApprovedEvent records.
 * All generation is client-side — no server needed.
 *
 * Migration path: this file has zero Base44 dependencies and will move
 * unchanged to any stack.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats a Date to iCal DTSTART/DTEND format: 20240915T140000Z */
function toICalDate(dateStr, timeStr, timezone) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);

  if (!timeStr) {
    // All-day event — DATE format (no time, no Z)
    return `${String(year)}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  }

  const [hours, minutes] = timeStr.split(":").map(Number);
  // Return local time with TZID rather than UTC to respect family's timezone
  return {
    value: `${String(year)}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}00`,
    tzid: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/** Wraps long iCal lines at 75 octets (RFC 5545 §3.1) */
function foldLine(line) {
  if (line.length <= 75) return line;
  const chunks = [];
  chunks.push(line.slice(0, 75));
  let i = 75;
  while (i < line.length) {
    chunks.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join("\r\n");
}

/** Escapes text for iCal property values */
function escapeICalText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// ─── Event Rendering ──────────────────────────────────────────────────────────

function renderVEVENT(event, timezone) {
  const lines = ["BEGIN:VEVENT"];

  // UID — stable across re-exports
  lines.push(
    `UID:${event.ics_uid || `family-sync-${event.id}-${Date.now()}@familysync.app`}`
  );

  // Timestamps
  lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);

  // DTSTART / DTEND
  const dtStart = toICalDate(event.event_date, event.start_time, timezone);
  if (dtStart) {
    if (typeof dtStart === "object") {
      lines.push(`DTSTART;TZID=${dtStart.tzid}:${dtStart.value}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    }
  }

  if (event.end_time) {
    const dtEnd = toICalDate(event.event_date, event.end_time, timezone);
    if (typeof dtEnd === "object") {
      lines.push(`DTEND;TZID=${dtEnd.tzid}:${dtEnd.value}`);
    }
  }

  // Core fields
  lines.push(`SUMMARY:${escapeICalText(event.title)}`);

  if (event.location_name || event.location_address) {
    lines.push(
      `LOCATION:${escapeICalText(
        [event.location_name, event.location_address].filter(Boolean).join(", ")
      )}`
    );
  }

  // Description includes leave-by / arrival if set
  const descParts = [];
  if (event.notes) descParts.push(event.notes);
  if (event.leave_by_time)
    descParts.push(`⏰ Leave home by ${event.leave_by_time}`);
  if (event.arrival_time)
    descParts.push(`📍 Arrive by ${event.arrival_time}`);
  if (descParts.length) {
    lines.push(`DESCRIPTION:${escapeICalText(descParts.join("\\n"))}`);
  }

  // VALARM — 60 min for games/tournaments, 30 min for practices
  const isTournamentOrGame =
    event.sport_activity?.toLowerCase().includes("game") ||
    event.sport_activity?.toLowerCase().includes("tournament");

  const alarmMinutes = isTournamentOrGame ? 60 : 30;
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-PT" + alarmMinutes + "M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICalText(event.title)} reminder`,
    "END:VALARM"
  );

  // Leave-by alarm if present
  if (event.leave_by_time && event.start_time) {
    lines.push(
      "BEGIN:VALARM",
      `TRIGGER;RELATED=START:-PT${alarmMinutes + 15}M`,
      "ACTION:DISPLAY",
      `DESCRIPTION:Time to leave for ${escapeICalText(event.title)}`,
      "END:VALARM"
    );
  }

  lines.push("END:VEVENT");

  return lines.map(foldLine).join("\r\n");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a complete .ics file string from an array of ApprovedEvent records.
 *
 * @param {Object[]} events
 * @param {string}   [timezone]
 * @returns {string} RFC 5545 VCALENDAR string
 */
export function generateICS(events, timezone) {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Family Sync//AI Family Sports Organizer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Family Sync`,
    `X-WR-TIMEZONE:${tz}`,
  ].join("\r\n");

  const vevents = events.map((e) => renderVEVENT(e, tz)).join("\r\n");

  return `${header}\r\n${vevents}\r\nEND:VCALENDAR`;
}

/**
 * Triggers a browser download of a .ics file.
 *
 * @param {Object[]} events
 * @param {string}   [filename="family-sync.ics"]
 * @param {string}   [timezone]
 */
export function downloadICS(events, filename = "family-sync.ics", timezone) {
  const icsString = generateICS(events, timezone);
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL after download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads a single event as a .ics file.
 *
 * @param {Object} event
 */
export function downloadEventICS(event) {
  const slug = event.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event";
  downloadICS([event], `${slug}.ics`);
}
