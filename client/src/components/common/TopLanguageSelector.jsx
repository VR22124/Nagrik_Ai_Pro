import React, { useState } from "react";
import { trackEvent } from "../../services/analytics";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { value: "te", label: "తెలుగు (Telugu)" }
];

export default function TopLanguageSelector() {
  const [lang, setLang] = useState("en");

  function handleTranslate(e) {
    const selectedLang = e.target.value;
    if (selectedLang === "en") {
      setLang("en");
      return;
    }

    // Safety check
    if (!window.location.href) {
      setLang("en");
      return;
    }

    // Analytics event
    trackEvent("translate_used", {
      targetLanguage: selectedLang,
      context: "global_top_nav"
    });

    // Fix for local testing: Google Translate needs a public URL
    let targetUrl = window.location.href;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      targetUrl = "https://nagrik-ai-pro.onrender.com/";
    }

    const url = `https://translate.google.com/translate?sl=auto&tl=${selectedLang}&u=${encodeURIComponent(targetUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    // Reset to English
    setLang("en");
  }

  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col items-end gap-1">
      <label htmlFor="top-language-select" className="text-xs font-semibold text-slate-700 bg-white/80 px-1 rounded">
        🌐 Language
      </label>
      <select
        id="top-language-select"
        className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
        value={lang}
        onChange={handleTranslate}
        title="Translate this page using Google Translate"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="text-[10px] text-slate-500 font-medium bg-white/80 px-1 rounded">
        Powered by Google Translate
      </span>
    </div>
  );
}
