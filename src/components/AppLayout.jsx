/**
 * AppLayout.jsx — Shell that wraps all authenticated routes
 *
 * Renders the page content (via <Outlet />) above the BottomNav.
 * Max-width and safe-area insets are applied here so every page
 * automatically looks right on iPhone.
 */
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";

export default function AppLayout({ pendingCount }) {
  return (
    <div className="max-w-lg mx-auto relative min-h-screen bg-slate-50 flex flex-col">
      {/* Page content — scrollable, padded above BottomNav */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Sticky bottom nav — iOS safe-area aware */}
      <BottomNav pendingCount={pendingCount} />
    </div>
  );
}
