import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

function AuthPage({ session, authReady }) {
  const location = useLocation();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = `${window.location.origin}/auth`;
  const nextPath = location.state?.from?.pathname || "/profile";

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const authError =
      hashParams.get("error_description") ||
      hashParams.get("error") ||
      queryParams.get("error_description") ||
      queryParams.get("error");

    if (authError) {
      setError(authError.replace(/\+/g, " "));
    }

    const authCode = queryParams.get("code");
    const accessToken = hashParams.get("access_token");

    if (authCode || accessToken) {
      setStatus("Authentication completed. Redirecting you into ResumeForge...");
    }
  }, []);

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
    setStatus("");

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (authError) {
      setError(`${authError.message} Check Google provider setup and Supabase redirect URLs for the deployed domain.`);
      setSubmitting(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <section className="surface-card narrow-card auth-card">
        <p className="eyebrow">Authentication</p>
        <h2>Supabase frontend variables are missing</h2>
        <p>Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env`.</p>
      </section>
    );
  }

  if (!authReady) {
    return (
      <section className="surface-card narrow-card auth-card">
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
    <section className="surface-card narrow-card auth-card">
      <p className="eyebrow">Authentication</p>
      <h2>{mode === "signin" ? "Sign in faster and save your work" : "Create your account"}</h2>
      <p className="auth-card__copy">
        Use email/password or continue with Google. Email signup in your current Supabase project requires confirming
        the inbox link before password sign-in will work.
      </p>

      <button className="oauth-button" type="button" onClick={handleGoogleAuth} disabled={submitting}>
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
    </section>
  );
}

export default AuthPage;
