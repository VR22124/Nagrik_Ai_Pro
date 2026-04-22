import { API_BASE_URL } from "./apiBase";

/**
 * Log an anonymous session event to the backend (which forwards to Google Sheets).
 * Fire-and-forget — callers must NOT await this unless they have a specific reason.
 *
 * @param {{ state: string, scenario: string, action: string }} payload
 */
export async function logSession({ state, scenario, action }) {
  try {
    await fetch(`${API_BASE_URL}/api/logs/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, scenario, action })
    });
  } catch {
    // Silent — analytics logging must never affect user experience
  }
}
