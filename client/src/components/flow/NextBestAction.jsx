import React from "react";

export default function NextBestAction({ action, ctaLabel, timeEstimate, onStart }) {
  if (!action) return null;
  return (
    <section className="glass-card p-6 md:p-7 flex flex-col gap-4 border-blue-200">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎯</span>
        <p className="kicker">Your Next Step</p>
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-slate-900 leading-snug line-clamp-2">{action}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn-primary px-5 py-2.5 text-sm md:text-base shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={onStart}
          type="button"
        >
          {ctaLabel || "Start This Step"}
        </button>
        {timeEstimate ? <span className="text-sm text-slate-600">Estimated time: {timeEstimate}</span> : null}
      </div>
    </section>
  );
}
