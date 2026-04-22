import React, { lazy, Suspense } from "react";
import { SessionProvider } from "./context/SessionContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const HomePage = lazy(() => import("./pages/HomePage"));

/**
 * App — root provider shell.
 *
 * Composes ErrorBoundary, SessionProvider, Suspense, and the lazy-loaded
 * HomePage. Contains no business logic or UI of its own.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <Suspense fallback={<LoadingSpinner size="lg" label="Loading NagrikAI Pro..." />}>
          <HomePage />
        </Suspense>
      </SessionProvider>
    </ErrorBoundary>
  );
}
