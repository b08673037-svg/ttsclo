import { NavLink } from "react-router-dom";
import { FiX } from "react-icons/fi";
import "./MobileMenu.css";

export default function MobileMenu({ open, onClose, links }) {
  return (
    <>
      <div className={`mobile-menu-overlay ${open ? "open" : ""}`} onClick={onClose}></div>
      
      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu__header">
          <span className="mobile-menu__title">MENU</span>
          <button className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <nav className="mobile-menu__links" aria-label="Mobile navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `mobile-link ${isActive ? "is-active" : ""}`}
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className={({ isActive }) => `mobile-link mobile-link--signin ${isActive ? "is-active" : ""}`}
            onClick={onClose}
          >
            Sign In
          </NavLink>
        </nav>
      </div>
    </>
  );
}