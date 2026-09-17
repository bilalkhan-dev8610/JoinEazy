import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

function AdminDashboard() {
  const { user } = useAuth();
  const [usersByRole, setUsersByRole] = useState([]);

  useEffect(() => {
    api
      .get('/admin/overview')
      .then(({ data }) => setUsersByRole(data.usersByRole || []))
      .catch(() => setUsersByRole([]));
  }, []);

  const adminCount =
    usersByRole.find((row) => row.role?.toLowerCase() === 'admin')?.count ?? 0;

  const studentCount =
    usersByRole.find((row) => row.role?.toLowerCase() === 'student')?.count ?? 0;

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafbfc] text-slate-950">
      <Navbar />

      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Clean milky-white background with subtle modern accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-52 -top-64 h-[620px] w-[620px] rounded-full bg-gradient-to-br from-blue-100/80 via-indigo-100/45 to-violet-100/55" />

          <div className="absolute -left-56 -bottom-72 h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-blue-100/70 via-indigo-50/40 to-violet-100/50" />

          <div className="absolute -right-20 top-[-100px] h-[470px] w-[650px] rounded-[50%] border border-white/90 rotate-[16deg]" />

          <div className="absolute -left-36 bottom-[-150px] h-[430px] w-[650px] rounded-[50%] border border-white/90 -rotate-[16deg]" />

          <div
            className="absolute left-8 top-24 hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#c5d5ff 1.8px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div
            className="absolute bottom-24 right-8 hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#c5d5ff 1.8px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          {/* Hero section */}
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 sm:text-sm">
                Admin Dashboard
              </p>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-[-2px] sm:text-5xl lg:text-[54px]">
                Welcome back,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {user?.fullName || 'Admin User'}!
                </span>
                <span className="ml-2 inline-block">👋</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Manage assignments, monitor users, and keep the platform
                running smoothly.
              </p>

              {/* Manage assignments card */}
              <Link
                to="/admin/assignments"
                className="group mt-9 flex min-h-[122px] w-full max-w-[610px] items-center gap-5 rounded-2xl border border-blue-200/80 bg-white/65 p-5 shadow-[0_15px_40px_rgba(40,70,130,0.07)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_48px_rgba(40,70,130,0.11)] sm:p-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                  >
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
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-extrabold tracking-[-0.4px] text-slate-900 sm:text-xl">
                    Manage Assignments
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
                    Create, view and manage all assignments.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg shadow-blue-500/20 transition duration-200 group-hover:translate-x-1">
                  →
                </div>
              </Link>
            </div>

            {/* Dashboard visual */}
            <div className="relative hidden min-h-[310px] items-center justify-center lg:flex">
              <div className="absolute right-5 top-0 text-right text-2xl font-medium italic leading-9 text-blue-300">
                Manage
                <br />
                Monitor
                <br />
                Grow
                <div className="ml-4 mt-1 h-1 w-28 -rotate-6 rounded-full bg-blue-200" />
              </div>

              <DashboardIllustration />
            </div>
          </div>

          {/* Users by role */}
          <section className="mt-8 rounded-[22px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(35,65,120,0.07)] backdrop-blur-xl sm:mt-9 sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Users by role
              </p>
            </div>

            <div className="space-y-3">
              <RoleRow
                role="Admin"
                description="Platform administrators"
                count={adminCount}
                variant="blue"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-7 w-7"
                  >
                    <path
                      d="m12 3 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 18h12"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />

              <RoleRow
                role="Student"
                description="Registered students"
                count={studentCount}
                variant="violet"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-7 w-7"
                  >
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
              />

              {usersByRole.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm font-medium text-slate-400">
                  No data yet.
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function RoleRow({ role, description, count, icon, variant }) {
  const isBlue = variant === 'blue';

  return (
    <div className="flex min-h-[74px] items-center gap-4 rounded-xl border border-slate-200/80 bg-white px-3 py-3 transition hover:border-blue-100 hover:shadow-sm sm:px-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          isBlue
            ? 'bg-blue-50 text-blue-600'
            : 'bg-violet-50 text-violet-600'
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-900 sm:text-base">
          {role}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">
          {description}
        </p>
      </div>

      <span
        className={`text-2xl font-extrabold sm:text-3xl ${
          isBlue ? 'text-blue-600' : 'text-violet-600'
        }`}
      >
        {count}
      </span>
    </div>
  );
}

function DashboardIllustration() {
  return (
    <div className="relative mt-10 h-[270px] w-[390px]">
      {/* Soft shadow */}
      <div className="absolute bottom-1 left-1/2 h-8 w-72 -translate-x-1/2 rounded-[50%] bg-blue-100/70 blur-xl" />

      {/* Browser window */}
      <div className="absolute left-3 top-8 h-[205px] w-[330px] -rotate-3 rounded-[18px] border border-blue-100 bg-white/90 shadow-[0_22px_40px_rgba(45,85,160,0.12)]">
        <div className="flex h-9 items-center gap-2 rounded-t-[18px] bg-blue-50/80 px-4">
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-cyan-300" />
        </div>

        <div className="flex gap-3 p-4">
          <div className="w-16 space-y-3">
            <div className="h-4 rounded-full bg-blue-100" />
            <div className="h-4 w-11 rounded-full bg-slate-100" />
            <div className="h-4 w-14 rounded-full bg-slate-100" />
            <div className="h-4 w-10 rounded-full bg-slate-100" />
            <div className="h-4 w-12 rounded-full bg-slate-100" />
          </div>

          <div className="flex-1 rounded-xl bg-slate-50 p-3">
            <div className="relative h-20">
              <svg
                viewBox="0 0 220 80"
                className="h-full w-full text-blue-500"
              >
                <path
                  d="M5 64 C30 56, 37 57, 55 43 S83 51, 101 38 S129 22, 145 31 S169 27, 185 16 S205 17, 216 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="145" cy="31" r="5" fill="currentColor" />
              </svg>
            </div>

            <div className="mt-1 flex items-end gap-3">
              <span className="h-8 w-4 rounded-t-md bg-violet-400" />
              <span className="h-12 w-4 rounded-t-md bg-blue-500" />
              <span className="h-16 w-4 rounded-t-md bg-blue-400" />
              <span className="h-10 w-4 rounded-t-md bg-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings tile */}
      <div className="absolute right-3 top-20 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_15px_30px_rgba(99,70,220,0.25)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10">
          <path
            d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="m19 13 .1-2-1.8-.8a6 6 0 0 0-.7-1.7l.7-1.8-1.5-1.4-1.8.7a6 6 0 0 0-1.7-.7L11.5 3h-2l-.7 2.3a6 6 0 0 0-1.7.7l-1.8-.7-1.5 1.4.7 1.8a6 6 0 0 0-.7 1.7L2 11v2l1.8.8a6 6 0 0 0 .7 1.7l-.7 1.8 1.5 1.4 1.8-.7a6 6 0 0 0 1.7.7l.7 2.3h2l.7-2.3a6 6 0 0 0 1.7-.7l1.8.7 1.5-1.4-.7-1.8a6 6 0 0 0 .7-1.7L19 13Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* User tile */}
      <div className="absolute bottom-12 right-9 flex h-16 w-32 items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_12px_25px_rgba(40,70,130,0.12)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M6 20c.6-3.6 2.6-5.5 6-5.5s5.4 1.9 6 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-2.5 w-12 rounded-full bg-blue-100" />
          <div className="h-2 w-16 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
