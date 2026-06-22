import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ChevronRight, ArrowUpRight, Bell, Sparkles } from "lucide-react";
import { useFamily } from "../contexts/FamilyContext.jsx";
import { getCurrentUser } from "../services/auth.service.js";
import { getWeeklyEvents } from "../services/events.service.js";
import { getPendingTasks } from "../services/tasks.service.js";
import { getPendingCount } from "../services/review.service.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

function DayLabel(dateStr) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE, MMM d");
  } catch { return dateStr; }
}

export default function HomePage() {
  const navigate = useNavigate();
  const { family } = useFamily();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [me, evts, tkItems, pending] = await Promise.all([
          getCurrentUser().catch(() => null),
          getWeeklyEvents(0),
          getPendingTasks(),
          getPendingCount(),
        ]);
        setUser(me);
        setEvents(evts.slice(0, 5));
        setTasks(tkItems.slice(0, 4));
        setPendingCount(pending);
      } catch (err) {
        console.error("[HomePage] Load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const urgentTasks = tasks.filter((t) => t.is_urgent || t.task_type === "payment");

  return (
    <div className="page-content px-4 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hey{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <Bell size={16} className="text-slate-600" />
        </button>
      </div>

      {/* Review CTA banner — show only when pending items exist */}
      {pendingCount > 0 && (
        <div
          onClick={() => navigate("/review")}
          className="bg-brand-500 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">
              {pendingCount} item{pendingCount !== 1 ? "s" : ""} need your review
            </p>
            <p className="text-white/70 text-xs mt-0.5">Tap to approve or skip</p>
          </div>
          <ChevronRight size={18} className="text-white/60" />
        </div>
      )}

      {/* This week section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-700">This Week</h2>
          <button
            onClick={() => navigate("/gameplan")}
            className="text-xs text-brand-500 font-medium flex items-center gap-1"
          >
            Full plan <ArrowUpRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm font-medium text-slate-600">Nothing on the schedule yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload something to get started</p>
            <button
              onClick={() => navigate("/upload")}
              className="mt-3 text-brand-500 text-sm font-semibold"
            >
              Upload schedule →
            </button>
          </Card>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate("/gameplan")}
                className="bg-white rounded-2xl shadow-card p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-base flex-shrink-0">
                  ⚽
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{event.title}</p>
                  <p className="text-xs text-slate-400">
                    {DayLabel(event.event_date)}
                    {event.start_time && ` · ${event.start_time}`}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Action items */}
      {tasks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-700">Action Items</h2>
            {urgentTasks.length > 0 && (
              <Badge color="orange">{urgentTasks.length} urgent</Badge>
            )}
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-card p-3.5 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-base flex-shrink-0">
                  {task.task_type === "payment" ? "💰" : task.task_type === "form_required" ? "📋" : "✅"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                  {task.deadline && (
                    <p className="text-xs text-slate-400">Due {task.deadline}</p>
                  )}
                </div>
                {task.amount != null && (
                  <span className="text-sm font-bold text-green-600">${task.amount}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upload prompt */}
      <div
        onClick={() => navigate("/upload")}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center gap-2 cursor-pointer active:bg-slate-50 transition-colors"
      >
        <div className="text-2xl">📤</div>
        <p className="text-sm font-medium text-slate-600">Got more chaos?</p>
        <p className="text-xs text-slate-400 text-center">Upload a screenshot, email, or PDF</p>
      </div>
    </div>
  );
}
