import React, { useState } from "react";
import { geminiMapsExplain } from "../../services/geminiApi";
import { trackEvent } from "../../services/analytics";

const QUERY_CATEGORIES = [
  { label: "Government Schools", query: "government school", icon: "🏫" },
  { label: "Public Schools", query: "public school", icon: "🏫" },
  { label: "Colleges", query: "college", icon: "🎓" },
  { label: "Election Offices", query: "election office", icon: "🏢" }
];

const FALLBACK_GUIDANCE =
  "Polling booths are usually located in nearby schools or public buildings. Look for places close to your area.";

const KNOWN_CITIES = [
  "chennai", "bangalore", "bengaluru", "mumbai", "pune",
  "delhi", "hyderabad", "kolkata", "coimbatore", "madurai",
  "mysore", "mysuru", "ahmedabad", "jaipur", "lucknow",
  "kochi", "thiruvananthapuram", "visakhapatnam", "nagpur",
  "indore", "bhopal", "patna", "chandigarh", "surat",
  "thane", "noida", "gurgaon", "gurugram"
];

function extractLocation(intent, state) {
  if (!intent || intent.trim().length < 3) return state || "India";

  const lower = intent.toLowerCase();
  for (const city of KNOWN_CITIES) {
    if (lower.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }

  return state || "India";
}

function getOrderedCategories(registrationStatus) {
  const ordered = [...QUERY_CATEGORIES];
  if (registrationStatus === "not_registered") {
    const idx = ordered.findIndex((c) => c.query === "election office");
    if (idx > 0) {
      const [item] = ordered.splice(idx, 1);
      ordered.unshift(item);
    }
  }
  return ordered;
}

function trimResponse(text, maxWords = 100) {
  if (!text) return "";
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export default React.memo(function LocationExplorer({ form, guidance }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [aiGuidance, setAiGuidance] = useState(null);
  const [aiRequested, setAiRequested] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const cleanLocation = extractLocation(form?.intent, form?.state);
  const categories = getOrderedCategories(form?.registrationStatus);
  const isDisabled = !form?.state;

  function handleExplore(index) {
    setActiveIndex(index);
    const cat = categories[index];
    const query = `${cat.query} in ${cleanLocation}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    trackEvent("maps_opened", { category: cat.label, location: cleanLocation, state: form?.state });
  }

  async function handleExplainClick() {
    if (aiGuidance) return;
    setLoadingAI(true);
    setAiRequested(true);
    trackEvent("ai_explain_used", { state: form?.state });
    try {
      const result = await geminiMapsExplain({
        state: form?.state,
        intent: form?.intent,
        registrationStatus: form?.registrationStatus,
        nextBestAction: guidance?.nextSteps?.[0] || guidance?.requiredActions?.[0] || ""
      });
      setAiGuidance(trimResponse(result, 100));
    } catch {
      setAiGuidance(null);
    } finally {
      setLoadingAI(false);
    }
  }

  const showGuidanceCard = aiRequested && !loadingAI;

  return (
    <section
      className="glass-card p-5 md:p-6"
      aria-labelledby="location-explorer-heading"
    >
      <p className="kicker mb-1">Location Discovery</p>
      <h2
        id="location-explorer-heading"
        className="text-lg md:text-xl font-semibold text-slate-900 mb-2"
      >
        📍 Find Nearby Polling Locations
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Polling booths in India are usually set up in schools or public buildings.
      </p>

      {activeIndex !== null && (
        <p
          className="text-sm font-medium text-blue-700 mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100"
          aria-live="polite"
        >
          <span aria-hidden="true">{categories[activeIndex].icon}</span>
          Showing results for: {categories[activeIndex].label} near {cleanLocation}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
        {categories.map((cat, idx) => (
          <button
            key={cat.query}
            type="button"
            disabled={isDisabled}
            className={`rounded-xl border p-3 text-sm font-medium transition-colors text-left disabled:opacity-50 ${
              activeIndex === idx
                ? "bg-blue-50 border-blue-300 text-blue-900"
                : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
            }`}
            onClick={() => handleExplore(idx)}
            aria-label={`Search ${cat.label} near ${cleanLocation} on Google Maps`}
          >
            <span aria-hidden="true">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={handleExplainClick}
          disabled={loadingAI || Boolean(aiGuidance)}
          aria-live="polite"
        >
          {loadingAI
            ? "Generating smart guidance based on your location..."
            : aiGuidance
              ? "✅ Guidance loaded"
              : "💡 Explain why this helps"}
        </button>
      </div>

      {showGuidanceCard && (
        <div
          className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 mb-4"
          role="region"
          aria-label="AI Location Guidance"
        >
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">
            💡 Smart Guidance (AI)
          </p>
          <p className="text-sm text-slate-800 leading-relaxed">
            {aiGuidance || FALLBACK_GUIDANCE}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Final polling booth details are available on official Election Commission of India platforms.
      </p>
    </section>
  );
});
