import { useState, useEffect } from "react";
import { FiUserPlus, FiTrash2, FiShield, FiUser, FiX, FiCheck, FiMail } from "react-icons/fi";
import { subscribeToAdminUsers, createAdminUser, updateAdminRole, deleteAdminUser } from "../../services/adminUserService";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "cashier" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToAdminUsers((data) => {
      clearTimeout(timeoutId);
      setUsers(data);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      await createAdminUser(formData.email, formData.password, formData.role, formData.name);
      setFormData({ name: "", email: "", password: "", role: "cashier" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError("Failed to create user: " + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (uid, newRole) => {
    if (window.confirm(`Change this user's role to ${newRole}?`)) {
      try {
        await updateAdminRole(uid, newRole);
      } catch (err) {
        alert("Failed to update role: " + err.message);
      }
    }
  };

  const handleDelete = async (uid, email) => {
    if (window.confirm(`Remove ${email} from the admin panel? (Note: You must also delete their account from Firebase Authentication manually.)`)) {
      try {
        await deleteAdminUser(uid);
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h2 className="page-title">Admin & Cashier Users</h2>
          <p className="page-subtitle">Manage who has access to your store's admin panel.</p>
        </div>
        <button className="users-add-btn" onClick={() => setShowForm(true)}>
          <FiUserPlus /> Add New User
        </button>
      </div>

      {showForm && (
        <div className="users-form-card">
          <div className="users-form-head">
            <h3>Create New Admin or Cashier</h3>
            <button className="users-form-close" onClick={() => setShowForm(false)}><FiX /></button>
          </div>
          {error && <p className="users-error">{error}</p>}
          <form className="users-form" onSubmit={handleSubmit}>
            <div className="users-form-row">
              <div className="users-form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ali Khan" />
              </div>
              <div className="users-form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="cashier@ttscollection.com" />
              </div>
            </div>
            <div className="users-form-row">
              <div className="users-form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" />
              </div>
              <div className="users-form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="cashier">Cashier (Products & Orders only)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
              </div>
            </div>
            <div className="users-form-actions">
              <button type="button" className="users-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="users-btn-primary" disabled={saving}>
                {saving ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-table-wrap">
        {users.length === 0 ? (
          <div className="users-empty"><FiUser size={40} /><p>No users yet.</p></div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div className="users-user-cell">
                      <div className="users-avatar">{(u.name?.[0] || u.email?.[0] || "?").toUpperCase()}</div>
                      <span className="users-name">{u.name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`users-role-badge ${u.role}`}>
                      {u.role === "admin" ? <><FiShield /> Admin</> : <><FiUser /> Cashier</>}
                    </span>
                  </td>
                  <td>
                    <div className="users-actions">
                      <select className="users-role-select" value={u.role} onChange={(e) => handleRoleChange(u.uid, e.target.value)}>
                        <option value="cashier">Cashier</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button className="users-delete-btn" onClick={() => handleDelete(u.uid, u.email)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}