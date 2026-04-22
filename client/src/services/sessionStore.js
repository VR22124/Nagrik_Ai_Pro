import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const LS_KEY = "nagrik_session";
let lastWriteTime = 0;
const THROTTLE_MS = 5000;

/**
 * Save session data to Firestore (with localStorage fallback).
 * Throttled to max 1 write per 5 seconds.
 */
export async function saveSession(uid, data) {
  const payload = {
    state: data.state || "",
    registrationStatus: data.registrationStatus || "",
    scenario: data.scenario || "",
    intent: data.intent || "",
    lastStep: data.lastStep || "guidance_generated",
    timestamp: Date.now()
  };

  // Always save to localStorage as fallback
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    // localStorage might be unavailable
  }

  // Throttle Firestore writes
  const now = Date.now();
  if (now - lastWriteTime < THROTTLE_MS) return;
  lastWriteTime = now;

  if (!db || !uid) return;

  try {
    await setDoc(doc(db, "user_sessions", uid), payload, { merge: true });
  } catch (err) {
    // Silent failure
  }
}

/**
 * Load session data from Firestore (with localStorage fallback).
 */
export async function loadSession(uid) {
  // Try Firestore first
  if (db && uid) {
    try {
      const snap = await getDoc(doc(db, "user_sessions", uid));
      if (snap.exists()) return snap.data();
    } catch (err) {
      // Silent failure
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage unavailable or corrupt
  }

  return null;
}

/**
 * Clear saved session.
 */
export function clearSession() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}
