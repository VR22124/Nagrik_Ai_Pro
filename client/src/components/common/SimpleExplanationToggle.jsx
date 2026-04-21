export default function SimpleExplanationToggle({ enabled, onToggle, loading }) {
  return (
    <button
      className="btn-secondary"
      type="button"
      onClick={onToggle}
      disabled={loading}
      aria-live="polite"
    >
      {loading ? "Simplifying..." : enabled ? "Show Detailed Guidance" : "Explain Simply"}
    </button>
  );
}
