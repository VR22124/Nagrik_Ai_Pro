import React, { useMemo, useState, useEffect, Suspense } from "react";
import { fetchGuidance } from "./services/guidanceApi";
import { generateSimpleExplanation } from "./services/geminiApi";
import { simplifyGuidance } from "./utils/simpleExplain";
import { signInAnonymouslyIfNeeded } from "./services/firebase";
import { saveSession, loadSession } from "./services/sessionStore";
import { trackEvent } from "./services/analytics";

const SummaryHeader = React.lazy(() => import("./components/common/SummaryHeader"));
const NextBestAction = React.lazy(() => import("./components/flow/NextBestAction"));
const SimpleExplanationToggle = React.lazy(() => import("./components/common/SimpleExplanationToggle"));
const ActionButtons = React.lazy(() => import("./components/flow/ActionButtons"));
const DoThisNow = React.lazy(() => import("./components/flow/DoThisNow"));
const LocationExplorer = React.lazy(() => import("./components/flow/LocationExplorer"));
const TopLanguageSelector = React.lazy(() => import("./components/common/TopLanguageSelector"));
const ResumeSessionBanner = React.lazy(() => import("./components/common/ResumeSessionBanner"));

import {
  getSummaryLine,
  getNextBestAction,
  getResolvedScenario,
  getCtaMeta,
  getGuidedSections,
  compactWords,
  shortenLine,
  getActionButtons,
  getDoThisNowSteps,
  getSmartWarnings
} from "./utils/guidanceHelpers";

const ChatBox = React.lazy(() => import("./components/chat/ChatBox"));

const GuidanceForm = React.lazy(() => import("./components/common/GuidanceForm"));

const FLOW_TITLES = ["What You Should Do", "Be Careful", "Why This Matters"];

export default function App() {
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
  const [uid, setUid] = useState(null);
  const [savedSession, setSavedSession] = useState(null);

  // Firebase anonymous auth + session restore on mount
  useEffect(() => {
    (async () => {
      const userId = await signInAnonymouslyIfNeeded();
      setUid(userId);
      if (userId) {
        const session = await loadSession(userId);
        if (session && session.state) setSavedSession(session);
      }
    })();
  }, []);

  function handleResumeSession(session) {
    setForm((f) => ({
      ...f,
      state: session.state || f.state,
      registrationStatus: session.registrationStatus || f.registrationStatus,
      scenario: session.scenario || f.scenario,
      intent: session.intent || f.intent
    }));
    setSavedSession(null);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Execute primary AI guidance run 
      const result = await fetchGuidance({ ...form, age: Number(form.age), language: "en" });
      setGuidance(result);
      
      // Reset contextual secondary flows to initialize new guidance loop
      setSimpleExplain(false);
      setGeminiExplanation("");

      // Track and persist
      trackEvent("form_submitted", { state: form.state, scenario: form.scenario });
      saveSession(uid, {
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
  }

  const nextBestAction = getNextBestAction(guidance);
  
  // Conditionally build contextual AI tracking metadata for deep integrations
  const aiContext = guidance
    ? {
        age: Number(form.age),
        state: form.state,
        registrationStatus: form.registrationStatus,
        scenario: getResolvedScenario(guidance, form.scenario),
        nextBestAction
      }
    : {
        age: Number(form.age),
        state: form.state,
        registrationStatus: form.registrationStatus,
        scenario: form.scenario,
        nextBestAction: ""
      };

  async function handleExplainToggle() {
    if (!simpleExplain && guidance) {
      setExplainLoading(true);
      try {
        // Query Gemini to summarize and strip complexity on demand
        const result = await generateSimpleExplanation(guidance, aiContext);
        if (result) {
          setGeminiExplanation(compactWords(result, 95));
        } else {
          setError("AI is currently busy. Showing default simplified guidance.");
          setTimeout(() => setError(""), 5000);
        }
      } finally {
        setExplainLoading(false);
      }
    } else {
      // Clear generated simplicity data if toggled off
      setGeminiExplanation("");
    }

    setSimpleExplain((prev) => !prev);
  }

  let displayedGuidance = guidance;
  if (simpleExplain) {
    if (geminiExplanation) {
      displayedGuidance = { ...guidance, userStatus: [geminiExplanation] };
    } else {
      displayedGuidance = simplifyGuidance(guidance);
    }
  }

  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Skip to main content
      </a>
      <main id="main-content" className="app-shell relative" aria-label="Main Application Flow">
        <Suspense fallback={null}>
          <TopLanguageSelector />
        </Suspense>
        <header className="glass-card p-6 md:p-7">
          <p className="kicker mb-2">NagrikAI Pro</p>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight text-slate-900">
            Smart Election Guidance, Step by Step
          </h1>
          <p className="text-sm md:text-base text-slate-700 mt-3 max-w-2xl">
            Action-first support for Indian citizens, aligned with Election Commission of India
            processes.
          </p>
          <p className="text-xs mt-3 text-slate-600">
            You will complete this step on the official government platform. I will guide you.
          </p>
        </header>

        {savedSession && !guidance && (
          <Suspense fallback={null}>
            <ResumeSessionBanner
              session={savedSession}
              onResume={handleResumeSession}
              onDismiss={() => setSavedSession(null)}
            />
          </Suspense>
        )}

        <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading form...</div>}>
          <GuidanceForm form={form} setForm={setForm} onSubmit={onSubmit} loading={loading} error={error} />
        </Suspense>

        {guidance ? (
          <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading guidance components...</div>}>
            {guidance.eligibilityStatus === "NOT_ELIGIBLE_AGE" ? (
              <section className="section-gap" aria-live="assertive">
                <div className="glass-card p-6 md:p-8 bg-red-50 border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl" aria-hidden="true">🛑</span>
                    <h2 className="text-xl md:text-2xl font-bold text-red-800">
                      Not Eligible Yet
                    </h2>
                  </div>
                  <p className="text-red-900 font-medium mb-4">
                    Voting eligibility in India requires the citizen to be 18 years of age or older. You cannot register or participate until your 18th birthday.
                  </p>
                  <div className="space-y-4">
                    {guidance.userStatus.map((status, idx) => (
                      <p key={idx} className="text-sm text-red-800">• {status}</p>
                    ))}
                    {guidance.nextSteps.map((step, idx) => (
                      <p key={idx} className="text-sm text-red-800 font-semibold">• {step}</p>
                    ))}
                  </div>
                </div>
              </section>
            ) : (

              <>
                <section className="section-gap" aria-live="polite">
                  <SummaryHeader summary={getSummaryLine(guidance, form)} />
                </section>

                <section className="section-gap">
                  <ActionButtons actions={getActionButtons(guidance)} />
                </section>

                <section className="section-gap">
                  <DoThisNow 
                    steps={getDoThisNowSteps(guidance)} 
                    warnings={getSmartWarnings(guidance)} 
                  />
                </section>

                <section className="section-gap">
                  <LocationExplorer form={form} guidance={guidance} />
                </section>

                <section className="section-gap flex justify-end">
                  <SimpleExplanationToggle
                    enabled={simpleExplain}
                    onToggle={handleExplainToggle}
                    loading={explainLoading}
                  />
                </section>

                <section className="section-gap">
                  <p className="text-xs text-slate-600 font-medium tracking-wide text-center">
                    Guidance is informational and process-oriented. Official submission and status updates
                    happen on official government designated platforms.
                  </p>
                </section>
              </>
            )}
          </Suspense>
        ) : null}

        <Suspense fallback={<span className="sr-only">Loading ChatBox...</span>}>
          <ChatBox userContext={aiContext} guidance={guidance || {}} />
        </Suspense>
      </main>
    </>
  );
}
