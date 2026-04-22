/**
 * constants.js
 * Central source of truth for all magic values used across the frontend.
 * Organized into sections: Voter Rules, Form Options, API, Firebase, UI.
 */

// ─── Voter Rules ─────────────────────────────────────────────────────────────

/** Minimum age to be eligible to vote in Indian elections. */
export const MIN_VOTING_AGE = 18;

// ─── Form Options ─────────────────────────────────────────────────────────────

/** All voter registration scenarios available in the guidance form. */
export const SCENARIOS = [
  { value: "first_time", label: "First-time voter" },
  { value: "first_time_migrated", label: "First-time + Migrated" },
  { value: "migrated", label: "Migrated voter" },
  { value: "lost_id", label: "Lost voter ID" },
  { value: "correction", label: "Correction needed" },
  { value: "unknown_status", label: "Unknown registration status" }
];

/** Registration status options for the guidance form. */
export const REGISTRATION_STATUSES = [
  { value: "registered", label: "Registered" },
  { value: "not_registered", label: "Not registered" },
  { value: "unsure", label: "Unsure" }
];

/** Migration type options for the guidance form. */
export const MIGRATION_TYPES = [
  { value: "unspecified", label: "Migration type (optional)" },
  { value: "intra_state", label: "Moved within same state" },
  { value: "inter_state", label: "Moved from another state" }
];

/** Address proof availability options for the guidance form. */
export const ADDRESS_PROOF_OPTIONS = [
  { value: "true", label: "I have current address proof" },
  { value: "false", label: "I do not have current address proof" }
];

// ─── API ──────────────────────────────────────────────────────────────────────

/** Base URL for all backend API calls. Falls back to production Render URL. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://nagrik-ai-pro.onrender.com/api";

/** Maximum number of words to show in Gemini-simplified explanations. */
export const GEMINI_MAX_WORDS = 95;

/** Timeout in ms for Gemini API calls before aborting. */
export const GEMINI_TIMEOUT_MS = 8000;

// ─── Firebase ─────────────────────────────────────────────────────────────────

/** Firestore collection name for persisted user sessions. */
export const FIRESTORE_SESSIONS_COLLECTION = "user_sessions";

/** localStorage key for the offline session fallback. */
export const LS_SESSION_KEY = "nagrik_session";

/** Minimum ms between Firestore write operations (throttle). */
export const SESSION_THROTTLE_MS = 5000;

// ─── UI ───────────────────────────────────────────────────────────────────────

/** Duration in ms before a Toast auto-dismisses. */
export const TOAST_DISMISS_MS = 5000;

/** Debounce delay in ms for input handlers (reserved for future use). */
export const DEBOUNCE_DELAY_MS = 300;

/** Section titles used in the guided flow cards (static list — index keys are stable). */
export const FLOW_TITLES = ["What You Should Do", "Be Careful", "Why This Matters"];
