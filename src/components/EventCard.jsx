import { MapPin, Clock, User, AlertTriangle, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import Badge from "./ui/Badge.jsx";
import clsx from "clsx";

const sportEmoji = {
  soccer: "⚽",
  hockey: "🏒",
  basketball: "🏀",
  baseball: "⚾",
  softball: "🥎",
  swimming: "🏊",
  gymnastics: "🤸",
  tennis: "🎾",
  volleyball: "🏐",
  lacrosse: "🥍",
  football: "🏈",
  camp: "🏕️",
  school: "🎒",
  default: "📅",
};

function getSportEmoji(sport) {
  if (!sport) return sportEmoji.default;
  const key = sport.toLowerCase();
  return sportEmoji[key] || sportEmoji.default;
}

function formatEventDate(dateStr) {
  if (!dateStr) return null;
  try {
    return format(parseISO(dateStr), "EEE, MMM d");
  } catch {
    return dateStr;
  }
}

function formatTime(t) {
  if (!t) return null;
  // HH:MM → h:mm AM/PM
  try {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return t;
  }
}

export default function EventCard({ event, onClick, showSource = false }) {
  const hasConflict = event.flags?.includes("possible_conflict");
  const isLowConfidence = event.flags?.includes("low_confidence") || event.confidence_score < 0.7;

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-2xl shadow-card p-4 cursor-pointer",
        "active:scale-[0.98] transition-transform duration-100 hover:shadow-card-hover",
        hasConflict && "border-l-4 border-orange-400"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Sport emoji avatar */}
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
          {getSportEmoji(event.sport_activity)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight pr-1">
              {event.title}
            </h3>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mt-0.5" />
          </div>

          {/* Family member */}
          {event.family_member_name && (
            <div className="flex items-center gap-1 mt-1">
              <User size={11} className="text-slate-400" />
              <span className="text-xs text-slate-500">{event.family_member_name}</span>
            </div>
          )}

          {/* Date + time */}
          {event.event_date && (
            <div className="flex items-center gap-1 mt-1">
              <Clock size={11} className="text-slate-400" />
              <span className="text-xs text-slate-600 font-medium">
                {formatEventDate(event.event_date)}
                {event.start_time && ` · ${formatTime(event.start_time)}`}
                {event.end_time && ` – ${formatTime(event.end_time)}`}
              </span>
            </div>
          )}

          {/* Location */}
          {event.location_name && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-slate-400" />
              <span className="text-xs text-slate-500 truncate">{event.location_name}</span>
            </div>
          )}

          {/* Flags */}
          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            {isLowConfidence && (
              <Badge color="yellow">
                <AlertTriangle size={9} className="mr-1" />
                Check date
              </Badge>
            )}
            {hasConflict && <Badge color="orange">Conflict</Badge>}
            {event.flags?.includes("needs_payment") && <Badge color="blue">💰 Payment</Badge>}
            {event.flags?.includes("needs_form") && <Badge color="purple">📋 Form</Badge>}
            {event.flags?.includes("time_sensitive") && <Badge color="red">Urgent</Badge>}
            {event.is_recurring && <Badge color="gray">Recurring</Badge>}
          </div>
        </div>
      </div>

      {showSource && event.source_text && (
        <p className="mt-3 text-xs text-slate-400 italic border-t border-slate-50 pt-2 line-clamp-2">
          "{event.source_text}"
        </p>
      )}
    </div>
  );
}
