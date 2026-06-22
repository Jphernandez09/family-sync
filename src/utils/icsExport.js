/**
 * iCalendar (.ics) export utility
 * Generates a valid RFC 5545 calendar file from approved events.
 */

function escapeICS(str) {
  return (str || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toICSDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const date = dateStr.replace(/-/g, "");
  if (!timeStr) return `${date}`;
  const time = timeStr.replace(":", "") + "00";
  return `${date}T${time}`;
}

function formatDTSTAMP() {
  return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateICS(events) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Family Sync//Family Sports Organizer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Family Sync",
    "X-WR-TIMEZONE:America/Chicago",
  ];

  for (const event of events) {
    const uid = event.ics_uid || `family-sync-${event.id}-${Date.now()}@familysync.app`;
    const dtstart = toICSDate(event.event_date, event.start_time);
    const dtend = toICSDate(event.event_date, event.end_time);
    const dtstamp = formatDTSTAMP();

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);

    if (dtstart) {
      if (event.start_time) {
        lines.push(`DTSTART:${dtstart}`);
      } else {
        lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      }
    }

    if (dtend && event.end_time) {
      lines.push(`DTEND:${dtend}`);
    } else if (dtstart && event.start_time) {
      // Default 1 hour if no end time
      const [h, m] = (event.start_time || "00:00").split(":").map(Number);
      const endH = String(h + 1).padStart(2, "0");
      lines.push(`DTEND:${event.event_date.replace(/-/g, "")}T${endH}${String(m).padStart(2, "0")}00`);
    }

    lines.push(`SUMMARY:${escapeICS(event.title)}`);

    if (event.location_name || event.location_address) {
      lines.push(`LOCATION:${escapeICS(event.location_address || event.location_name)}`);
    }

    const descParts = [];
    if (event.sport_activity) descParts.push(`Sport: ${event.sport_activity}`);
    if (event.arrival_time) descParts.push(`Arrive by: ${event.arrival_time}`);
    if (event.leave_by_time) descParts.push(`Leave home by: ${event.leave_by_time}`);
    if (event.notes) descParts.push(event.notes);
    if (descParts.length) lines.push(`DESCRIPTION:${escapeICS(descParts.join("\\n"))}`);

    // Reminder alarm — 1 hour before for games/tournaments, 30 min for practices
    const alarmMin = event.event_type === "practice" ? 30 : 60;
    lines.push("BEGIN:VALARM");
    lines.push("TRIGGER:-PT" + alarmMin + "M");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:${escapeICS(event.title)} reminder`);
    lines.push("END:VALARM");

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Download a single event as .ics
 */
export function downloadEventICS(event) {
  const content = generateICS([event]);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
