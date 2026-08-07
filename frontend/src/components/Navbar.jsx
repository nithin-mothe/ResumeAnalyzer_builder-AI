import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  FileSearch,
  FileText,
  Flame,
  LogOut,
  Menu,
  MessageSquareText,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAvatarPresentation, getDisplayName, getProfileStats, getUserProfile } from "../utils/profile";

const navItems = [
  { to: "/analyzer", label: "Analyzer", Icon: FileSearch },
  { to: "/ats-match", label: "ATS Match", Icon: BarChart3 },
  { to: "/builder", label: "Builder", Icon: FileText },
  { to: "/redesign", label: "Redesign", Icon: WandSparkles },
  { to: "/chat", label: "Resume Chat", Icon: MessageSquareText },
  { to: "/job-tracker", label: "Job Tracker", Icon: BriefcaseBusiness, badge: "AI" },
];

function Navbar({ session }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            <Flame size={23} strokeWidth={2.4} />
          </span>
          ResumeForge AI
        </Link>
        <span className="navbar__caption">AI resume analysis, ATS checks, smart templates, and career guidance</span>
      </div>
      <nav className={`nav-links ${mobileOpen ? "nav-links--open" : ""}`} aria-label="Primary navigation">
        {navItems.map(({ to, label, Icon, badge }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            {badge ? <span className="nav-link__badge">{badge}</span> : null}
          </NavLink>
        ))}
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
              <ChevronDown size={16} aria-hidden="true" />
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
                    <span><UserRound size={17} aria-hidden="true" /> Open Profile</span>
                  </Link>
                  <Link className="profile-menu__link" to="/builder" onClick={() => setMenuOpen(false)}>
                    <span><FileText size={17} aria-hidden="true" /> Resume Builder</span>
                  </Link>
                  <Link className="profile-menu__link" to="/job-tracker" onClick={() => setMenuOpen(false)}>
                    <span><BriefcaseBusiness size={17} aria-hidden="true" /> Job Tracker</span>
                  </Link>
                  <button className="profile-menu__logout" type="button" onClick={handleSignOut}>
                    <span><LogOut size={17} aria-hidden="true" /> Sign out</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link className="primary-button" to="/auth">
            <UserRound size={17} aria-hidden="true" />
            Sign in
          </Link>
        )}
      </div>
      <button
        className="nav-toggle"
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
    </header>
  );
}

export default Navbar;
