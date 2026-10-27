import { useEffect, useState, type FormEvent } from "react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

type FormValues = { name: string; email: string; password: string; confirmPassword: string };
type FieldErrors = Partial<Record<keyof FormValues, string[]>>;
type User = { id: string; name: string; email: string; role: string };

function Brand() {
  return <a className="brand" href="/" aria-label="CairoPulse home"><span className="brand-mark">✦</span>Cairo<span>Pulse</span></a>;
}

function Header() {
  return <header className="site-header"><div className="shell header-inner"><Brand /><nav aria-label="Main navigation"><a href="/#how-it-works">How it works</a><a className="nav-cta" href="/register">Create account <span aria-hidden="true">↗</span></a></nav></div></header>;
}

function HomePage() {
  return <><Header /><main className="shell home-main"><div className="home-copy"><span className="eyebrow"><span className="eyebrow-dot" /> Your city, your kind of night</span><h1>Every night has <em>a story.</em></h1><p>Discover the events worth leaving home for. Save your favorites and build a plan that fits your time, budget, and mood.</p><a className="button-primary" href="/register">Create your account <span aria-hidden="true">→</span></a><div className="home-note">Find your people. Make your plans. Feel the city.</div></div><div className="home-art" role="img" aria-label="Abstract artwork inspired by Cairo nightlife"><span className="art-halo" /><span className="art-spark">✧</span><div className="art-label"><small>COMING SOON · CAIRO</small><strong>Make room for memorable nights.</strong></div></div></main><section id="how-it-works" className="shell steps-section" aria-labelledby="steps-title"><div><span className="section-label">HOW IT WORKS</span><h2 id="steps-title">Your next outing, sorted.</h2></div><div className="steps-grid"><article><span>01</span><h3>Discover</h3><p>Find events that match your interests.</p></article><article><span>02</span><h3>Save</h3><p>Keep the ones you don't want to miss.</p></article><article><span>03</span><h3>Plan</h3><p>Build a day that works for you.</p></article></div></section></>;
}

function RegisterPage() {
  const [values, setValues] = useState<FormValues>({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setMessage("");
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (values.name.trim().length < 2) errors.name = ["Enter at least 2 characters."];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = ["Enter a valid email address."];
    if (values.password.length < 8) errors.password = ["Use at least 8 characters."];
    if (values.password !== values.confirmPassword) errors.confirmPassword = ["Passwords do not match."];
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, name: values.name.trim(), email: values.email.trim() }),
      });
      const result = await response.json() as { message?: string; fieldErrors?: FieldErrors };
      if (!response.ok) {
        setMessage(result.message ?? "We couldn't create your account. Please try again.");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      window.location.assign("/welcome");
    } catch {
      setMessage("We couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <><Header /><main className="shell register-layout"><aside className="register-story"><div className="story-art"><span className="story-orbit"/><span className="story-star">✧</span></div><div className="story-copy"><span className="section-label">CAIROPULSE</span><h2>Good plans make<br /><em>great stories.</em></h2><p>Your next favorite place, song, or memory could be one event away.</p><div className="story-footer"><span className="story-line"/> MADE FOR CURIOUS PEOPLE IN CAIRO</div></div></aside><section className="register-panel" aria-labelledby="register-title"><div className="form-top"><span className="section-label">JOIN THE CITY</span><h1 id="register-title">Create your account</h1><p>A few details and you're ready to explore.</p></div><form onSubmit={submit} noValidate><div className="form-field"><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" value={values.name} onChange={(event) => update("name", event.target.value)} placeholder="Your full name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} required/><span className="field-error" id="name-error">{fieldErrors.name?.[0]}</span></div><div className="form-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} required/><span className="field-error" id="email-error">{fieldErrors.email?.[0]}</span></div><div className="form-field"><label htmlFor="password">Password</label><div className="password-input"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 8 characters" aria-invalid={Boolean(fieldErrors.password)} aria-describedby="password-help password-error" required/><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div><span className="field-hint" id="password-help">Use 8 or more characters.</span><span className="field-error" id="password-error">{fieldErrors.password?.[0]}</span></div><div className="form-field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Repeat your password" aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? "confirm-error" : undefined} required/><span className="field-error" id="confirm-error">{fieldErrors.confirmPassword?.[0]}</span></div>{message && <p className="form-message" role="alert">{message}</p>}<button className="button-primary submit-button" type="submit" disabled={submitting}>{submitting ? "Creating your account…" : "Create account"}<span aria-hidden="true">→</span></button></form><p className="form-bottom">Already have an account? Login is coming next.</p></section></main></>;
}

function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${apiBaseUrl}/auth/me`, { credentials: "include" })
      .then(async (response) => response.ok ? (await response.json() as { user: User }).user : null)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  return <><Header /><main className="shell welcome-main">{loading ? <p>Loading your account…</p> : user ? <><div className="welcome-symbol">✦</div><span className="section-label">YOU'RE IN</span><h1>Welcome to CairoPulse, {user.name.split(" ")[0]}.</h1><p>Your account is ready. Soon you'll be able to discover events and build your own Cairo itinerary.</p><a className="button-primary" href="/">Back to home <span aria-hidden="true">→</span></a></> : <><h1>Session not found</h1><p>Create an account to start exploring CairoPulse.</p><a className="button-primary" href="/register">Create account <span aria-hidden="true">→</span></a></>}</main></>;
}

export default function App() {
  if (window.location.pathname === "/register") return <RegisterPage />;
  if (window.location.pathname === "/welcome") return <WelcomePage />;
  return <HomePage />;
}
