import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

function StudentDashboard() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/students/dashboard')
      .then(({ data }) => setMessage(data.message))
      .catch(() => setMessage(''));
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafbfc] text-slate-950">
      <Navbar />

      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Subtle decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-48 -top-64 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-100/80 via-indigo-100/45 to-violet-100/55" />
          <div className="absolute -left-56 -bottom-72 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-100/70 via-indigo-50/40 to-violet-100/50" />

          <div className="absolute -right-20 top-[-100px] h-[470px] w-[650px] rounded-[50%] border border-white/90 rotate-[16deg]" />
          <div className="absolute -left-36 bottom-[-150px] h-[430px] w-[650px] rounded-[50%] border border-white/90 -rotate-[16deg]" />

          <div
            className="absolute left-8 top-28 hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage: 'radial-gradient(#c5d5ff 1.8px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div
            className="absolute bottom-20 right-8 hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage: 'radial-gradient(#c5d5ff 1.8px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          {/* Hero */}
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-blue-600 sm:text-sm">
                Student Dashboard
              </p>

              <h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-2px] sm:text-5xl lg:text-[56px]">
                Welcome back,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {user?.fullName || 'Student'}!
                </span>
                <span className="ml-2 inline-block">👋</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Here&apos;s your student space. Manage your groups, view
                assignments, and stay on track with your learning journey.
              </p>

              {message && (
                <div className="mt-6 inline-flex max-w-2xl items-center gap-3 rounded-xl border border-blue-100 bg-white/70 px-4 py-3 text-sm font-medium text-slate-500 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {message}
                </div>
              )}
            </div>

            {/* Education illustration-style visual */}
            <div className="relative hidden min-h-[280px] items-center justify-center lg:flex">
              <div className="absolute right-8 top-2 text-right text-2xl font-medium italic leading-9 text-blue-300">
                Learn
                <br />
                Grow
                <br />
                Achieve
              </div>

              <div className="relative mt-8 flex flex-col items-center">
                <div className="relative h-20 w-48 rounded-[50%] bg-gradient-to-r from-indigo-600 to-blue-500 shadow-xl">
                  <div className="absolute left-1/2 top-[-32px] h-20 w-24 -translate-x-1/2 skew-x-[-12deg] rounded-t-[55%] bg-gradient-to-r from-blue-600 to-indigo-700" />
                  <div className="absolute left-1/2 top-[-8px] h-3 w-3 -translate-x-1/2 rounded-full bg-yellow-400" />
                  <div className="absolute right-7 top-7 h-16 w-1.5 rotate-[-4deg] rounded-full bg-yellow-400" />
                  <div className="absolute right-5 top-[66px] h-5 w-3 rounded-b-full bg-yellow-400" />
                </div>

                <div className="mt-2 h-8 w-52 rounded-xl bg-white shadow-[0_8px_20px_rgba(30,60,120,0.15)]" />
                <div className="h-9 w-56 rounded-b-xl bg-gradient-to-r from-blue-100 to-white shadow-md" />
                <div className="mt-1 h-10 w-52 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg" />
                <div className="h-8 w-56 rounded-b-xl bg-white shadow-md" />
                <div className="mt-3 h-3 w-64 rounded-full bg-indigo-100" />
              </div>
            </div>
          </div>

          {/* Action cards */}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-12">
            <DashboardCard
              to="/groups"
              title="View My Group"
              description="Check your group members and details."
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 15c2.7.1 4.4 1.4 5 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
              iconClass="bg-blue-50 text-blue-600"
              arrowClass="bg-blue-600"
            />

            <DashboardCard
              to="/assignments"
              title="View Assignments"
              description="See your upcoming and submitted assignments."
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path
                    d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 3v5h5M9 13h6M9 17h5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
              iconClass="bg-violet-50 text-violet-600"
              arrowClass="bg-violet-600"
            />
          </div>

          {/* Motivation banner */}
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-blue-100/70 bg-white/65 px-5 py-5 shadow-[0_12px_35px_rgba(40,70,130,0.06)] backdrop-blur-xl sm:px-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
              💡
            </div>

            <p className="text-sm font-medium leading-6 text-slate-500 sm:text-base">
              Small steps every day lead to big results. Keep going!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardCard({
  to,
  title,
  description,
  icon,
  iconClass,
  arrowClass,
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-[140px] items-center gap-5 rounded-2xl border border-slate-200/80 bg-white/65 p-5 shadow-[0_14px_40px_rgba(40,70,130,0.07)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_20px_45px_rgba(40,70,130,0.11)] sm:p-6"
    >
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-extrabold tracking-[-0.4px] text-slate-900">
          {title}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl text-white shadow-md transition duration-200 group-hover:translate-x-1 ${arrowClass}`}
      >
        →
      </div>
    </Link>
  );
}

export default StudentDashboard;
