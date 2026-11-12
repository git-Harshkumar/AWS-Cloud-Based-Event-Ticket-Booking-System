import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Brand, Icon } from "./DesignSystem";

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = [
    { to: "/events", label: "Discover" },
    ...(user
      ? [
          { to: "/dashboard", label: "My space" },
          { to: "/my-bookings", label: "My tickets" },
        ]
      : []),
    { to: "/infrastructure", label: "The cloud behind it" },
  ];
  if (user?.role === "ADMIN") links.push({ to: "/admin", label: "Admin" });
  const close = () => setOpen(false);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <nav className="container-main" aria-label="Main navigation">
          <div className="nav-bar">
            <Brand />
            <div className="desktop-links">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "is-active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="desktop-account">
              {user ? (
                <>
                  <span className="nav-greeting">
                    Hi, {user.name?.split(" ")[0]}
                  </span>
                  <button onClick={onLogout} className="btn-secondary">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get started <Icon name="arrow" />
                  </Link>
                </>
              )}
            </div>
            <button
              className="mobile-toggle btn-secondary"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
          {open && (
            <div
              id="mobile-nav"
              className="mobile-links"
              key={location.pathname}
            >
              {links.map((link) => (
                <NavLink
                  onClick={close}
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "is-active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    onLogout();
                    close();
                  }}
                  className="btn-secondary"
                >
                  Sign out
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link
                    onClick={close}
                    to="/login"
                    className="btn-secondary flex-1"
                  >
                    Sign in
                  </Link>
                  <Link
                    onClick={close}
                    to="/register"
                    className="btn-primary flex-1"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
