import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (form.fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters.';
    }
    if (!EMAIL_REGEX.test(form.email)) {
      return 'Please enter a valid email address.';
    }
    if (form.password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // Public registration always creates a student account.
      await register(form);
      navigate('/dashboard/student', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafbfc] text-slate-950">
      {/* Clean, subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-56 -top-64 h-[620px] w-[620px] rounded-full bg-gradient-to-br from-blue-100/80 via-indigo-100/45 to-violet-100/55" />
        <div className="absolute -left-56 -bottom-72 h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-blue-100/70 via-indigo-50/40 to-violet-100/50" />

        <div className="absolute -right-20 top-[-100px] h-[470px] w-[650px] rounded-[50%] border border-white/90 rotate-[16deg]" />
        <div className="absolute -left-36 bottom-[-150px] h-[430px] w-[650px] rounded-[50%] border border-white/90 -rotate-[16deg]" />

        <div
          className="absolute left-5 top-36 hidden h-28 w-24 opacity-50 sm:block"
          style={{
            backgroundImage: 'radial-gradient(#c5d5ff 1.7px, transparent 1.7px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div
          className="absolute bottom-20 right-7 hidden h-28 w-24 opacity-50 sm:block"
          style={{
            backgroundImage: 'radial-gradient(#c5d5ff 1.7px, transparent 1.7px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
        <Link
          to="/"
          className="text-[24px] font-extrabold tracking-[-1.4px] text-slate-950"
        >
          Join<span className="text-blue-600">Eazy</span>
        </Link>

        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600 sm:text-base"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Back to Home
        </Link>
      </header>

      {/* Registration content */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl items-center justify-center px-5 pb-12 pt-2 sm:px-8 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_520px_1fr] lg:gap-10">

          {/* Left introduction */}
          <div className="hidden max-w-md lg:block lg:pl-3">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              Get Started
            </p>

            <h2 className="text-5xl font-extrabold leading-[1.02] tracking-[-2.5px]">
              Create Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Student Account
              </span>
            </h2>

            <p className="mt-6 max-w-sm text-lg leading-7 text-slate-500">
              Join thousands of learners and unlock new opportunities with
              JoinEazy.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-4">
              <MiniFeature
                icon="⌁"
                title="Learn"
                text="Access resources"
                className="text-blue-600 bg-blue-50"
              />
              <MiniFeature
                icon="♧"
                title="Connect"
                text="Find opportunities"
                className="text-violet-600 bg-violet-50"
              />
              <MiniFeature
                icon="↗"
                title="Grow"
                text="Build your future"
                className="text-emerald-600 bg-emerald-50"
              />
            </div>
          </div>

          {/* Main form card */}
          <div className="w-full">
            <form
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-[520px] rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_22px_65px_rgba(35,65,120,0.11)] backdrop-blur-xl sm:p-8 md:p-9"
            >
              {/* Logo */}
              <div className="mb-5 flex justify-center">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 shadow-[0_12px_28px_rgba(37,99,235,0.22)]">
                  <span className="text-[30px] font-black tracking-[-3px] text-white">
                    JE
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-extrabold tracking-[-1px] text-slate-950 sm:text-[29px]">
                  Create a student account
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Fill in your details to get started
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mt-0.5 h-5 w-5 shrink-0"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Full name */}
              <div className="mt-7">
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Full name
                </label>

                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="3.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M5.5 20c.7-4 2.9-6 6.5-6s5.8 2 6.5 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-12 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mt-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Email
                </label>

                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-12 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mt-5">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Password
                </label>

                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-12 py-3.5 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.5 4.3 9.5 7-.3.9-.9 2-1.7 3M6.2 6.3C4.4 7.6 3.3 9.3 2.5 12c1 2.7 4.3 7 9.5 7 1.2 0 2.3-.2 3.3-.6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path
                          d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="2.7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs font-medium text-slate-400">
                  Minimum 8 characters.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? 'Creating account...' : 'Register'}
                {!submitting && (
                  <span className="text-xl leading-none transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Login */}
              <p className="text-center text-sm font-medium text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 transition hover:text-indigo-600 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </form>
          </div>

          {/* Right feature list */}
          <div className="hidden space-y-6 lg:block lg:pl-8">
            <Feature
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path
                    d="M12 3l7 3v5c0 4.7-2.9 8.7-7 10-4.1-1.3-7-5.3-7-10V6l7-3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="Secure & Reliable"
              text="Your data stays safe"
              iconClass="text-blue-600 bg-blue-50"
            />

            <Feature
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <circle
                    cx="9"
                    cy="8"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="17"
                    cy="9"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 15c2.7.1 4.4 1.4 5 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Student Focused"
              text="Built for your success"
              iconClass="text-violet-600 bg-violet-50"
            />

            <Feature
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path
                    d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="Future Ready"
              text="More opportunities ahead"
              iconClass="text-emerald-600 bg-emerald-50"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text, iconClass }) {
  return (
    <div className="flex items-center gap-5">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_25px_rgba(80,100,180,0.08)] ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-[17px] font-extrabold tracking-[-0.3px] text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function MiniFeature({ icon, title, text, className }) {
  return (
    <div>
      <div
        className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold ${className}`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs font-medium leading-4 text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default Register;
