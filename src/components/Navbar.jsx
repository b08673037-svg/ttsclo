import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  FiSearch, FiShoppingBag, FiSun, FiMoon, FiMenu, 
  FiUser, FiLogOut 
} from "react-icons/fi";
import AnnouncementBar from "./AnnouncementBar";
import SearchPanel from "./SearchPanel";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { subscribeToAuth, signOutCustomer } from "../services/customerAuthService";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/track-order", label: "Track Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Listen for user auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Close menus on route change
  useEffect(() => {
    setSearchOpen(false);
    setMobileOpen(false);
    setCartOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.search]);

  // 3. Close menus on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setCartOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await signOutCustomer();
      setDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="navbar-wrapper">
      <AnnouncementBar />

      <div className="navbar">
        <div className="navbar__inner">
          
          {/* LOGO */}
          <Link to="/" className="logo" aria-label="TT'S Collection home">
            <span className="logo__main">TT'S</span>
            <span className="logo__sub">COLLECTION</span>
          </Link>

          {/* CENTER NAVIGATION */}
          <nav className="nav-links" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* UTILITIES */}
          <div className="nav-utilities">
            
            {/* Search */}
            <button
              className="icon-btn"
              aria-label="Open search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <FiSearch />
            </button>

            {/* Theme Toggle */}
            <button
              className="icon-btn"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>

            {/* Cart */}
            <button
              className="icon-btn cart-btn"
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
            >
              <FiShoppingBag />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* USER: Avatar Dropdown OR Sign In Button */}
            {user ? (
              <div className="nav-user-menu">
                <button
                  className="nav-user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                >
                  <div className="nav-user-avatar">
                    {user.displayName?.[0]?.toUpperCase() || <FiUser />}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="nav-user-dropdown">
                    <Link to="/account" onClick={() => setDropdownOpen(false)}>
                      <FiUser /> My Account
                    </Link>
                    <button onClick={handleLogout}>
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="signin-btn">SIGN IN</Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              className="icon-btn hamburger"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <FiMenu />
            </button>

          </div>
        </div>

        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}