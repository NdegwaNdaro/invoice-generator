import { ArrowRight, Eye, EyeOff, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authenticate(mode, form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-showcase">
        <div className="brand light">
          <span className="brand-mark">A</span>
          <div><strong>AfriInvoice</strong><small>Business made simple</small></div>
        </div>
        <div className="auth-pitch">
          <span className="eyebrow"><Sparkles size={16} /> Built for African businesses</span>
          <h1>Professional invoices.<br />Faster payments.</h1>
          <p>Create, send, and track polished invoices in KES, USD, UGX, TZS, NGN, GHS, and more.</p>
          <div className="auth-benefits">
            <span><FileCheck2 /> Branded PDF invoices</span>
            <span><ShieldCheck /> Secure business records</span>
          </div>
        </div>
        <small>Simple invoicing for freelancers, agencies, and growing teams.</small>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow dark">{isRegister ? "START FOR FREE" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Create your account" : "Sign in to your workspace"}</h2>
          <p>{isRegister ? "Set up your invoice workspace in a minute." : "Manage your customers and invoices."}</p>
          {error && <div className="alert error">{error}</div>}
          {isRegister && (
            <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Jane Wanjiku" /></label>
          )}
          <label>Email address<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="jane@business.com" /></label>
          <label>
            Password
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="button primary wide" disabled={submitting}>
            {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={18} />
          </button>
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to AfriInvoice?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create account"}</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
