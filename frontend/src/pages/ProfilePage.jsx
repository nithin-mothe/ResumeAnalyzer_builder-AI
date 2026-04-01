import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import { supabase } from "../lib/supabase";
import {
  avatarOptions,
  formatMemberSince,
  getAuthProviderLabel,
  getAvatarInitials,
  getAvatarTone,
  getDisplayName,
  getProfileStats,
  getStoredProfile,
  getUserProfile,
  saveStoredProfile,
} from "../utils/profile";

function ProfilePage({ session }) {
  const user = session?.user || null;
  const [form, setForm] = useState(() => ({
    full_name: "",
    headline: "",
    location: "",
    about: "",
    career_goal: "",
    avatar_tone: "amber",
  }));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => getProfileStats(), []);
  const avatarTone = useMemo(() => getAvatarTone(form.avatar_tone), [form.avatar_tone]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const profile = getUserProfile(user);
    setForm({
      full_name: profile.full_name,
      headline: profile.headline,
      location: profile.location,
      about: profile.about,
      career_goal: profile.career_goal,
      avatar_tone: profile.avatar_tone,
    });
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");

    const payload = {
      ...getStoredProfile(),
      ...form,
    };

    try {
      saveStoredProfile(payload);

      if (supabase) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: payload,
        });

        if (updateError) {
          throw updateError;
        }
      }

      setStatus("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="User Profile"
        title={`Welcome back, ${getDisplayName(user)}.`}
        description="Customize how your profile appears across ResumeForge, keep your account details organized, and jump back into the workflows you use most."
        stats={[
          { value: stats.savedDrafts, label: "Saved drafts" },
          { value: stats.jobsTracked, label: "Tracked jobs" },
          { value: stats.parsedWords, label: "Parsed words" },
        ]}
      />

      <section className="builder-main-layout">
        <form className="surface-card builder-form-card" onSubmit={handleSave}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profile Details</p>
              <h2>Set your account identity</h2>
            </div>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          <div className="profile-avatar-selector">
            {avatarOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`avatar-tone ${form.avatar_tone === option.id ? "avatar-tone--active" : ""}`}
                style={{ "--avatar-accent": option.accent, "--avatar-surface": option.surface }}
                onClick={() => setForm((current) => ({ ...current, avatar_tone: option.id }))}
              >
                <span className="avatar-chip">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Full Name</span>
              <input name="full_name" value={form.full_name} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Headline</span>
              <input name="headline" value={form.headline} onChange={handleChange} />
            </label>
          </div>

          <label className="field">
            <span>Location</span>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Bengaluru, India" />
          </label>

          <label className="field">
            <span>Career Goal</span>
            <input
              name="career_goal"
              value={form.career_goal}
              onChange={handleChange}
              placeholder="Example: land senior backend interviews at product companies"
            />
          </label>

          <label className="field">
            <span>About</span>
            <textarea
              name="about"
              rows="5"
              value={form.about}
              onChange={handleChange}
              placeholder="Share a short introduction that makes your account feel personal and complete."
            />
          </label>

          {status ? <p className="success-text">{status}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <div className="builder-preview-column">
          <section className="surface-card profile-card">
            <div className="profile-card__header">
              <div
                className="profile-avatar profile-avatar--large"
                style={{
                  "--avatar-accent": avatarTone.accent,
                  "--avatar-surface": avatarTone.surface,
                }}
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt={form.full_name} />
                ) : (
                  <span>{getAvatarInitials(user)}</span>
                )}
              </div>
              <div className="stack">
                <p className="eyebrow">Account Summary</p>
                <h2>{form.full_name || getDisplayName(user)}</h2>
                <p className="helper-text">{form.headline || "AI resume strategist"}</p>
              </div>
            </div>

            <div className="profile-fact-list">
              <article className="mini-stat">
                <strong>{user.email}</strong>
                <span>Email address</span>
              </article>
              <article className="mini-stat">
                <strong>{getAuthProviderLabel(user)}</strong>
                <span>Sign-in provider</span>
              </article>
              <article className="mini-stat">
                <strong>{formatMemberSince(user)}</strong>
                <span>Member since</span>
              </article>
            </div>
          </section>

          <section className="surface-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your Activity</p>
                <h2>Profile-linked workflow snapshot</h2>
              </div>
            </div>
            <div className="job-stats-grid">
              <article className="job-stat-card">
                <strong>{stats.savedDrafts}</strong>
                <span>Drafts</span>
              </article>
              <article className="job-stat-card">
                <strong>{stats.trackedCompanies}</strong>
                <span>Companies</span>
              </article>
              <article className="job-stat-card">
                <strong>{stats.interviews}</strong>
                <span>Interviews</span>
              </article>
              <article className="job-stat-card">
                <strong>{stats.offers}</strong>
                <span>Offers</span>
              </article>
              <article className="job-stat-card">
                <strong>{stats.parsedWords}</strong>
                <span>Words parsed</span>
              </article>
            </div>
          </section>

          <section className="surface-card profile-links-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Quick Links</p>
                <h2>Jump back into work</h2>
              </div>
            </div>
            <div className="profile-link-grid">
              <Link className="profile-shortcut" to="/builder">
                Resume Builder
              </Link>
              <Link className="profile-shortcut" to="/redesign">
                Company Redesign
              </Link>
              <Link className="profile-shortcut" to="/chat">
                Resume Chat
              </Link>
              <Link className="profile-shortcut" to="/job-tracker">
                Job Tracker
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
