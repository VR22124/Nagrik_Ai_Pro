import { trackEvent } from "../../services/analytics";

export default function ResumeSessionBanner({ session, onResume, onDismiss }) {
  if (!session) return null;

  function handleResume() {
    trackEvent("session_resumed", {
      state: session.state,
      scenario: session.scenario
    });
    onResume(session);
  }

  return (
    <div
      className="glass-card p-4 md:p-5 section-gap border-blue-200 bg-blue-50/40"
      role="banner"
      aria-label="Resume previous session"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            👋 Continue your voter process from where you left off
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Last session: {session.state || "Unknown state"} — {session.scenario?.replace(/_/g, " ") || "general guidance"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-primary text-sm px-4 py-2"
            onClick={handleResume}
          >
            Resume
          </button>
          <button
            type="button"
            className="btn-secondary text-sm px-4 py-2"
            onClick={onDismiss}
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
