import { useState } from "react";
import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from "../lib/supabase";

function AuthPage({ session }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setError("");
    setStatus("");

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
        setStatus("Signed in successfully.");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          throw signUpError;
        }
        setStatus("Account created. Check your inbox if email confirmation is enabled.");
      }
    } catch (authError) {
      setError(authError.message);
    }
  };

  const handleGoogleAuth = async () => {
    if (!supabase) {
      return;
    }

    setError("");
    setStatus("");

    try {
      const response = await fetch(
        `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
          `${window.location.origin}/auth`
        )}&skip_http_redirect=true`,
        {
          headers: {
            apikey: supabaseAnonKey,
          },
        }
      );

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.msg || "Google sign-in is not enabled for this Supabase project yet."
        );
      }

      if (!payload?.url) {
        throw new Error("Google sign-in is not fully configured yet.");
      }

      window.location.assign(payload.url);
    } catch (authError) {
      setError(
        `${authError.message} Enable Google in Supabase Auth > Providers > Google, then add the site URL and redirect URL.`
      );
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

  if (session?.user) {
    return (
      <section className="surface-card narrow-card auth-card">
        <p className="eyebrow">Authentication</p>
        <h2>You are signed in</h2>
        <p>{session.user.email}</p>
      </section>
    );
  }

  return (
    <section className="surface-card narrow-card auth-card">
      <p className="eyebrow">Authentication</p>
      <h2>{mode === "signin" ? "Sign in faster and save your work" : "Create your account"}</h2>
      <p className="auth-card__copy">
        Use email/password or continue with Google. For Google sign-in, make sure the provider is enabled in your
        Supabase project.
      </p>

      <button className="oauth-button" type="button" onClick={handleGoogleAuth}>
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
        <button className="primary-button" type="submit">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <button
        className="ghost-button"
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
