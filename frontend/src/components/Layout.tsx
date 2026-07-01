import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UnlockButton } from "./UnlockButton";
import "./Layout.css";

export function Layout() {
  const { authenticated, logout } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            Vibe<span>Opl-g</span>
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              Forside
            </NavLink>
            <NavLink to="/projekter">Projekter</NavLink>
            {authenticated && (
              <>
                <NavLink to="/projekter/ny">Nyt projekt</NavLink>
                <button type="button" className="btn btn-ghost" onClick={() => logout()}>
                  Log ud
                </button>
              </>
            )}
            {!authenticated && <UnlockButton />}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">VibeOpl-g — inspiration til vibe-codede undervisningsprojekter</div>
      </footer>
    </div>
  );
}
