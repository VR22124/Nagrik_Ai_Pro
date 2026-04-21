function ProgressItem({ label, done, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      className={`rounded-xl border p-3 text-left transition-colors ${
        done
          ? "bg-green-50 border-green-300 text-green-900"
          : "bg-white/70 border-slate-200 text-slate-700"
      }`}
    >
      <p className="text-sm font-medium line-clamp-2">{label}</p>
    </button>
  );
}

export default function ProgressTracker({ progress, onToggle }) {
  const keys = ["started", "documentsReady", "submitted", "verified"];
  const labels = {
    started: "Registration started",
    documentsReady: "Documents ready",
    submitted: "Submitted",
    verified: "Verified"
  };
  const completeCount = keys.filter((key) => progress[key]).length;
  const completion = Math.round((completeCount / keys.length) * 100);

  return (
    <section className="glass-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="kicker mb-1">Progress Tracker</p>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">Track Your Completion</h2>
        </div>
        <p className="text-sm font-semibold text-blue-700">{completion}%</p>
      </div>

      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-2.5">
        {keys.map((key) => (
          <ProgressItem
            key={key}
            label={labels[key]}
            done={Boolean(progress[key])}
            onToggle={() => onToggle(key)}
          />
        ))}
      </div>
    </section>
  );
}
