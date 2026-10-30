import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiArrowLeft } from "react-icons/fi";
import { signInCustomer, signUpCustomer } from "../services/customerAuthService";
import "./Login.css";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signInCustomer(form.email, form.password);
        navigate("/account");
      } else {
        if (!form.name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        await signUpCustomer(form.name, form.email, form.password);
        navigate("/account");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="login-back">
          <FiArrowLeft /> Back to Store
        </Link>

        <div className="login-card">
          <div className="login-brand">
            <span className="brand-main">TT'S</span>
            <span className="brand-sub">COLLECTION</span>
          </div>

          <h1 className="login-title">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="login-subtitle">
            {mode === "login"
              ? "Sign in to track your orders and manage your account."
              : "Join TTS Collection to shop faster and track your orders."}
          </p>

          <div className="login-tabs">
            <button
              className={`login-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`login-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
              type="button"
            >
              Register
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="login-input-group">
                <FiUser className="login-input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="login-input-group">
              <FiMail className="login-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-input-group">
              <FiLock className="login-input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <p className="login-switch">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")}>
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}>
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}