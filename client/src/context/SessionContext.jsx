import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signInAnonymouslyIfNeeded } from "../services/firebase";
import { saveSession as persistSession, loadSession as fetchSession } from "../services/sessionStore";

/**
 * @typedef {object} SessionContextValue
 * @property {string|null} uid - The Firebase anonymous user ID, null until auth resolves.
 * @property {boolean} sessionLoaded - True once the auth state has been determined.
 * @property {object|null} savedSession - Previously persisted session data, if any.
 * @property {Function} saveSession - Persists session data to Firestore and localStorage.
 * @property {Function} dismissSession - Clears the in-memory saved session banner.
 */

const SessionContext = createContext(null);

/**
 * SessionProvider — wraps the app tree and provides Firebase auth state
 * and Firestore session persistence to all descendant components.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child component tree.
 */
export function SessionProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [savedSession, setSavedSession] = useState(null);

  // Initialize Firebase anonymous auth and load previous session on mount.
  useEffect(() => {
    (async () => {
      const userId = await signInAnonymouslyIfNeeded();
      setUid(userId);
      if (userId) {
        const session = await fetchSession(userId);
        if (session && session.state) setSavedSession(session);
      }
      setSessionLoaded(true);
    })();
  }, []);

  /**
   * Persist session data to Firestore and localStorage.
   * @param {object} data - Session fields to persist.
   */
  const saveSession = useCallback(
    (data) => {
      persistSession(uid, data);
    },
    [uid]
  );

  /**
   * Dismiss the resume-session banner without affecting persisted data.
   */
  const dismissSession = useCallback(() => {
    setSavedSession(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{ uid, sessionLoaded, savedSession, saveSession, dismissSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export { SessionContext };
