import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";

/**
 * Track a GA4 event. Silent no-op if analytics is unavailable.
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
