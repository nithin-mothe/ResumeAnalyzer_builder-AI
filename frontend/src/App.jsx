import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { supabase } from "./lib/supabase";

const AtsMatchPage = lazy(() => import("./pages/AtsMatchPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Home = lazy(() => import("./pages/Home"));
const JobTrackerPage = lazy(() => import("./pages/JobTrackerPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const RedesignResumePage = lazy(() => import("./pages/RedesignResumePage"));
const ResumeAnalyzerPage = lazy(() => import("./pages/ResumeAnalyzerPage"));
const ResumeBuilderPage = lazy(() => import("./pages/ResumeBuilderPage"));
const ResumeChatPage = lazy(() => import("./pages/ResumeChatPage"));

function RouteFallback() {
  return (
    <section className="surface-card route-fallback" aria-live="polite">
      <div className="skeleton-line skeleton-line--wide" />
      <div className="skeleton-line" />
      <div className="skeleton-grid">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .finally(() => {
        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="app-shell">
      <Navbar session={session} />
      <main className="page-shell">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home session={session} />} />
            <Route path="/analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/ats-match" element={<AtsMatchPage />} />
            <Route path="/builder" element={<ResumeBuilderPage />} />
            <Route path="/redesign" element={<RedesignResumePage />} />
            <Route path="/chat" element={<ResumeChatPage />} />
            <Route path="/job-tracker" element={<JobTrackerPage />} />
            <Route path="/profile" element={<ProfilePage session={session} authReady={authReady} />} />
            <Route path="/auth" element={<AuthPage session={session} authReady={authReady} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
