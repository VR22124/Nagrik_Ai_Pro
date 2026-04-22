import PropTypes from "prop-types";

/**
 * SimpleExplanationToggle — button that triggers Gemini-powered plain-language mode.
 * Displays a "Simplified by Gemini AI" badge when the simple mode is active.
 *
 * @param {object} props
 * @param {boolean} props.enabled - Whether simple-explanation mode is currently on.
 * @param {Function} props.onToggle - Callback to toggle the mode.
 * @param {boolean} props.loading - Whether Gemini is currently fetching.
 */
export default function SimpleExplanationToggle({ enabled, onToggle, loading }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {enabled && !loading && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
          ✨ Simplified by Gemini AI
        </span>
      )}
      <button
        className="btn-secondary"
        type="button"
        onClick={onToggle}
        disabled={loading}
        aria-live="polite"
      >
        {loading ? "Simplifying..." : enabled ? "Show Detailed Guidance" : "Explain Simply"}
      </button>
    </div>
  );
}

SimpleExplanationToggle.propTypes = {
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};
