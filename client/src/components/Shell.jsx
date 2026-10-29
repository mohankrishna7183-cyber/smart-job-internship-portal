import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, LayoutDashboard, LogOut, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

export default function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem("orbit-theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("orbit-theme", dark ? "dark" : "light");
  }, [dark]);

  function signOut() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/" aria-label="Orbit home">
            <span className="brand-mark"><BriefcaseBusiness size={19} strokeWidth={2.2} /></span>
            <span>orbit<span className="brand-period">.</span></span>
          </Link>
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}><Search size={16} /> Explore jobs</NavLink>
            {user && <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Dashboard</NavLink>}
            <button className="icon-button theme-toggle" onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? "light" : "dark"} mode`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <div className="account-actions">
                <span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
                <span className="account-name">{user.name.split(" ")[0]}</span>
                <button className="button button-outline button-small" onClick={signOut}><LogOut size={15} /> Sign out</button>
              </div>
            ) : (
              <div className="account-actions">
                <Link className="nav-login" to="/login">Log in</Link>
                <Link className="button button-primary button-small" to="/register">Get started</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <Link className="brand footer-brand" to="/"><span className="brand-mark"><BriefcaseBusiness size={16} /></span> orbit<span className="brand-period">.</span></Link>
        <span>Find work that moves you.</span>
        <span>© {new Date().getFullYear()} Orbit Careers</span>
      </footer>
    </>
  );
}
