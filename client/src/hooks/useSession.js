import { useContext } from "react";
import { SessionContext } from "../context/SessionContext";

/**
 * useSession — convenience hook for consuming SessionContext.
 *
 * Must be used inside a <SessionProvider> or it will throw.
 *
 * @returns {import('../context/SessionContext').SessionContextValue}
 *
 * @example
 * const { uid, saveSession } = useSession();
 */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
