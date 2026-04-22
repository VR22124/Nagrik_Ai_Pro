import { useState, useCallback } from "react";
import { TOAST_DISMISS_MS } from "../utils/constants";

/**
 * @typedef {object} ToastState
 * @property {string} message - The message text to display.
 * @property {"info"|"warning"|"error"} type - Visual severity level.
 */

/**
 * useToast — lightweight toast notification state manager.
 *
 * @returns {{
 *   toast: ToastState|null,
 *   showToast: (message: string, type?: string) => void,
 *   dismissToast: () => void,
 * }}
 *
 * @example
 * const { toast, showToast, dismissToast } = useToast();
 * showToast("AI unavailable. Showing standard guidance.", "info");
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), TOAST_DISMISS_MS);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}
