import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { supabase } from "./lib/supabase";
import AtsMatchPage from "./pages/AtsMatchPage";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import JobTrackerPage from "./pages/JobTrackerPage";
import ProfilePage from "./pages/ProfilePage";
import RedesignResumePage from "./pages/RedesignResumePage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import ResumeChatPage from "./pages/ResumeChatPage";

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
      </main>
      <Footer />
    </div>
  );
}

export default App;
