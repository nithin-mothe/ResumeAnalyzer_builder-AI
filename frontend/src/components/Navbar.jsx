import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motionTokens, useMotionSettings } from "./MotionSystem";
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
  const { animationsEnabled, setAnimationsEnabled } = useMotionSettings();

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
    <motion.header
      className="navbar"
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...motionTokens.spring, delay: 0.04 }}
    >
      <div className="navbar__brand">
        <Link className="brand" to="/">
          <motion.span
            className="brand-mark"
            aria-hidden="true"
            whileHover={{ rotate: -4, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Flame size={23} strokeWidth={2.4} />
          </motion.span>
          <span className="brand__text">ResumeForge AI</span>
        </Link>
        <span className="navbar__caption">AI resume analysis, ATS checks, smart templates, and career guidance</span>
      </div>
      <motion.nav className={`nav-links ${mobileOpen ? "nav-links--open" : ""}`} aria-label="Primary navigation" layout>
        {navItems.map(({ to, label, Icon, badge }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive ? <motion.span className="nav-active-pill" layoutId="nav-active-pill" /> : null}
                <motion.span className="nav-link__content" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                  {badge ? <span className="nav-link__badge">{badge}</span> : null}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </motion.nav>
      <div className="nav-auth">
        <button
          className={`nav-motion-toggle ${animationsEnabled ? "nav-motion-toggle--active" : ""}`}
          type="button"
          onClick={() => setAnimationsEnabled((current) => !current)}
          aria-label={animationsEnabled ? "Disable animations" : "Enable animations"}
          title={animationsEnabled ? "Disable animations" : "Enable animations"}
        >
          <Sparkles size={17} aria-hidden="true" />
        </button>
        {user ? (
          <div className="nav-profile" ref={menuRef}>
            <motion.button
              className="nav-profile__trigger"
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="profile-avatar" style={avatar.style}>
                {avatar.imageUrl ? <img src={avatar.imageUrl} alt={getDisplayName(user)} /> : <span>{avatar.initials}</span>}
              </span>
              <span className="nav-profile__copy">
                <strong>{getDisplayName(user)}</strong>
                <small>{profile.headline || user.email}</small>
              </span>
              <ChevronDown size={16} aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
              {menuOpen ? (
              <motion.div
                className="nav-profile__menu"
                role="menu"
                initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
                transition={motionTokens.spring}
              >
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
              </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link className="primary-button" to="/auth">
            <UserRound size={17} aria-hidden="true" />
            <span className="nav-auth__label">Sign in</span>
            </Link>
          </motion.div>
        )}
      </div>
      <motion.button
        className="nav-toggle"
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        whileTap={{ scale: 0.94 }}
      >
        {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </motion.button>
    </motion.header>
  );
}

export default Navbar;
