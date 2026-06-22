/**
 * FamilyContext.jsx — Family state provider
 *
 * Loads and caches family + member data once at the app level.
 * All pages access family data via useFamily() — no prop drilling,
 * no duplicate fetch calls per route.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getUserFamily,
  getFamilyMembers,
  buildFamilyContext,
} from "../services/family.service.js";

const FamilyContext = createContext(null);

/**
 * Wrap authenticated routes with this provider.
 * It fetches family + members once and exposes them to all descendants.
 */
export function FamilyProvider({ children }) {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFamily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, m] = await Promise.all([getUserFamily(), getFamilyMembers()]);
      setFamily(f);
      setMembers(m || []);
    } catch (err) {
      console.error("[FamilyContext] Failed to load family:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  /**
   * The AI extraction context — passed to extraction.service.processUpload().
   * Derived from family + members so it's always in sync.
   */
  const aiContext = family ? buildFamilyContext(family, members) : {};

  const value = {
    family,
    members,
    aiContext,
    loading,
    error,
    refresh: loadFamily,
    /** Optimistically add a member without refetching */
    addMember: (member) => setMembers((prev) => [...prev, member]),
    /** Remove a member by ID */
    removeMember: (id) => setMembers((prev) => prev.filter((m) => m.id !== id)),
    /** Update a member by ID */
    updateMemberLocal: (id, data) =>
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m))),
  };

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}

/**
 * Hook to access family context from any component.
 *
 * @returns {{
 *   family: Object|null,
 *   members: Object[],
 *   aiContext: Object,
 *   loading: boolean,
 *   error: Error|null,
 *   refresh: () => void,
 *   addMember: (m: Object) => void,
 *   removeMember: (id: string) => void,
 *   updateMemberLocal: (id: string, data: Object) => void,
 * }}
 */
export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) {
    throw new Error("useFamily() must be used inside <FamilyProvider>");
  }
  return ctx;
}
