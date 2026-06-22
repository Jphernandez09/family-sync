import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FamilyProvider } from "./contexts/FamilyContext.jsx";
import { getCurrentUser } from "./services/auth.service.js";
import { getPendingCount } from "./services/review.service.js";
import { DEMO_MODE } from "./services/base44Client.js";

import AppLayout from "./components/AppLayout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import GamePlanPage from "./pages/GamePlanPage.jsx";
import FamilyPage from "./pages/FamilyPage.jsx";

export default function App() {
  const [authState, setAuthState] = useState("loading"); // "loading" | "authed" | "unauthed"
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setAuthState(user ? "authed" : "unauthed"))
      .catch(() => setAuthState(DEMO_MODE ? "authed" : "unauthed"));
  }, []);

  const refreshPending = () =>
    getPendingCount().then(setPendingCount).catch(() => {});

  useEffect(() => {
    if (authState === "authed") refreshPending();
  }, [authState]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-float animate-pulse">
            ⚽
          </div>
          <p className="text-slate-500 text-sm">Loading Family Sync…</p>
        </div>
      </div>
    );
  }

  const isAuthed = authState === "authed" || DEMO_MODE;

  if (!isAuthed) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage onAuth={() => setAuthState("authed")} />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <FamilyProvider>
      <Routes>
        <Route element={<AppLayout pendingCount={pendingCount} />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/upload"
            element={<UploadPage onUploadComplete={refreshPending} />}
          />
          <Route
            path="/review"
            element={<ReviewPage onCountChange={setPendingCount} />}
          />
          <Route path="/gameplan" element={<GamePlanPage />} />
          <Route path="/family" element={<FamilyPage />} />
        </Route>
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FamilyProvider>
  );
}
