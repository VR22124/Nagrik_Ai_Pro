import React, { Suspense, lazy } from "react";
import { useSession } from "../hooks/useSession";
import { useGuidance } from "../hooks/useGuidance";
import { useToast } from "../hooks/useToast";
import Toast from "../components/ui/Toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const GuidanceForm = lazy(() => import("../components/common/GuidanceForm"));
const ResumeSessionBanner = lazy(() => import("../components/common/ResumeSessionBanner"));
const GuidanceResult = lazy(() => import("../components/results/GuidanceResult"));
const ChatBox = lazy(() => import("../components/chat/ChatBox"));

/**
 * HomePage — the primary composition layer for NagrikAI Pro.
 *
 * Orchestrates hooks (useSession, useGuidance, useToast) and assembles
 * the full page layout. Contains no business logic of its own.
 */
export default function HomePage() {
  const { uid, savedSession, saveSession, dismissSession } = useSession();
  const { toast, showToast, dismissToast } = useToast();
  const {
    form,
    setForm,
    guidance,
    simpleExplain,
    explainLoading,
    loading,
    error,
    aiContext,
    displayedGuidance,
    onSubmit,
    handleExplainToggle,
    handleResumeSession
  } = useGuidance({ uid, saveSession, showToast });

  function onResume(session) {
    handleResumeSession(session);
    dismissSession();
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
              onResume={onResume}
              onDismiss={dismissSession}
            />
          </Suspense>
        )}

        <Suspense fallback={<LoadingSpinner label="Loading form..." />}>
          <GuidanceForm form={form} setForm={setForm} onSubmit={onSubmit} loading={loading} error={error} />
        </Suspense>

        {guidance && (
          <GuidanceResult
            guidance={guidance}
            displayedGuidance={displayedGuidance}
            form={form}
            simpleExplain={simpleExplain}
            explainLoading={explainLoading}
            handleExplainToggle={handleExplainToggle}
          />
        )}

        <Suspense fallback={<span className="sr-only">Loading ChatBox...</span>}>
          <ChatBox userContext={aiContext} guidance={guidance || {}} />
        </Suspense>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}
