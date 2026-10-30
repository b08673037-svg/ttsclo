import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAdminRole } from "../../hooks/useAdminRole";
import {
  FiHome, FiBox, FiLayers, FiShoppingBag, FiPackage,
  FiUsers, FiStar, FiBarChart2, FiTag, FiMail, FiSettings,
  FiLogOut, FiX, FiShoppingCart, FiMessageSquare, FiUserPlus,
} from "react-icons/fi";
import "./AdminSidebar.css";

const NAV_GROUPS = [
  {
    label: "Main",
    roles: ["admin", "cashier"],
    items: [
      { path: "/admin", label: "Dashboard", icon: <FiHome /> },
      { path: "/admin/products", label: "Products", icon: <FiBox /> },
      { path: "/admin/orders", label: "Orders", icon: <FiShoppingBag /> },
      { path: "/admin/inventory", label: "Inventory", icon: <FiPackage /> },
    ],
  },
  {
    label: "Management",
    roles: ["admin"],
    items: [
      { path: "/admin/categories", label: "Categories", icon: <FiLayers /> },
      { path: "/admin/customers", label: "Customers", icon: <FiUsers /> },
      { path: "/admin/reviews", label: "Reviews", icon: <FiStar /> },
      { path: "/admin/analytics", label: "Analytics", icon: <FiBarChart2 /> },
      { path: "/admin/coupons", label: "Coupons", icon: <FiTag /> },
      { path: "/admin/subscribers", label: "Subscribers", icon: <FiMail /> },
      { path: "/admin/messages", label: "Messages", icon: <FiMessageSquare /> },
    ],
  },
  {
    label: "System",
    roles: ["admin"],
    items: [
      { path: "/admin/users", label: "Admin Users", icon: <FiUserPlus /> },
      { path: "/admin/settings", label: "Settings", icon: <FiSettings /> },
    ],
  },
];

export default function AdminSidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();
  const { role } = useAdminRole(); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Strict filtering: if role exists, check if it's in the allowed roles. 
  // If role is null, default to showing everything so you don't get locked out.
  const currentRole = role || "admin"; 
  
  const visibleGroups = NAV_GROUPS.filter(
    (group) => !group.roles || group.roles.includes(currentRole)
  );

  return (
    <>
      <div className={`admin-sidebar-overlay ${isOpen ? "open" : ""}`} onClick={closeSidebar}></div>

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div className="brand-logo">
            <span className="brand-mono">T</span>
          </div>
          <div className="brand-text">
            <span className="brand-main">TTS</span>
            <span className="brand-sub">COLLECTION</span>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {visibleGroups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <span className="sidebar-group-label">{group.label}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  onClick={closeSidebar}
                >
                  <span className="nav-icon-chip">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="sidebar-brand-card">
            <div className="brand-card-icon">
              <FiShoppingCart />
            </div>
            <div className="brand-card-text">
              <span className="brand-card-title">TTS Collection</span>
              <span className="brand-card-sub">
                {currentRole === "cashier" ? "Cashier Panel" : "Admin Panel"}
              </span>
            </div>
          </div>
          <p className="brand-card-tagline">Better Products. Happier Customers.</p>

          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}