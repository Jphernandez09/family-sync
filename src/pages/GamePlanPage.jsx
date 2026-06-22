import { useEffect, useState } from "react";
import { format, parseISO, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { Download, ChevronLeft, ChevronRight, AlertTriangle, Package } from "lucide-react";
import { getWeeklyEvents } from "../services/events.service.js";
import { getPendingTasks, getPackingItems, togglePackingItem } from "../services/tasks.service.js";
import { downloadICS } from "../services/calendar.service.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";

function timeStr(t) {
  if (!t) return "";
  try {
    const [h, m] = t.split(":").map(Number);
    const d = new Date(); d.setHours(h, m);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch { return t; }
}

function DayColumn({ date, events, isCurrentDay }) {
  return (
    <div className={`flex-shrink-0 w-[72px] ${isCurrentDay ? "opacity-100" : "opacity-70"}`}>
      <div className={`text-center mb-2 py-1.5 rounded-xl ${isCurrentDay ? "bg-brand-500" : "bg-transparent"}`}>
        <p className={`text-xs font-medium ${isCurrentDay ? "text-white/80" : "text-slate-400"}`}>
          {format(date, "EEE")}
        </p>
        <p className={`text-lg font-bold leading-none mt-0.5 ${isCurrentDay ? "text-white" : "text-slate-700"}`}>
          {format(date, "d")}
        </p>
      </div>
      <div className="space-y-1.5">
        {events.map((e, i) => (
          <div key={i} className="bg-brand-50 border border-brand-100 rounded-lg px-1.5 py-1 text-center">
            <p className="text-[10px] font-semibold text-brand-700 leading-tight truncate">{e.title}</p>
            {e.start_time && (
              <p className="text-[9px] text-brand-500 mt-0.5">{timeStr(e.start_time)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GamePlanPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [packingItems, setPackingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`;

  useEffect(() => {
    loadData();
  }, [weekOffset]);

  async function loadData() {
    setLoading(true);
    try {
      const [evts, tkItems, packItems] = await Promise.all([
        getWeeklyEvents(weekOffset),
        getPendingTasks(),
        getPackingItems(),
      ]);
      setEvents(evts);
      setTasks(tkItems);
      setPackingItems(packItems);
    } catch (err) {
      console.error("[GamePlanPage] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function eventsForDay(date) {
    return events.filter((e) => {
      try { return isSameDay(parseISO(e.event_date), date); }
      catch { return false; }
    });
  }

  async function handleTogglePacking(item) {
    const next = !item.is_packed;
    setPackingItems((prev) =>
      prev.map((p) => p.id === item.id ? { ...p, is_packed: next } : p)
    );
    togglePackingItem(item.id, next).catch(console.error);
  }

  function handleExportICS() {
    const evts = events;
    if (!evts.length) return;
    downloadICS(evts, `family-sync-${format(weekStart, "yyyy-MM-dd")}.ics`);
  }

  const weeklyEvents = events;
  const urgentTasks = tasks.filter((t) => t.is_urgent || t.task_type === "payment");
  const conflicts = events.filter((e) => e.flags?.includes("possible_conflict"));

  return (
    <div className="page-content px-4 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">GamePlan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your weekly family playbook</p>
        </div>
        {weeklyEvents.length > 0 && (
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportICS}>
            Export .ics
          </Button>
        )}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card px-4 py-3">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">{weekLabel}</p>
          {weekOffset === 0 && (
            <span className="text-xs text-brand-500 font-medium">This week</span>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 7-day strip */}
      <div className="bg-white rounded-2xl shadow-card p-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max">
          {weekDays.map((day) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              events={eventsForDay(day)}
              isCurrentDay={isToday(day)}
            />
          ))}
        </div>
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Possible schedule conflict</p>
            <p className="text-xs text-orange-600 mt-0.5">
              {conflicts.map((c) => c.title).join(", ")} — review times
            </p>
          </div>
        </div>
      )}

      {/* Events list */}
      <section>
        <h2 className="font-bold text-slate-700 mb-3">
          This Week's Events
          {weeklyEvents.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({weeklyEvents.length})
            </span>
          )}
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : weeklyEvents.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-sm text-slate-500">No events this week</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {weeklyEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-lg flex-shrink-0">
                    ⚽
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {event.event_date && format(parseISO(event.event_date), "EEE, MMM d")}
                      {event.start_time && ` · ${timeStr(event.start_time)}`}
                      {event.end_time && ` – ${timeStr(event.end_time)}`}
                    </p>
                    {event.location_name && (
                      <p className="text-xs text-slate-400 mt-0.5">📍 {event.location_name}</p>
                    )}
                    {event.leave_by_time && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        🚗 Leave by {timeStr(event.leave_by_time)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Action items */}
      {tasks.length > 0 && (
        <section>
          <h2 className="font-bold text-slate-700 mb-3">
            Action Items
            {urgentTasks.length > 0 && <Badge color="orange" className="ml-2">{urgentTasks.length} urgent</Badge>}
          </h2>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl shadow-card p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-base flex-shrink-0">
                  {task.task_type === "payment" ? "💰" : task.task_type === "form_required" ? "📋" : "✅"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                  {task.deadline && <p className="text-xs text-slate-400">Due {task.deadline}</p>}
                </div>
                {task.is_urgent && <Badge color="red">Urgent</Badge>}
                {task.amount != null && (
                  <span className="text-sm font-bold text-green-600">${task.amount}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Packing list */}
      {packingItems.length > 0 && (
        <section>
          <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Package size={16} />
            Packing List
          </h2>
          <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-50">
            {packingItems.map((item, i) => (
              <button
                key={item.id || i}
                onClick={() => handleTogglePacking(item)}
                className="flex items-center gap-3 p-3.5 w-full text-left active:bg-slate-50 transition-colors"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  item.is_packed ? "bg-green-500 border-green-500" : "border-slate-200"
                }`}>
                  {item.is_packed && <span className="text-white text-[10px]">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${item.is_packed ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {item.item_name}
                  </p>
                </div>
                <Badge color="gray">{item.category}</Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* What could be missed */}
      {(weeklyEvents.length > 0 || tasks.length > 0) && (
        <section className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <h2 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={15} />
            What Could Be Missed?
          </h2>
          <ul className="space-y-1.5">
            {tasks.some((t) => t.task_type === "payment") && (
              <li className="text-xs text-amber-700">💰 Outstanding payment — check deadlines</li>
            )}
            {tasks.some((t) => t.task_type === "form_required") && (
              <li className="text-xs text-amber-700">📋 Form or waiver still needs signing</li>
            )}
            {packingItems.length > 0 && (
              <li className="text-xs text-amber-700">🎒 {packingItems.length} packing item{packingItems.length !== 1 ? "s" : ""} not yet checked off</li>
            )}
            {weeklyEvents.some((e) => !e.leave_by_time) && (
              <li className="text-xs text-amber-700">🚗 Some events don't have leave-by times set</li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
