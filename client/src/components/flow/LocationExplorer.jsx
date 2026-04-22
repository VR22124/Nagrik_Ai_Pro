import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { geminiMapsExplain } from "../../services/geminiApi";
import { trackEvent } from "../../services/analytics";
import { logSession } from "../../services/logsApi";

/* ─── India-specific polling location categories ───────────────────────────── */

const QUERY_CATEGORIES = [
  { label: "Election Office (ERO)", query: "election registration office", icon: "🏢", priority: true },
  { label: "Government School", query: "government school polling booth", icon: "🏫", priority: false },
  { label: "Public School", query: "public school", icon: "🏫", priority: false },
  { label: "Public Building", query: "public building near election booth", icon: "🏛️", priority: false }
];

const FALLBACK_GUIDANCE =
  "Visit a nearby election office or use the official NVSP platform to proceed with your registration.";

/* ─── Expanded city list for intent parsing ─────────────────────────────────── */

const KNOWN_CITIES = [
  "chennai", "bangalore", "bengaluru", "mumbai", "pune",
  "delhi", "new delhi", "hyderabad", "kolkata", "coimbatore",
  "madurai", "mysore", "mysuru", "ahmedabad", "jaipur",
  "lucknow", "kochi", "thiruvananthapuram", "visakhapatnam",
  "nagpur", "indore", "bhopal", "patna", "chandigarh",
  "surat", "thane", "noida", "gurgaon", "gurugram",
  "varanasi", "agra", "nashik", "faridabad", "meerut",
  "rajkot", "kalyan", "vasai", "aurangabad", "dhanbad",
  "amritsar", "allahabad", "ranchi", "jabalpur", "gwalior",
  "vijayawada", "jodhpur", "raipur", "kota", "guwahati"
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function extractLocation(intent, state) {
  if (!intent || intent.trim().length < 3) return state || "India";
  const lower = intent.toLowerCase();
  for (const city of KNOWN_CITIES) {
    if (lower.includes(city)) {
      return city
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
  return state || "India";
}

function getOrderedCategories(registrationStatus) {
  const ordered = [...QUERY_CATEGORIES];
  if (registrationStatus === "not_registered") {
    // Move Election Office to front for unregistered users
    const idx = ordered.findIndex((c) => c.priority === true);
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

function buildMapsSearchUrl(query, coords) {
  const encoded = encodeURIComponent(query);
  if (coords) {
    // With geolocation: use center + search near the user
    return `https://www.google.com/maps/search/${encoded}/@${coords.lat},${coords.lng},14z`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function buildDirectionsUrl(query) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

const LocationExplorer = React.memo(function LocationExplorer({ form, guidance }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [aiGuidance, setAiGuidance] = useState(null);
  const [aiRequested, setAiRequested] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | loading | granted | denied

  const cleanLocation = extractLocation(form?.intent, form?.state);
  const categories = getOrderedCategories(form?.registrationStatus);
  const isDisabled = !form?.state;

  /* ── Attempt geolocation on mount ─────────────────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied"); // Fallback to state-based silently
      },
      { timeout: 6000, maximumAge: 60000 }
    );
  }, []);

  /* ── Open Maps search ──────────────────────────────────────────────────────── */
  const handleExplore = useCallback((index) => {
    setActiveIndex(index);
    const cat = categories[index];
    const query = geoCoords
      ? `${cat.query} near me`
      : `${cat.query} near ${cleanLocation}`;
    const url = buildMapsSearchUrl(query, geoCoords);
    window.open(url, "_blank", "noopener,noreferrer");
    trackEvent("maps_opened", { category: cat.label, location: cleanLocation, state: form?.state });
    // Fire-and-forget analytics to Sheets
    logSession({ state: form?.state || "", scenario: form?.scenario || "", action: "maps_opened" });
  }, [categories, geoCoords, cleanLocation, form?.state, form?.scenario]);

  /* ── Open Directions ───────────────────────────────────────────────────────── */
  const handleDirections = useCallback((index) => {
    const cat = categories[index];
    const destination = geoCoords
      ? `${cat.query} near me`
      : `${cat.query} near ${cleanLocation}`;
    const url = buildDirectionsUrl(destination);
    window.open(url, "_blank", "noopener,noreferrer");
    trackEvent("directions_opened", { category: cat.label, location: cleanLocation, state: form?.state });
    logSession({ state: form?.state || "", scenario: form?.scenario || "", action: "directions_opened" });
  }, [categories, geoCoords, cleanLocation, form?.state, form?.scenario]);

  /* ── Gemini "Why this helps" ───────────────────────────────────────────────── */
  const handleExplainClick = useCallback(async () => {
    if (aiGuidance) return;
    setLoadingAI(true);
    setAiRequested(true);
    trackEvent("ai_explain_used", { state: form?.state });
    try {
      const result = await geminiMapsExplain({
        state: form?.state,
        intent: form?.intent,
        registrationStatus: form?.registrationStatus,
        nextBestAction: guidance?.nextSteps?.[0] || guidance?.requiredActions?.[0] || "",
        age: form?.age,
        scenario: form?.scenario
      });
      setAiGuidance(trimResponse(result, 100));
    } catch {
      setAiGuidance(null);
    } finally {
      setLoadingAI(false);
    }
  }, [aiGuidance, form, guidance]);

  const showGuidanceCard = aiRequested && !loadingAI;

  return (
    <section
      className="glass-card p-5 md:p-6"
      aria-labelledby="location-explorer-heading"
    >
      {/* Header */}
      <p className="kicker mb-1">Find Polling Locations Near You</p>
      <h2
        id="location-explorer-heading"
        className="text-lg md:text-xl font-semibold text-slate-900 mb-1"
      >
        📍 Nearby Election & Polling Offices
      </h2>

      {/* Geo status pill */}
      {geoStatus === "granted" && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-3">
          <span aria-hidden="true">🎯</span> Using your current location
        </span>
      )}
      {geoStatus === "denied" && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 mb-3">
          <span aria-hidden="true">📌</span> Showing results for {cleanLocation}
        </span>
      )}

      <p className="text-sm text-slate-600 mb-4">
        Polling booths in India are set up in government schools, public buildings, and election offices.
        Final confirmation is available on the official{" "}
        <a
          href="https://electoralsearch.eci.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2"
        >
          Election Commission of India
        </a>{" "}
        platform.
      </p>

      {/* Active category badge */}
      {activeIndex !== null && (
        <p
          className="text-sm font-medium text-blue-700 mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100"
          aria-live="polite"
        >
          <span aria-hidden="true">{categories[activeIndex].icon}</span>
          Opened: {categories[activeIndex].label} near {geoStatus === "granted" ? "your location" : cleanLocation}
        </p>
      )}

      {/* Category grid — Search + Directions pair */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.query}
            className={`rounded-xl border p-3.5 transition-colors ${
              activeIndex === idx
                ? "bg-blue-50 border-blue-300"
                : "bg-white/70 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm font-semibold text-slate-800">
                <span aria-hidden="true">{cat.icon}</span> {cat.label}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleExplore(idx)}
                  aria-label={`Search ${cat.label} on Google Maps`}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  🔍 Find
                </button>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDirections(idx)}
                  aria-label={`Get directions to ${cat.label}`}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  👉 Directions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gemini "Why this helps" */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={handleExplainClick}
          disabled={loadingAI || Boolean(aiGuidance)}
          aria-live="polite"
        >
          {loadingAI
            ? "⏳ Generating personalised guidance..."
            : aiGuidance
              ? "✅ Guidance loaded"
              : "💡 Why does this help me?"}
        </button>
      </div>

      {/* Gemini response card */}
      {showGuidanceCard && (
        <div
          className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 mb-4"
          role="region"
          aria-label="AI Location Guidance"
        >
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1.5">
            💡 Smart Guidance · Gemini AI
          </p>
          <p className="text-sm text-slate-800 leading-relaxed">
            {aiGuidance || FALLBACK_GUIDANCE}
          </p>
        </div>
      )}

      {/* Trust footer */}
      <p className="text-xs text-slate-500 mt-2">
        🔒 No personal data is stored. Location is used only to personalise your Maps search.
      </p>
    </section>
  );
});

LocationExplorer.propTypes = {
  form: PropTypes.shape({
    intent: PropTypes.string,
    state: PropTypes.string,
    registrationStatus: PropTypes.string,
    scenario: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  guidance: PropTypes.object
};

export default LocationExplorer;
