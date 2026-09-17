import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { fetchMyAssignments } from '../services/assignment.service';

function formatDate(value) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString();
}

function isPastDue(value) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

function StudentAssignments() {
  const [assignments, setAssignments] = useState(undefined); // undefined = loading
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyAssignments()
      .then(({ data }) => setAssignments(data.assignments))
      .catch((err) => {
        setError(
          err?.response?.data?.message || 'Failed to load assignments.'
        );
        setAssignments([]);
      });
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <Navbar />

      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Soft milky-white background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-36 -top-44 h-[440px] w-[440px] rounded-full bg-gradient-to-br from-blue-100/75 via-indigo-100/45 to-violet-100/70" />
          <div className="absolute -left-44 bottom-[-230px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-blue-100/75 via-indigo-100/35 to-violet-100/55" />
          <div className="absolute right-[-130px] bottom-[-150px] h-[360px] w-[360px] rounded-full border border-white/90" />

          <div
            className="absolute left-7 top-24 hidden h-32 w-28 opacity-55 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#bcd0ff 1.7px, transparent 1.7px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div
            className="absolute right-8 top-[510px] hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#bcd0ff 1.7px, transparent 1.7px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <section className="relative z-10 mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-11 lg:px-10 lg:py-12">
          {/* Header / Hero */}
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_330px]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 sm:text-xs">
                My Assignments
              </p>

              <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-[-1.7px] sm:text-5xl">
                Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Assignments
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                Stay on track with your homework and learning resources.
                <br className="hidden sm:block" />
                Complete assignments, explore materials, and achieve your
                goals.
              </p>
            </div>

            <div className="hidden justify-center lg:flex">
              <LearningIllustration />
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 font-bold">
                !
              </span>
              {error}
            </div>
          )}

          {/* Loading */}
          {assignments === undefined && (
            <div className="mt-7 rounded-[20px] border border-slate-200/70 bg-white/95 p-8 shadow-[0_18px_50px_rgba(35,65,125,0.07)]">
              <div className="animate-pulse space-y-4">
                <div className="h-5 w-40 rounded bg-slate-100" />
                <div className="h-3 w-56 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-10 w-36 rounded-xl bg-slate-100" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {assignments && assignments.length === 0 && (
            <div className="mt-7 rounded-[20px] border border-dashed border-blue-200 bg-white/90 p-10 text-center shadow-[0_18px_50px_rgba(35,65,125,0.06)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <DocumentIcon />
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                No assignments yet
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your assignments will appear here when they are assigned.
              </p>
            </div>
          )}

          {/* Assignment list */}
          {assignments && assignments.length > 0 && (
            <ul className="mt-7 space-y-4">
              {assignments.map((a, index) => {
                const overdue = isPastDue(a.dueDate);

                return (
                  <li
                    key={a.id}
                    className="group rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_14px_40px_rgba(35,65,125,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(35,65,125,0.1)] sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {/* Assignment icon */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          index % 2 === 0
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-violet-50 text-violet-600'
                        }`}
                      >
                        <DocumentIcon />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-lg font-extrabold tracking-[-0.3px] text-slate-900 sm:text-xl">
                              {a.title}
                            </h2>

                            <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm">
                              <CalendarIcon />
                              <span>Due: {formatDate(a.dueDate)}</span>
                            </div>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1.5 text-[11px] font-bold ${
                              overdue
                                ? 'bg-rose-50 text-rose-500'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            <span className="mr-1.5">●</span>
                            {overdue ? 'Past due' : 'Upcoming'}
                          </span>
                        </div>

                        {a.description && (
                          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-500">
                            {a.description}
                          </p>
                        )}

                        {a.resourceUrl && (
                          <a
                            href={a.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 sm:text-sm"
                          >
                            <LinkIcon />
                            <span>Open OneDrive link</span>
                            <ExternalIcon />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Motivation */}
          {assignments && assignments.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/90 via-white/90 to-violet-50/90 px-5 py-4 shadow-[0_12px_35px_rgba(79,70,229,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <BulbIcon />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-indigo-950">
                    Keep learning, keep growing!
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Every assignment brings you one step closer to your goals.
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold italic text-violet-500 sm:pr-2">
                You got this! 🚀
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function LearningIllustration() {
  return (
    <div className="relative h-[190px] w-[330px]">
      <div className="absolute bottom-4 left-5 h-5 w-64 rounded-full bg-blue-100/70 blur-xl" />

      <div className="absolute left-5 top-8 h-[125px] w-[215px] -rotate-[-4deg] rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-[0_18px_35px_rgba(35,65,125,0.1)]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-blue-500" />
            <span className="h-2.5 w-24 rounded-full bg-blue-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-blue-400" />
            <span className="h-2.5 w-32 rounded-full bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-blue-300" />
            <span className="h-2.5 w-28 rounded-full bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-blue-200" />
            <span className="h-2.5 w-20 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-0 flex h-20 w-20 -rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_15px_30px_rgba(79,70,229,0.2)]">
        <CapIcon />
      </div>

      <div className="absolute bottom-7 right-14 flex h-16 w-16 items-center justify-center rounded-full border-4 border-violet-300 bg-white text-violet-600 shadow-[0_10px_25px_rgba(79,70,229,0.15)]">
        <ClockIcon />
      </div>

      <div className="absolute right-[-15px] top-14 text-sm font-medium italic leading-7 text-blue-300">
        Learn
        <br />
        Submit
        <br />
        Grow
      </div>

      <div className="absolute left-0 top-20 text-violet-400">✦</div>
      <div className="absolute right-16 top-28 text-blue-400">✦</div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M10 13.5 14 10a3.5 3.5 0 0 1 5 5l-2 2a3.5 3.5 0 0 1-5 0"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="m14 10.5-4 3.5a3.5 3.5 0 0 1-5-5l2-2a3.5 3.5 0 0 1 5 0"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <path
        d="M14 5h5v5M19 5l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M9 18h6M10 21h4M8.5 14.5A6 6 0 1 1 15.5 14c-.9.7-1.5 1.7-1.5 2.8h-4c0-1.1-.6-1.9-1.5-2.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9">
      <path
        d="m3 9 9-5 9 5-9 5-9-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6 11v5c3.5 2.5 8.5 2.5 12 0v-5M21 9v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default StudentAssignments;
