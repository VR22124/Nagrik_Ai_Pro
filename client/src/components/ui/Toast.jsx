import { useEffect } from "react";
import PropTypes from "prop-types";
import { TOAST_DISMISS_MS } from "../../utils/constants";

const TYPE_STYLES = {
  info: "bg-blue-700 text-white border-blue-900",
  warning: "bg-amber-600 text-white border-amber-800",
  error: "bg-red-700 text-white border-red-900"
};

const TYPE_ICONS = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌"
};

/**
 * Toast — auto-dismissing notification banner.
 *
 * Positioned fixed at the bottom-right. Auto-dismisses after TOAST_DISMISS_MS.
 * Uses role="alert" and aria-live="assertive" for screen readers.
 *
 * @param {object} props
 * @param {string} props.message - Notification text to display.
 * @param {"info"|"warning"|"error"} [props.type="info"] - Visual severity.
 * @param {Function} props.onDismiss - Called when the toast is dismissed (manual or auto).
 */
export default function Toast({ message, type = "info", onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${TYPE_STYLES[type] || TYPE_STYLES.info}`}
    >
      <span aria-hidden="true" className="text-lg leading-none mt-0.5">
        {TYPE_ICONS[type] || TYPE_ICONS.info}
      </span>
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded ml-1 flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["info", "warning", "error"]),
  onDismiss: PropTypes.func.isRequired
};
