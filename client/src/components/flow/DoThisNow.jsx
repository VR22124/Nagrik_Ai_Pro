export default function DoThisNow({ steps = [], warnings = [] }) {
  if (!steps.length && !warnings.length) return null;

  return (
    <section className="glass-card p-5 md:p-6">
      <p className="kicker mb-2">Do This Now</p>
      <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Practical Next Moves</h2>

      {steps.length ? (
        <ol className="space-y-2.5">
          {steps.map((item, idx) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-800">
              <p className="line-clamp-2">
                <span className="font-semibold text-slate-900">Step {idx + 1}: </span>
                {item}
              </p>
            </li>
          ))}
        </ol>
      ) : null}

      {warnings.length ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-amber-900 mb-2">Smart Warnings</p>
          <ul className="space-y-2">
            {warnings.map((warning) => (
              <li key={warning} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="line-clamp-2">{warning}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
