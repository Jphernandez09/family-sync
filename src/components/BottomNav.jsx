import { NavLink } from "react-router-dom";
import { Home, Upload, ClipboardCheck, CalendarDays, Users } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/",          label: "Home",    Icon: Home },
  { to: "/upload",    label: "Upload",  Icon: Upload },
  { to: "/review",    label: "Review",  Icon: ClipboardCheck },
  { to: "/gameplan",  label: "GamePlan",Icon: CalendarDays },
  { to: "/family",    label: "Family",  Icon: Users },
];

export default function BottomNav({ pendingCount = 0 }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-float"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px]",
                "text-xs font-medium transition-colors duration-150",
                isActive ? "text-brand-500" : "text-slate-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? "text-brand-500" : "text-slate-400"}
                  />
                  {/* Pending badge on Review tab */}
                  {label === "Review" && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-brand-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
