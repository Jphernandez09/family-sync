import { useState } from "react";
import { Check, X, Edit3, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
import clsx from "clsx";

const typeConfig = {
  calendar_event: { label: "Event",    color: "blue",   emoji: "📅" },
  task:           { label: "Task",     color: "orange", emoji: "✅" },
  payment:        { label: "Payment",  color: "green",  emoji: "💰" },
  form_required:  { label: "Form",     color: "purple", emoji: "📋" },
  packing_item:   { label: "Pack",     color: "gray",   emoji: "🎒" },
  travel_note:    { label: "Travel",   color: "blue",   emoji: "🚗" },
  conflict_warning: { label: "Conflict", color: "orange", emoji: "⚠️" },
  general_note:   { label: "Note",     color: "gray",   emoji: "📝" },
};

function ConfidenceDot({ score }) {
  const color = score >= 0.8 ? "bg-green-400" : score >= 0.6 ? "bg-yellow-400" : "bg-red-400";
  return (
    <span title={`AI confidence: ${Math.round(score * 100)}%`}
          className={clsx("inline-block w-2 h-2 rounded-full flex-shrink-0", color)} />
  );
}

export default function ReviewCard({ item, onApprove, onReject, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[item.item_type] || typeConfig.general_note;
  const isLow = item.confidence_score < 0.7;

  return (
    <div className={clsx(
      "bg-white rounded-2xl shadow-card overflow-hidden",
      isLow && "ring-1 ring-yellow-200"
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg flex-shrink-0">
            {cfg.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color={cfg.color}>{cfg.label}</Badge>
              {isLow && (
                <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                  <AlertTriangle size={11} />
                  Low confidence
                </span>
              )}
              <ConfidenceDot score={item.confidence_score} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mt-1 leading-tight">
              {item.title}
            </h3>

            {/* Key info line */}
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              {item.family_member_name && <p>👤 {item.family_member_name}</p>}
              {item.event_date && (
                <p>
                  📅{" "}
                  {(() => {
                    try { return format(parseISO(item.event_date), "EEE, MMM d"); }
                    catch { return item.event_date; }
                  })()}
                  {item.start_time && ` · ${item.start_time}`}
                </p>
              )}
              {item.location_name && <p>📍 {item.location_name}</p>}
              {item.amount != null && <p>💲 ${item.amount}{item.payable_to ? ` → ${item.payable_to}` : ""}</p>}
              {item.deadline && <p>⏰ Due: {item.deadline}</p>}
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
            {item.description && (
              <p className="text-xs text-slate-600">{item.description}</p>
            )}
            {item.packing_items?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Pack:</p>
                <div className="flex flex-wrap gap-1">
                  {item.packing_items.map((p, i) => (
                    <Badge key={i} color="gray">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
            {item.source_text && (
              <div className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-xs text-slate-400 italic">"{item.source_text}"</p>
              </div>
            )}
            {item.recurrence_pattern && (
              <p className="text-xs text-slate-500">🔁 {item.recurrence_pattern}</p>
            )}
            {item.contact_name && (
              <p className="text-xs text-slate-500">
                👤 {item.contact_name}
                {item.contact_phone && ` · ${item.contact_phone}`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100">
        <Button
          variant="danger"
          size="sm"
          icon={X}
          onClick={() => onReject(item)}
          className="flex-1"
        >
          Skip
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={Edit3}
          onClick={() => onEdit(item)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="success"
          size="sm"
          icon={Check}
          onClick={() => onApprove(item)}
          className="flex-1"
        >
          Approve
        </Button>
      </div>
    </div>
  );
}
