import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Navbar({ session }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
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
        {session?.user ? (
          <>
            <span className="nav-user">{session.user.email}</span>
            <button className="ghost-button" onClick={handleSignOut}>
              Sign out
            </button>
          </>
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
