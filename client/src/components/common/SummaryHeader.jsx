import React from "react";

export default React.memo(function SummaryHeader({ summary }) {
  if (!summary) return null;
  return (
    <div className="glass-card w-full px-5 py-4 md:px-6 md:py-5 border-blue-200">
      <p className="kicker mb-2">Summary</p>
      <p className="text-slate-900 font-semibold text-base md:text-lg leading-relaxed line-clamp-2">
        {summary}
      </p>
    </div>
  );
});
