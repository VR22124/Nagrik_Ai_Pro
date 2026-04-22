import { useState, useCallback } from "react";
import { fetchGuidance } from "../services/guidanceApi";
import { generateSimpleExplanation } from "../services/geminiApi";
import { simplifyGuidance } from "../utils/simpleExplain";
import { trackEvent } from "../services/analytics";
import { GEMINI_MAX_WORDS } from "../utils/constants";

/**
 * Trim text to a maximum number of words, appending "..." if truncated.
 * @param {string} text - Raw text to compact.
 * @param {number} maxWords - Maximum allowed word count.
 * @returns {string}
 */
function compactWords(text, maxWords = GEMINI_MAX_WORDS) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

/**
 * useGuidance — manages all guidance-related state and side effects.
 *
 * Decouples business logic from the component tree so that App.jsx and
 * HomePage.jsx remain pure composition layers.
 *
 * @param {{ uid: string|null, saveSession: Function, showToast: Function }} deps
 * @returns {{
 *   form: object,
 *   setForm: Function,
 *   guidance: object|null,
 *   simpleExplain: boolean,
 *   geminiExplanation: string,
 *   explainLoading: boolean,
 *   loading: boolean,
 *   error: string,
 *   aiUnavailable: boolean,
 *   aiContext: object,
 *   displayedGuidance: object|null,
 *   onSubmit: Function,
 *   handleExplainToggle: Function,
 *   handleResumeSession: Function,
 * }}
 *
 * @example
 * const { form, setForm, guidance, onSubmit } = useGuidance({ uid, saveSession, showToast });
 */
export function useGuidance({ uid, saveSession, showToast }) {
  const [form, setForm] = useState({
    age: "22",
    state: "Tamil Nadu",
    registrationStatus: "not_registered",
    scenario: "first_time_migrated",
    hasAddressProof: false,
    movedRecently: true,
    migrationType: "inter_state",
    intent: "I moved to Chennai for college and need voter registration help",
    simpleMode: true
  });
  const [guidance, setGuidance] = useState(null);
  const [simpleExplain, setSimpleExplain] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiUnavailable, setAiUnavailable] = useState(false);

  /**
   * Primary form submit handler — calls backend for guidance, persists session.
   * @param {React.FormEvent} event
   */
  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
      setError("");
      setAiUnavailable(false);

      try {
        const result = await fetchGuidance({ ...form, age: Number(form.age), language: "en" });
        setGuidance(result);
        setSimpleExplain(false);
        setGeminiExplanation("");

        trackEvent("form_submitted", { state: form.state, scenario: form.scenario });
        trackEvent("guidance_shown", { state: form.state, scenario: form.scenario });

        saveSession({
          state: form.state,
          registrationStatus: form.registrationStatus,
          scenario: form.scenario,
          intent: form.intent,
          lastStep: "guidance_generated"
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [form, uid, saveSession]
  );

  /**
   * Toggle Gemini simple-explanation mode. Fetches from Gemini on first enable.
   */
  const handleExplainToggle = useCallback(async () => {
    if (!simpleExplain && guidance) {
      setExplainLoading(true);
      try {
        const result = await generateSimpleExplanation(guidance, aiContext);
        if (result) {
          setGeminiExplanation(compactWords(result, GEMINI_MAX_WORDS));
          trackEvent("gemini_simplified", { state: form.state });
          setAiUnavailable(false);
        } else {
          setAiUnavailable(true);
          if (showToast) {
            showToast(
              "AI simplification is currently unavailable. Showing standard guidance.",
              "info"
            );
          }
        }
      } finally {
        setExplainLoading(false);
      }
    } else {
      setGeminiExplanation("");
    }
    setSimpleExplain((prev) => !prev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simpleExplain, guidance, form.state, showToast]);

  /**
   * Restore form fields from a previously saved session.
   * @param {object} session - Saved session data from Firestore or localStorage.
   */
  const handleResumeSession = useCallback((session) => {
    setForm((f) => ({
      ...f,
      state: session.state || f.state,
      registrationStatus: session.registrationStatus || f.registrationStatus,
      scenario: session.scenario || f.scenario,
      intent: session.intent || f.intent
    }));
  }, []);

  // Build Gemini context from current form + guidance state.
  const aiContext = guidance
    ? {
        age: Number(form.age),
        state: form.state,
        registrationStatus: form.registrationStatus,
        scenario: form.scenario,
        nextBestAction: guidance?.nextSteps?.[0] || ""
      }
    : {
        age: Number(form.age),
        state: form.state,
        registrationStatus: form.registrationStatus,
        scenario: form.scenario,
        nextBestAction: ""
      };

  // Compute the displayed guidance: Gemini-simplified or original.
  let displayedGuidance = guidance;
  if (simpleExplain) {
    if (geminiExplanation) {
      displayedGuidance = { ...guidance, userStatus: [geminiExplanation] };
    } else {
      displayedGuidance = simplifyGuidance(guidance);
    }
  }

  return {
    form,
    setForm,
    guidance,
    simpleExplain,
    geminiExplanation,
    explainLoading,
    loading,
    error,
    aiUnavailable,
    aiContext,
    displayedGuidance,
    onSubmit,
    handleExplainToggle,
    handleResumeSession
  };
}
