import React, { Suspense } from "react";
import {
  getSummaryLine,
  getActionButtons,
  getDoThisNowSteps,
  getSmartWarnings
} from "../../utils/guidanceHelpers";

const SummaryHeader = React.lazy(() => import("../common/SummaryHeader"));
const ActionButtons = React.lazy(() => import("../flow/ActionButtons"));
const DoThisNow = React.lazy(() => import("../flow/DoThisNow"));
const LocationExplorer = React.lazy(() => import("../flow/LocationExplorer"));
const SimpleExplanationToggle = React.lazy(() => import("../common/SimpleExplanationToggle"));

/**
 * GuidanceResult — renders the full guidance output section.
 *
 * Handles both the ineligibility blocker (age < 18) and the standard
 * multi-card result layout. Wrapped in React.memo to prevent re-renders
 * when parent state unrelated to guidance changes.
 *
 * @param {object} props
 * @param {object} props.guidance - Raw guidance response from the backend.
 * @param {object} props.displayedGuidance - Guidance to display (may be Gemini-simplified).
 * @param {object} props.form - Current form state (used for Maps context).
 * @param {boolean} props.simpleExplain - Whether simple-explanation mode is active.
 * @param {boolean} props.explainLoading - Whether Gemini is currently fetching.
 * @param {Function} props.handleExplainToggle - Callback to toggle simple-explain mode.
 */
export default React.memo(function GuidanceResult({
  guidance,
  displayedGuidance,
  form,
  simpleExplain,
  explainLoading,
  handleExplainToggle
}) {
  if (!guidance) return null;

  if (guidance.eligibilityStatus === "NOT_ELIGIBLE_AGE") {
    return (
      <section className="section-gap" aria-live="assertive">
        <div className="glass-card p-6 md:p-8 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl" aria-hidden="true">🛑</span>
            <h2 className="text-xl md:text-2xl font-bold text-red-800">Not Eligible Yet</h2>
          </div>
          <p className="text-red-900 font-medium mb-4">
            Voting eligibility in India requires the citizen to be 18 years of age or older.
            You cannot register or participate until your 18th birthday.
          </p>
          <div className="space-y-4">
            {guidance.userStatus.map((status, idx) => (
              /* Static list — index key is stable */
              <p key={idx} className="text-sm text-red-800">• {status}</p>
            ))}
            {guidance.nextSteps.map((step, idx) => (
              /* Static list — index key is stable */
              <p key={idx} className="text-sm text-red-800 font-semibold">• {step}</p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading guidance...</div>}>
      <>
        <section className="section-gap" aria-live="polite">
          <SummaryHeader summary={getSummaryLine(displayedGuidance, form)} />
        </section>

        <section className="section-gap">
          <ActionButtons actions={getActionButtons(displayedGuidance)} />
        </section>

        <section className="section-gap">
          <DoThisNow
            steps={getDoThisNowSteps(displayedGuidance)}
            warnings={getSmartWarnings(displayedGuidance)}
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
            Guidance is informational and process-oriented. Official submission and status
            updates happen on official government designated platforms.
          </p>
        </section>
      </>
    </Suspense>
  );
});
