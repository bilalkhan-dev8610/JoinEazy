import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const redirectByRole = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    navigate(
      role === 'admin' ? '/dashboard/admin' : '/dashboard/student',
      { replace: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);

    try {
      const user = await login(form);
      redirectByRole(user.role);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafbfc] text-slate-950">
      {/* Subtle decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-52 -top-64 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-100/80 via-indigo-100/45 to-violet-100/50" />
        <div className="absolute -left-56 -bottom-72 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-100/70 via-slate-100/40 to-violet-100/50" />

        <div className="absolute -right-24 top-[-100px] h-[470px] w-[650px] rounded-[50%] border border-white/90 rotate-[16deg]" />
        <div className="absolute -left-36 bottom-[-150px] h-[430px] w-[650px] rounded-[50%] border border-white/90 -rotate-[16deg]" />

        <div
          className="absolute left-5 top-36 hidden h-28 w-24 opacity-55 sm:block"
          style={{
            backgroundImage: 'radial-gradient(#c5d5ff 1.7px, transparent 1.7px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div
          className="absolute bottom-20 right-7 hidden h-28 w-24 opacity-55 sm:block"
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

      {/* Login area */}
      <section className="relative z-10 flex min-h-[calc(100vh-90px)] items-center justify-center px-5 pb-12 pt-4 sm:px-6">
        <div className="w-full max-w-[470px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_55px_rgba(35,65,120,0.10)] backdrop-blur-xl sm:p-8 md:p-9"
          >
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 shadow-[0_12px_28px_rgba(37,99,235,0.22)]">
                <span className="text-[30px] font-black tracking-[-3px] text-white">
                  JE
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-[-1.2px] text-slate-950 sm:text-[34px]">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500 sm:text-[15px]">
                Log in to your JoinEazy account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-5 w-5 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="mt-7">
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
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-800"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 transition hover:text-indigo-600"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-12 py-3.5 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.5 4.3 9.5 7-0.3.9-.9 2-1.7 3M6.2 6.3C4.4 7.6 3.3 9.3 2.5 12c1 2.7 4.3 7 9.5 7 1.2 0 2.3-.2 3.3-.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="group mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? 'Logging in...' : 'Log in'}
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

            {/* Register */}
            <p className="text-center text-sm font-medium text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-blue-600 transition hover:text-indigo-600 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;