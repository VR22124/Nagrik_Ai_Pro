import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";

/**
 * Track a GA4 event. Silent no-op if analytics is unavailable.
 * Never includes PII — age and state are aggregated, not identifying.
 *
 * @param {string} eventName - GA4 event name (snake_case).
 * @param {object} [params={}] - Optional event parameters (no PII).
 */
export function trackEvent(eventName, params = {}) {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {
    // Analytics is optional — never break the app
  }
}

/**
 * Convenience tracker: fires when guidance is successfully returned.
 * @param {{ state: string, scenario: string }} params
 */
export function trackGuidanceShown(params) {
  trackEvent("guidance_shown", params);
}

/**
 * Convenience tracker: fires when Gemini simplification is displayed.
 * @param {{ state: string }} params
 */
export function trackGeminiSimplified(params) {
  trackEvent("gemini_simplified", params);
}

/**
 * Convenience tracker: fires when the user clicks a Maps link.
 * @param {{ category: string, location: string }} params
 */
export function trackMapsClicked(params) {
  trackEvent("maps_link_clicked", params);
}

/**
 * Convenience tracker: fires when the user clicks a Translate link.
 */
export function trackTranslateClicked() {
  trackEvent("translate_link_clicked");
}
