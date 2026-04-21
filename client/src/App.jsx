import { useMemo, useState } from "react";
import { fetchGuidance } from "./services/guidanceApi";
import SummaryHeader from "./components/common/SummaryHeader";
import NextBestAction from "./components/flow/NextBestAction";
import SimpleExplanationToggle from "./components/common/SimpleExplanationToggle";
import ActionButtons from "./components/flow/ActionButtons";
import DoThisNow from "./components/flow/DoThisNow";
import ProgressTracker from "./components/flow/ProgressTracker";
import { simplifyGuidance } from "./utils/simpleExplain";
import { generateSimpleExplanation } from "./services/geminiApi";
import ChatBox from "./components/chat/ChatBox";

const scenarios = [
  { value: "first_time", label: "First-time voter" },
  { value: "first_time_migrated", label: "First-time + Migrated" },
  { value: "migrated", label: "Migrated voter" },
  { value: "lost_id", label: "Lost voter ID" },
  { value: "correction", label: "Correction needed" },
  { value: "unknown_status", label: "Unknown registration status" }
];

const FLOW_TITLES = ["What You Should Do", "Be Careful", "Why This Matters"];

function compactWords(text, maxWords = 95) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return "";
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function shortenLine(text, maxChars = 130) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/^[-•\d.\s]+/, "")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars - 1).trim()}...`;
}

function dedupeAndLimit(items = [], maxItems = 4) {
  const seen = new Set();
  const result = [];

  for (const raw of items) {
    const line = shortenLine(raw);
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(line);
    if (result.length >= maxItems) break;
  }
  return result;
}

function getSummaryLine(guidance, form) {
  if (!guidance) return "";
  if (form.registrationStatus === "not_registered") {
    return "You are eligible but not registered. You need to register to vote.";
  }
  if (form.registrationStatus === "registered") {
    return "You are registered. Verify your details and polling booth before voting day.";
  }
  if (form.registrationStatus === "unsure") {
    return "Your registration status is unclear. First check your name in the voter list.";
  }
  return guidance.userStatus?.[0] || "Election guidance summary.";
}

function getNextBestAction(guidance) {
  return guidance?.requiredActions?.[0] || "Start registration on the official portal.";
}

function getResolvedScenario(guidance, fallbackScenario) {
  const resolved = (guidance?.userStatus || []).find((line) =>
    line.toLowerCase().startsWith("resolved scenario:")
  );
  if (!resolved) return fallbackScenario || "unknown";
  return resolved.split(":").slice(1).join(":").trim() || fallbackScenario || "unknown";
}

function getCtaMeta(nextAction) {
  const text = String(nextAction || "").toLowerCase();
  if (text.includes("form 6")) {
    return { ctaLabel: "Start Registration (Form 6)", timeEstimate: "5–10 min" };
  }
  if (text.includes("form 8")) {
    return { ctaLabel: "Update Details (Form 8)", timeEstimate: "5–10 min" };
  }
  if (text.includes("booth")) {
    return { ctaLabel: "Check Polling Booth", timeEstimate: "2–5 min" };
  }
  if (text.includes("electoral roll") || text.includes("check your name")) {
    return { ctaLabel: "Check Voter Status", timeEstimate: "2–5 min" };
  }
  return { ctaLabel: "Continue This Step", timeEstimate: "5–8 min" };
}

function getGuidedSections(guidance) {
  if (!guidance) return [[], [], []];

  const whatYouShouldDo = dedupeAndLimit([
    ...(guidance.requiredActions || []).filter((line) => {
      const l = line.toLowerCase();
      return !l.startsWith("rule:") && !l.startsWith("why:") && !l.startsWith("risk:");
    }),
    ...(guidance.nextSteps || [])
  ]);

  const beCareful = dedupeAndLimit([
    ...(guidance.importantDeadlines || []),
    ...(guidance.commonMistakes || []),
    ...(guidance.documentsNeeded || []).filter((line) => {
      const l = line.toLowerCase();
      return l.includes("missing") || l.includes("delay") || l.includes("proof") || l.includes("risk");
    })
  ]);

  const whyThisMatters = dedupeAndLimit([
    ...(guidance.requiredActions || [])
      .filter((line) => line.toLowerCase().startsWith("why:"))
      .map((line) => line.replace(/^why:\s*/i, "")),
    guidance.keyInsight,
    guidance.practicalTip
  ]);

  return [whatYouShouldDo, beCareful, whyThisMatters];
}

function getActionButtons(guidance, state) {
  const registrationUrl = guidance?.officialLinks?.nvsp || "https://voters.eci.gov.in/";
  const statusUrl = "https://electoralsearch.eci.gov.in/";
  const boothUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `polling booth near ${state || "India"}`
  )}`;

  return [
    {
      label: "Go to Registration (Form 6)",
      url: registrationUrl,
      helper: "Open official NVSP portal"
    },
    {
      label: "Check Voter Status",
      url: statusUrl,
      helper: "Search name in electoral roll"
    },
    {
      label: "Find Polling Booth",
      url: boothUrl,
      helper: `Find booths near ${state || "your area"}`
    }
  ];
}

function getDoThisNowSteps(guidance, context) {
  const scenario = String(context?.scenario || "").toLowerCase();
  const steps = [];

  if (scenario.includes("lost_id") || scenario.includes("correction")) {
    steps.push("Open the official correction/replacement flow and update your details.");
  } else if (scenario.includes("unknown_status") || context?.registrationStatus === "unsure") {
    steps.push("Check your name in the voter list before starting a new form.");
  } else if (scenario.includes("booth") && context?.registrationStatus === "registered") {
    steps.push("Check polling booth details on the official portal now.");
  } else {
    steps.push("Start Form 6 registration on the official portal.");
  }

  const docs = (guidance?.documentsNeeded || []).slice(0, 2).map((item) => shortenLine(item, 70));
  if (docs.length) {
    steps.push(`Keep these ready: ${docs.join(", ")}.`);
  }

  if (guidance?.importantDeadlines?.[0]) {
    steps.push(shortenLine(guidance.importantDeadlines[0], 90));
  }

  steps.push("Submit, save your acknowledgment, and recheck status before polling day.");

  return dedupeAndLimit(steps, 4);
}

function getSmartWarnings(guidance) {
  const sources = [
    ...(guidance?.importantDeadlines || []),
    ...(guidance?.commonMistakes || []),
    ...(guidance?.requiredActions || [])
  ];

  const warnings = sources
    .filter((line) => {
      const lower = String(line).toLowerCase();
      return (
        lower.includes("risk") ||
        lower.includes("delay") ||
        lower.includes("exclude") ||
        lower.includes("missing") ||
        lower.includes("late") ||
        lower.includes("mismatch")
      );
    })
    .map((line) => line.replace(/^risk:\s*/i, "").replace(/^why:\s*/i, ""));

  return dedupeAndLimit(warnings, 3);
}

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
  const [flowStep, setFlowStep] = useState(0);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await fetchGuidance({ ...form, age: Number(form.age), language: "en" });
      setGuidance(result);
      setFlowStep(0);
      setSimpleExplain(false);
      setGeminiExplanation("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const nextBestAction = getNextBestAction(guidance);
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
        const result = await generateSimpleExplanation(guidance, aiContext);
        setGeminiExplanation(compactWords(result || "", 95));
      } finally {
        setExplainLoading(false);
      }
    } else {
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

  const guidedSections = useMemo(() => getGuidedSections(displayedGuidance), [displayedGuidance]);
  const stepIndex = Math.max(0, flowStep - 1);
  const currentItems = guidedSections[stepIndex] || [];
  const ctaMeta = getCtaMeta(nextBestAction);

  return (
    <main className="app-shell">
      <header className="glass-card p-6 md:p-7">
        <p className="kicker mb-2">NagrikAI Pro</p>
        <h1 className="text-2xl md:text-4xl font-bold leading-tight">Smart Election Guidance, Step by Step</h1>
        <p className="text-sm md:text-base text-slate-600 mt-3 max-w-2xl">
          Action-first support for Indian citizens, aligned with Election Commission of India processes.
        </p>
        <p className="text-xs mt-3 text-slate-500">
          You will complete this step on the official government platform. I will guide you.
        </p>
      </header>

      <section className="glass-card p-5 md:p-6 section-gap">
        <h2 className="text-lg font-semibold mb-4">Start Your Journey</h2>
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="age" className="text-sm font-medium text-slate-700">
              Age
            </label>
            <input
              id="age"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              type="number"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="state" className="text-sm font-medium text-slate-700">
              State
            </label>
            <input
              id="state"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="registrationStatus" className="text-sm font-medium text-slate-700">
              Registration Status
            </label>
            <select
              id="registrationStatus"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              value={form.registrationStatus}
              onChange={(e) => setForm((f) => ({ ...f, registrationStatus: e.target.value }))}
            >
              <option value="registered">Registered</option>
              <option value="not_registered">Not registered</option>
              <option value="unsure">Unsure</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="scenario" className="text-sm font-medium text-slate-700">
              Scenario
            </label>
            <select
              id="scenario"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              value={form.scenario}
              onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
            >
              {scenarios.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="migrationType" className="text-sm font-medium text-slate-700">
              Migration Type
            </label>
            <select
              id="migrationType"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              value={form.migrationType}
              onChange={(e) => setForm((f) => ({ ...f, migrationType: e.target.value }))}
            >
              <option value="unspecified">Migration type (optional)</option>
              <option value="intra_state">Moved within same state</option>
              <option value="inter_state">Moved from another state</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="hasAddressProof" className="text-sm font-medium text-slate-700">
              Address Proof Availability
            </label>
            <select
              id="hasAddressProof"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              value={String(form.hasAddressProof)}
              onChange={(e) => setForm((f) => ({ ...f, hasAddressProof: e.target.value === "true" }))}
            >
              <option value="true">I have current address proof</option>
              <option value="false">I do not have current address proof</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="intent" className="text-sm font-medium text-slate-700">
              Describe Your Issue (Optional)
            </label>
            <input
              id="intent"
              className="border rounded-xl p-2.5 w-full bg-white/90"
              placeholder="Describe your issue (optional)"
              value={form.intent}
              onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value }))}
            />
          </div>
          <button disabled={loading} className="btn-primary w-fit mt-1 disabled:opacity-60">
            {loading ? "Generating Guidance..." : "Get My Next Step"}
          </button>
        </form>
        {error ? <p className="text-red-600 text-sm mt-3">{error}</p> : null}
      </section>

      {guidance ? (
        <>
          <section className="section-gap">
            <SummaryHeader summary={getSummaryLine(guidance, form)} />
          </section>

          <section className="section-gap">
            <NextBestAction
              action={shortenLine(nextBestAction, 140)}
              ctaLabel={ctaMeta.ctaLabel}
              timeEstimate={ctaMeta.timeEstimate}
              onStart={() => setFlowStep(1)}
            />
          </section>

          <section className="section-gap flex justify-end">
            <SimpleExplanationToggle enabled={simpleExplain} onToggle={handleExplainToggle} loading={explainLoading} />
          </section>

          <section className="glass-card p-5 md:p-6 section-gap">
            {flowStep === 0 ? (
              <div className="space-y-2">
                <p className="kicker">Guided Flow</p>
                <p className="text-slate-700 text-sm md:text-base">
                  Start the highlighted action first, then continue through 3 short guidance stages.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">{FLOW_TITLES[stepIndex]}</h2>
                  <span className="text-sm font-medium text-blue-700">Step {flowStep} of 3</span>
                </div>

                <ul className="space-y-2.5 mt-4">
                  {currentItems.length ? (
                    currentItems.map((item) => (
                      <li key={item} className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-800">
                        <p className="line-clamp-2">{item}</p>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-500">
                      No guidance items available for this section.
                    </li>
                  )}
                </ul>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setFlowStep((s) => Math.max(1, s - 1))}
                    disabled={flowStep === 1}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setFlowStep((s) => Math.min(3, s + 1))}
                    disabled={flowStep === 3}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="section-gap">
            <p className="text-xs text-slate-500">
              Guidance is informational and process-oriented. Official submission and status updates happen on government platforms.
            </p>
          </section>
        </>
      ) : null}

      <ChatBox userContext={aiContext} guidance={guidance || {}} />
    </main>
  );
}
