export default function ActionButtons({ actions = [] }) {
  if (!actions.length) return null;

  return (
    <section className="glass-card p-5 md:p-6">
      <p className="kicker mb-2">Action Buttons</p>
      <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Open Official Actions</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200 bg-white/75 p-3.5 hover:bg-white transition-colors"
          >
            <p className="text-sm font-semibold text-slate-900 line-clamp-2">{action.label}</p>
            {action.helper ? <p className="text-xs text-slate-600 mt-1 line-clamp-2">{action.helper}</p> : null}
          </a>
        ))}
      </div>
    </section>
  );
}
