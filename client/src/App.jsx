import React, { useMemo, useState, Suspense } from "react";
import { fetchGuidance } from "./services/guidanceApi";
import { generateSimpleExplanation } from "./services/geminiApi";
import { simplifyGuidance } from "./utils/simpleExplain";

const SummaryHeader = React.lazy(() => import("./components/common/SummaryHeader"));
const NextBestAction = React.lazy(() => import("./components/flow/NextBestAction"));
const SimpleExplanationToggle = React.lazy(() => import("./components/common/SimpleExplanationToggle"));
const ActionButtons = React.lazy(() => import("./components/flow/ActionButtons"));
const DoThisNow = React.lazy(() => import("./components/flow/DoThisNow"));

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

const SCENARIOS = [
  { value: "first_time", label: "First-time voter" },
  { value: "first_time_migrated", label: "First-time + Migrated" },
  { value: "migrated", label: "Migrated voter" },
  { value: "lost_id", label: "Lost voter ID" },
  { value: "correction", label: "Correction needed" },
  { value: "unknown_status", label: "Unknown registration status" }
];

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
        setGeminiExplanation(compactWords(result || "", 95));
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
      <main id="main-content" className="app-shell" aria-label="Main Application Flow">
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

        <section className="glass-card p-5 md:p-6 section-gap">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Start Your Journey</h2>
          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4" aria-label="Voter Information Form">
            <div className="space-y-1">
              <label htmlFor="age" className="text-sm font-medium text-slate-800">
                Age
              </label>
              <input
                id="age"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                type="number"
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                aria-required="true"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="state" className="text-sm font-medium text-slate-800">
                State
              </label>
              <input
                id="state"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                aria-required="true"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="registrationStatus" className="text-sm font-medium text-slate-800">
                Registration Status
              </label>
              <select
                id="registrationStatus"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.registrationStatus}
                onChange={(e) => setForm((f) => ({ ...f, registrationStatus: e.target.value }))}
                aria-required="true"
              >
                <option value="registered">Registered</option>
                <option value="not_registered">Not registered</option>
                <option value="unsure">Unsure</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="scenario" className="text-sm font-medium text-slate-800">
                Scenario
              </label>
              <select
                id="scenario"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.scenario}
                onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
                aria-required="true"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="migrationType" className="text-sm font-medium text-slate-800">
                Migration Type
              </label>
              <select
                id="migrationType"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={form.migrationType}
                onChange={(e) => setForm((f) => ({ ...f, migrationType: e.target.value }))}
              >
                <option value="unspecified">Migration type (optional)</option>
                <option value="intra_state">Moved within same state</option>
                <option value="inter_state">Moved from another state</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="hasAddressProof" className="text-sm font-medium text-slate-800">
                Address Proof Availability
              </label>
              <select
                id="hasAddressProof"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={String(form.hasAddressProof)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hasAddressProof: e.target.value === "true" }))
                }
              >
                <option value="true">I have current address proof</option>
                <option value="false">I do not have current address proof</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="intent" className="text-sm font-medium text-slate-800">
                Describe Your Issue (Optional)
              </label>
              <input
                id="intent"
                className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Describe your issue (optional)"
                value={form.intent}
                onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value }))}
              />
            </div>
            <button 
              disabled={loading} 
              className="btn-primary w-fit mt-1 disabled:opacity-60 focus:ring-2 focus:ring-blue-700"
              aria-live="polite"
            >
              {loading ? "Generating Guidance..." : "Get My Next Step"}
            </button>
          </form>
          {error ? <p role="alert" className="text-red-700 font-medium text-sm mt-3">{error}</p> : null}
        </section>

        {guidance ? (
          <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading guidance components...</div>}>
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
          </Suspense>
        ) : null}

        <Suspense fallback={<span className="sr-only">Loading ChatBox...</span>}>
          <ChatBox userContext={aiContext} guidance={guidance || {}} />
        </Suspense>
      </main>
    </>
  );
}
