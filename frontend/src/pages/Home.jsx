import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth } from '../services/health.service';
import { useAuth } from '../context/AuthContext.jsx';

function Home() {
  const [status, setStatus] = useState('checking...');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    getHealth()
      .then(() => setStatus('connected'))
      .catch(() => setStatus('unreachable'));
  }, []);

  const isConnected = status === 'connected';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8faff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -bottom-52 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-blue-500/80 via-indigo-400/60 to-violet-400/60" />
        <div className="absolute -right-44 -top-56 h-[620px] w-[620px] rounded-full bg-gradient-to-bl from-violet-500/70 via-indigo-400/55 to-blue-400/45" />
        <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/15 blur-3xl" />
        <div className="absolute -right-24 top-[-120px] h-[600px] w-[850px] rounded-[50%] border border-white/70 rotate-[18deg]" />
        <div className="absolute -left-72 bottom-[-230px] h-[600px] w-[900px] rounded-[50%] border border-white/60 -rotate-[20deg]" />

        <div
          className="absolute left-8 top-44 h-28 w-28 opacity-45"
          style={{
            backgroundImage: 'radial-gradient(#b9c9ff 2px, transparent 2px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div
          className="absolute bottom-24 right-10 h-32 w-32 opacity-45"
          style={{
            backgroundImage: 'radial-gradient(#b9c9ff 2px, transparent 2px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-7 py-6 sm:px-12">
        <div className="text-[25px] font-extrabold tracking-[-1.4px]">
          Join<span className="text-blue-600">Eazy</span>
        </div>

        <div className="hidden items-center gap-4 text-sm font-medium text-white/90 sm:flex">
          <span>Build</span>
          <span className="text-white/50">•</span>
          <span>Connect</span>
          <span className="text-white/50">•</span>
          <span>Grow</span>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-7xl items-center px-6 pb-12 pt-4 sm:px-10 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_520px_1fr] lg:gap-10">

          <div className="order-2 max-w-md lg:order-1 lg:pl-4">
            <p className="mb-5 inline-flex rounded-full border border-blue-200/70 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm backdrop-blur">
              Welcome to JoinEazy
            </p>

            <h1 className="text-5xl font-extrabold leading-[0.98] tracking-[-2.8px] sm:text-6xl">
              Simplify
              <br />
              Access,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Empower
              </span>
              <br />
              Opportunities
            </h1>

            <p className="mt-7 max-w-sm text-lg leading-7 text-slate-500">
              JoinEazy helps you get started faster with secure authentication
              and role-based access.
            </p>
          </div>

          <div className="order-1 lg:order-2">
            <div className="rounded-[28px] border border-white/80 bg-white/65 p-7 shadow-[0_30px_80px_rgba(53,86,170,0.16)] backdrop-blur-2xl sm:p-9">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 shadow-[0_15px_35px_rgba(59,92,246,0.30)]">
                <div className="relative text-5xl font-black tracking-[-5px] text-white">
                  J<span className="ml-[-2px]">E</span>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-[40px] font-extrabold leading-none tracking-[-2.2px]">
                  Join<span className="text-blue-600">Eazy</span>
                </h2>

                <p className="mt-4 text-[15px] font-medium text-slate-500">
                  Authentication + RBAC foundation.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-4 py-2 text-sm font-semibold text-emerald-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  API status: {status}
                </div>
              </div>

              <div className="mt-7 space-y-3.5">
                {isAuthenticated ? (
                  <Link
                    to={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Go to dashboard
                    <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      Log in
                      <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                    </Link>

                    <Link
                      to="/register"
                      className="flex w-full items-center justify-center rounded-xl border border-blue-500 bg-white/55 px-5 py-3.5 text-base font-bold text-blue-600 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs font-medium text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>Welcome to a simpler way</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="order-3 space-y-5 lg:pl-5">
            <Feature
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path d="M12 3l7 3v5c0 4.7-2.9 8.7-7 10-4.1-1.3-7-5.3-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Secure"
              text="Built with best practices"
              iconClass="text-blue-600 bg-blue-50"
            />

            <Feature
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 15c2.7.1 4.4 1.4 5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              title="Role-Based Access"
              text="Right access for everyone"
              iconClass="text-violet-600 bg-violet-50"
            />

            <Feature
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              }
              title="Scalable"
              text="Ready for the future"
              iconClass="text-fuchsia-600 bg-fuchsia-50"
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
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_25px_rgba(80,100,180,0.10)] ${iconClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-[17px] font-extrabold tracking-[-0.3px] text-slate-900">{title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export default Home;