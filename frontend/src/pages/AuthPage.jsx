import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AiProcessingPanel, motionTokens } from "../components/MotionSystem";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const CANONICAL_PUBLIC_ORIGIN = "https://www.resumeforgeai.online";

function getAuthRedirectOrigin() {
  const configuredOrigin = import.meta.env.VITE_AUTH_REDIRECT_ORIGIN?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return window.location.origin;
  }

  return CANONICAL_PUBLIC_ORIGIN;
}

function AuthPage({ session, authReady }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const authOrigin = getAuthRedirectOrigin();
  const redirectTo = `${authOrigin}/auth`;
  const nextPath = location.state?.from?.pathname || "/profile";

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let cancelled = false;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const authError =
      hashParams.get("error_description") ||
      hashParams.get("error") ||
      queryParams.get("error_description") ||
      queryParams.get("error");

    if (authError) {
      setError(authError.replace(/\+/g, " "));
      return undefined;
    }

    const authCode = queryParams.get("code");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (authCode) {
      setStatus("Authentication completed. Redirecting you into ResumeForge...");
      setSubmitting(true);

      supabase.auth
        .exchangeCodeForSession(authCode)
        .then(({ error: exchangeError }) => {
          if (cancelled) {
            return;
          }
          if (exchangeError) {
            setError(`${exchangeError.message} Please try signing in again or check Supabase Google redirect URLs.`);
            setSubmitting(false);
            return;
          }
          window.history.replaceState({}, document.title, "/auth");
          navigate(nextPath, { replace: true });
        })
        .catch((exchangeError) => {
          if (!cancelled) {
            setError(`${exchangeError.message} Please try signing in again.`);
            setSubmitting(false);
          }
        });
    } else if (accessToken && refreshToken) {
      setStatus("Authentication completed. Redirecting you into ResumeForge...");
      setSubmitting(true);
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionError }) => {
          if (cancelled) {
            return;
          }
          if (sessionError) {
            setError(`${sessionError.message} Please try signing in again.`);
            setSubmitting(false);
            return;
          }
          window.history.replaceState({}, document.title, "/auth");
          navigate(nextPath, { replace: true });
        })
        .catch((sessionError) => {
          if (!cancelled) {
            setError(`${sessionError.message} Please try signing in again.`);
            setSubmitting(false);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
        setStatus("Signed in successfully. Redirecting...");
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        if (signUpError) {
          throw signUpError;
        }
        if (data.session) {
          setStatus("Account created and signed in successfully. Redirecting...");
        } else {
          setStatus("Account created. Check your inbox and confirm your email before signing in.");
        }
      }
    } catch (authError) {
      if (authError.message?.toLowerCase().includes("email not confirmed")) {
        setError("Your email is not confirmed yet. Open the Supabase confirmation email, click the link, then sign in again.");
        return;
      }

      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!supabase) {
      return;
    }

    setSubmitting(true);
    setError("");
    setStatus("Opening Google sign-in...");

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setError("Supabase did not return a Google sign-in URL. Check that the Google provider is enabled.");
      setStatus("");
      setSubmitting(false);
    } catch (authError) {
      setError(`${authError.message} Check Google provider setup and Supabase redirect URLs for the deployed domain.`);
      setStatus("");
      setSubmitting(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <motion.section className="surface-card narrow-card auth-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Authentication</p>
        <h2>Supabase frontend variables are missing</h2>
        <p>Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env`.</p>
      </motion.section>
    );
  }

  if (!authReady) {
    return (
      <section className="surface-card narrow-card auth-card">
        <AiProcessingPanel
          title="Checking authentication"
          stages={["Reading session...", "Validating redirect...", "Preparing profile..."]}
          compact
        />
        <p className="eyebrow">Authentication</p>
        <h2>Checking your session</h2>
        <p>Please wait while we finish restoring your sign-in.</p>
      </section>
    );
  }

  if (session?.user) {
    return <Navigate to={nextPath} replace />;
  }

  return (
    <motion.section
      className="surface-card narrow-card auth-card"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={motionTokens.spring}
    >
      <p className="eyebrow">Authentication</p>
      <h2>{mode === "signin" ? "Sign in faster and save your work" : "Create your account"}</h2>
      <p className="auth-card__copy">
        Use email/password or continue with Google. Email signup in your current Supabase project requires confirming
        the inbox link before password sign-in will work.
      </p>

      <button className="oauth-button" type="button" onClick={handleGoogleAuth} disabled={submitting}>
        <span className="google-mark" aria-hidden="true">G</span>
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or use email</span>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary-button" type="submit" disabled={submitting}>
          {mode === "signin" ? <LogIn size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
          {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <button
        className="ghost-button"
        type="button"
        disabled={submitting}
        onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>

      {status ? <p className="success-text">{status}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </motion.section>
  );
}

export default AuthPage;
