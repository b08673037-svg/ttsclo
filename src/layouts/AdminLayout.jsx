import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("Admin");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />
      <div className="admin-main">
        <AdminTopbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          adminEmail={adminEmail}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}