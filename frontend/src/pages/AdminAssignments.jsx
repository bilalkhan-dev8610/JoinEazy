import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import {
  createAssignmentRequest,
  updateAssignmentRequest,
  fetchAssignments,
  fetchAssignment,
} from '../services/assignment.service';
import { fetchAllGroupsAdmin } from '../services/group.service';

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  resourceUrl: '',
  isGlobal: true,
  groupIds: [],
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function AdminAssignments() {
  const [assignments, setAssignments] = useState(undefined);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadAssignments = async () => {
    try {
      const { data } = await fetchAssignments();
      setAssignments(data.assignments);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assignments.');
      setAssignments([]);
    }
  };

  const loadGroups = async () => {
    try {
      const { data } = await fetchAllGroupsAdmin();
      setGroups(data.groups);
    } catch {
      setGroups([]);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadGroups();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = async (assignmentSummary) => {
    setError('');
    try {
      const { data } = await fetchAssignment(assignmentSummary.id);
      const assignment = data.assignment;

      setEditingId(assignment.id);
      setForm({
        title: assignment.title,
        description: assignment.description || '',
        dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 16) : '',
        resourceUrl: assignment.resourceUrl || '',
        isGlobal: assignment.isGlobal,
        groupIds: assignment.groups.map((g) => g.id),
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to load assignment details.'
      );
    }
  };

  const toggleGroup = (groupId) => {
    setForm((p) => ({
      ...p,
      groupIds: p.groupIds.includes(groupId)
        ? p.groupIds.filter((id) => id !== groupId)
        : [...p.groupIds, groupId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.title.trim().length < 2) {
      setError('Title must be at least 2 characters.');
      return;
    }

    if (!form.isGlobal && form.groupIds.length === 0) {
      setError('Select at least one group, or choose "All students".');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      resourceUrl: form.resourceUrl.trim() || null,
      isGlobal: form.isGlobal,
      groupIds: form.isGlobal ? [] : form.groupIds,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateAssignmentRequest(editingId, payload);
      } else {
        await createAssignmentRequest(payload);
      }

      resetForm();
      await loadAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <Navbar />

      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Subtle decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-44 -top-52 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-blue-100/80 via-indigo-100/45 to-violet-100/65" />
          <div className="absolute -left-44 bottom-[-260px] h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-blue-100/70 via-indigo-100/35 to-violet-100/55" />
          <div className="absolute right-[-90px] bottom-[-120px] h-[330px] w-[330px] rounded-full border border-white/90" />
          <div
            className="absolute left-7 top-24 hidden h-28 w-24 opacity-55 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#bcd0ff 1.7px, transparent 1.7px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div
            className="absolute right-8 top-[620px] hidden h-28 w-24 opacity-50 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#bcd0ff 1.7px, transparent 1.7px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <section className="relative z-10 mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          {/* Hero */}
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600 sm:text-sm">
                Assignments
              </p>

              <h1 className="mt-4 text-4xl font-extrabold leading-[1.06] tracking-[-1.8px] sm:text-5xl">
                Create &amp; Manage
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Assignments
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Create new assignments, share resources, and keep students on
                track with their learning journey.
              </p>
            </div>

            <div className="hidden justify-center lg:flex">
              <AssignmentIllustration />
            </div>
          </div>

          {error && (
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
              <span className="mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Main content */}
          <div className="mt-9 grid gap-6 lg:grid-cols-[1.55fr_0.72fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[22px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_55px_rgba(35,65,125,0.08)] sm:p-7"
            >
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <DocumentIcon />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold tracking-[-0.5px]">
                    {editingId ? 'Edit Assignment' : 'Create Assignment'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Fill in the details to create a new assignment
                  </p>
                </div>
              </div>

              <FieldLabel>Title</FieldLabel>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Chapter 3 Homework"
                icon={<DocumentSmallIcon />}
              />

              <FieldLabel className="mt-5">Description (optional)</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-4 text-slate-400">
                  <DescriptionIcon />
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="min-h-[105px] w-full resize-y rounded-xl border border-slate-200 bg-white px-11 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  rows={3}
                  placeholder="Write a brief description about the assignment..."
                />
              </div>

              <FieldLabel className="mt-5">Due date (optional)</FieldLabel>
              <Input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                icon={<CalendarIcon />}
              />

              <FieldLabel className="mt-5">OneDrive link (optional)</FieldLabel>
              <Input
                type="url"
                value={form.resourceUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, resourceUrl: e.target.value }))
                }
                placeholder="https://1drv.ms/..."
                icon={<LinkIcon />}
              />

              <FieldLabel className="mt-5">Assign to</FieldLabel>

              <div className="mt-2 flex flex-wrap gap-3">
                <RadioOption
                  checked={form.isGlobal}
                  onChange={() =>
                    setForm((p) => ({ ...p, isGlobal: true }))
                  }
                  label="All students"
                />

                <RadioOption
                  checked={!form.isGlobal}
                  onChange={() =>
                    setForm((p) => ({ ...p, isGlobal: false }))
                  }
                  label="Specific groups"
                />
              </div>

              {!form.isGlobal && (
                <div className="mt-4 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                  {groups.length === 0 && (
                    <p className="px-3 py-3 text-sm text-slate-400">
                      No groups exist yet.
                    </p>
                  )}

                  {groups.map((g) => (
                    <label
                      key={g.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={form.groupIds.includes(g.id)}
                        onChange={() => toggleGroup(g.id)}
                        className="mt-0.5 h-4 w-4 accent-blue-600"
                      />
                      <span>
                        <span className="font-semibold text-slate-800">
                          {g.name}
                        </span>
                        <span className="block text-xs text-slate-400">
                          ({g.memberCount} member
                          {g.memberCount === 1 ? '' : 's'}, led by{' '}
                          {g.leaderName})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create Assignment'}
                  {!saving && <span className="text-lg">→</span>}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Feature cards */}
            <aside className="space-y-4">
              <FeatureCard
                variant="blue"
                icon={<UsersIcon />}
                title="Reach Students"
                text="Assign to all students or specific groups."
              />

              <FeatureCard
                variant="violet"
                icon={<DocumentIcon />}
                title="Share Resources"
                text="Attach OneDrive links and helpful materials."
              />

              <FeatureCard
                variant="green"
                icon={<CalendarIcon />}
                title="Stay Organized"
                text="Set due dates and keep everything on track."
              />

              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_35px_rgba(35,65,125,0.06)]">
                <div className="text-4xl leading-none text-violet-500">“</div>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Education is the most powerful weapon which you can use to
                  change the world.
                </p>
                <p className="mt-3 text-xs font-bold text-slate-400">
                  — Nelson Mandela
                </p>
              </div>
            </aside>
          </div>

          {/* All assignments */}
          <section className="mt-7 rounded-[22px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_55px_rgba(35,65,125,0.07)] sm:p-7">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ListIcon />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-[-0.5px]">
                  All Assignments
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  View and manage all created assignments
                </p>
              </div>
            </div>

            {assignments === undefined && (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                Loading...
              </div>
            )}

            {assignments && assignments.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                No assignments yet.
              </div>
            )}

            <ul className="space-y-3">
              {assignments &&
                assignments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                          <DocumentSmallIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900">
                            {a.title}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Due: {formatDate(a.dueDate)} ·{' '}
                            {a.isGlobal
                              ? 'All students'
                              : `${a.groupCount} group(s)`}
                          </p>

                          {a.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {a.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="self-start rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                      >
                        ✎&nbsp; Edit
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        </section>
      </main>
    </div>
  );
}

function FieldLabel({ children, className = '' }) {
  return (
    <label
      className={`block text-xs font-bold text-slate-800 sm:text-sm ${className}`}
    >
      {children}
    </label>
  );
}

function Input({
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="relative mt-2">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function RadioOption({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-blue-600"
      />
      {label}
    </label>
  );
}

function FeatureCard({ icon, title, text, variant }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_35px_rgba(35,65,125,0.06)]">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles[variant]}`}
      >
        {icon}
      </div>

      <div>
        <h3 className="font-extrabold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function AssignmentIllustration() {
  return (
    <div className="relative h-[245px] w-[380px]">
      <div className="absolute bottom-3 left-10 h-7 w-72 rounded-full bg-blue-100/70 blur-xl" />

      <div className="absolute left-8 top-12 h-[170px] w-[285px] -rotate-2 rounded-[18px] border border-blue-100 bg-white/90 p-5 shadow-[0_22px_40px_rgba(45,85,160,0.12)]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-md bg-blue-500" />
          <span className="font-extrabold text-blue-600">Assignment</span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="h-3 w-40 rounded-full bg-blue-100" />
          <div className="h-3 w-52 rounded-full bg-slate-100" />
          <div className="h-3 w-44 rounded-full bg-slate-100" />
          <div className="h-3 w-32 rounded-full bg-slate-100" />
        </div>
      </div>

      <div className="absolute right-4 top-1 flex h-20 w-20 rotate-[-7deg] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_15px_30px_rgba(79,70,229,0.22)]">
        <CapIcon />
      </div>

      <div className="absolute bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-blue-300 bg-blue-50 text-blue-500 shadow-[0_15px_30px_rgba(45,85,160,0.1)]">
        <CalendarIcon />
      </div>

      <div className="absolute right-[-20px] top-24 text-lg font-medium italic leading-8 text-blue-300">
        Plan
        <br />
        Assign
        <br />
        Track
        <br />
        Succeed
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
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
  );
}

function DocumentSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15 3v5h5M9 13h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DescriptionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M5 6h14M5 10h14M5 14h9M5 18h7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
      <path
        d="M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M10 13.5 14 10a3.5 3.5 0 0 1 5 5l-2 2a3.5 3.5 0 0 1-5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m14 10.5-4 3.5a3.5 3.5 0 0 1-5-5l2-2a3.5 3.5 0 0 1 5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
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
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path
        d="M9 6h10M9 12h10M9 18h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 6h.01M5 12h.01M5 18h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10">
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

export default AdminAssignments;
