import { useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api, getErrorMessage } from "../api.js";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${isRegister ? "register" : "login"}`, form);
      signIn(data.data);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't sign you in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link className="brand auth-brand" to="/"><span className="brand-mark"><BriefcaseBusiness size={18} /></span> orbit<span className="brand-period">.</span></Link>
        <div className="auth-story-content">
          <span className="story-label"><Sparkles size={14} /> A BETTER WAY TO MOVE FORWARD</span>
          <h1>Find a place<br />where you <em>belong.</em></h1>
          <p>Good work changes everything. Meet the teams, roles, and people that help you do yours.</p>
          <div className="story-proof"><div className="story-avatars"><i>A</i><i>R</i><i>S</i><i>+</i></div><span><strong>12,000+</strong> careers in motion</span></div>
        </div>
        <span className="auth-story-foot">Built for what’s next.</span>
      </section>
      <section className="auth-form-side">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to opportunities</Link>
        <div className="auth-form-wrap">
          <span className="section-kicker">{isRegister ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Create your account" : "Good to see you."}</h2>
          <p className="auth-subtitle">{isRegister ? "Start finding work that feels like you." : "Sign in to pick up where you left off."}</p>
          {error && <div className="notice notice-error">{error}</div>}
          <form onSubmit={submit} className="form-stack">
            {isRegister && <>
              <label className="form-label">I’m joining as
                <select name="role" value={form.role} onChange={update} className="form-control">
                  <option value="candidate">Candidate — looking for opportunities</option>
                  <option value="recruiter">Recruiter — hiring great people</option>
                </select>
              </label>
              <label className="form-label">Full name<input className="form-control" name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required minLength={2} maxLength={100} /></label>
            </>}
            <label className="form-label">Email address<input className="form-control" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required /></label>
            <label className="form-label">Password<span className="password-wrap"><input className="form-control" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={update} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            {isRegister && <div className="password-hint"><Check size={14} /> Use at least 8 characters for a stronger password.</div>}
            <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? "One moment…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={16} /></button>
          </form>
          <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Orbit?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
          <p className="auth-terms">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </div>
  );
}
