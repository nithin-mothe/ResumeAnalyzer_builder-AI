import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAvatarPresentation, getDisplayName, getProfileStats, getUserProfile } from "../utils/profile";

function Navbar({ session }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user || null;
  const avatar = useMemo(() => getAvatarPresentation(user), [user]);
  const profile = useMemo(() => getUserProfile(user), [user]);
  const stats = useMemo(() => getProfileStats(), [session?.user?.id]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link className="brand" to="/">
          ResumeForge AI
        </Link>
        <span className="navbar__caption">AI resume analysis, ATS checks, smart templates, and career guidance</span>
      </div>
      <nav className="nav-links">
        <NavLink to="/analyzer">Analyzer</NavLink>
        <NavLink to="/ats-match">ATS Match</NavLink>
        <NavLink to="/builder">Builder</NavLink>
        <NavLink to="/redesign">Redesign</NavLink>
        <NavLink to="/chat">Resume Chat</NavLink>
        <NavLink to="/job-tracker">Job Tracker</NavLink>
      </nav>
      <div className="nav-auth">
        {user ? (
          <div className="nav-profile" ref={menuRef}>
            <button
              className="nav-profile__trigger"
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="profile-avatar" style={avatar.style}>
                {avatar.imageUrl ? <img src={avatar.imageUrl} alt={getDisplayName(user)} /> : <span>{avatar.initials}</span>}
              </span>
              <span className="nav-profile__copy">
                <strong>{getDisplayName(user)}</strong>
                <small>{profile.headline || user.email}</small>
              </span>
            </button>

            {menuOpen ? (
              <div className="nav-profile__menu" role="menu">
                <div className="nav-profile__menu-header">
                  <span className="profile-avatar profile-avatar--large" style={avatar.style}>
                    {avatar.imageUrl ? (
                      <img src={avatar.imageUrl} alt={getDisplayName(user)} />
                    ) : (
                      <span>{avatar.initials}</span>
                    )}
                  </span>
                  <div className="stack">
                    <strong>{getDisplayName(user)}</strong>
                    <span className="nav-user">{user.email}</span>
                    <span className="helper-text">{profile.location || profile.career_goal}</span>
                  </div>
                </div>

                <div className="nav-profile__stats">
                  <article>
                    <strong>{stats.savedDrafts}</strong>
                    <span>Drafts</span>
                  </article>
                  <article>
                    <strong>{stats.jobsTracked}</strong>
                    <span>Jobs</span>
                  </article>
                  <article>
                    <strong>{stats.trackedCompanies}</strong>
                    <span>Companies</span>
                  </article>
                </div>

                <div className="nav-profile__actions">
                  <Link className="profile-menu__link" to="/profile" onClick={() => setMenuOpen(false)}>
                    Open Profile
                  </Link>
                  <Link className="profile-menu__link" to="/builder" onClick={() => setMenuOpen(false)}>
                    Resume Builder
                  </Link>
                  <Link className="profile-menu__link" to="/job-tracker" onClick={() => setMenuOpen(false)}>
                    Job Tracker
                  </Link>
                  <button className="profile-menu__logout" type="button" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link className="primary-button" to="/auth">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
