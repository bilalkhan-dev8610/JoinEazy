import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  createGroupRequest,
  fetchMyGroup,
  updateGroupRequest,
  deleteGroupRequest,
  leaveGroupRequest,
  addMemberRequest,
  removeMemberRequest,
} from '../services/group.service';

function MyGroup() {
  const { user } = useAuth();

  const [group, setGroup] = useState(undefined);
  const [error, setError] = useState('');

  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [adding, setAdding] = useState(false);

  const [removingId, setRemovingId] = useState(null);
  const [disbanding, setDisbanding] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const loadGroup = async () => {
    try {
      const { data } = await fetchMyGroup();
      setGroup(data.group);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your group.');
      setGroup(null);
    }
  };

  useEffect(() => {
    loadGroup();
  }, []);

  const isLeader =
    group &&
    group.members.find((m) => m.id === user.id)?.role === 'owner';

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (createForm.name.trim().length < 2) {
      setError('Group name must be at least 2 characters.');
      return;
    }

    setCreating(true);
    try {
      const { data } = await createGroupRequest(createForm);
      setGroup(data.group);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      name: group.name,
      description: group.description || '',
    });
    setEditing(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setError('');

    if (editForm.name.trim().length < 2) {
      setError('Group name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await updateGroupRequest(editForm);
      setGroup(data.group);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update group.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisbandGroup = async () => {
    if (
      !window.confirm(
        'Disband this group? This removes all members and cannot be undone.'
      )
    ) {
      return;
    }

    setError('');
    setDisbanding(true);

    try {
      await deleteGroupRequest();
      setGroup(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to disband group.');
    } finally {
      setDisbanding(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Leave this group?')) return;

    setError('');
    setLeaving(true);

    try {
      await leaveGroupRequest();
      setGroup(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to leave group.');
    } finally {
      setLeaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Enter an email or student ID.');
      return;
    }

    setAdding(true);

    try {
      const { data } = await addMemberRequest(identifier.trim());
      setGroup(data.group);
      setIdentifier('');
      setShowAddForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add member.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setError('');
    setRemovingId(memberId);

    try {
      const { data } = await removeMemberRequest(memberId);
      setGroup(data.group);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafbfc] text-slate-950">
      <Navbar />

      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Modern milky-white background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-52 -top-64 h-[620px] w-[620px] rounded-full bg-gradient-to-br from-blue-100/80 via-indigo-100/45 to-violet-100/55" />
          <div className="absolute -left-56 -bottom-72 h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-blue-100/70 via-indigo-50/40 to-violet-100/50" />
          <div className="absolute -right-20 top-[-100px] h-[470px] w-[650px] rounded-[50%] border border-white/90 rotate-[16deg]" />
          <div className="absolute -left-36 bottom-[-150px] h-[430px] w-[650px] rounded-[50%] border border-white/90 -rotate-[16deg]" />

          <div
            className="absolute left-7 top-32 hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#c5d5ff 1.8px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div
            className="absolute bottom-20 right-8 hidden h-32 w-28 opacity-50 lg:block"
            style={{
              backgroundImage:
                'radial-gradient(#c5d5ff 1.8px, transparent 1.8px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          {/* Empty state / Create group */}
          {group === undefined && (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="rounded-2xl border border-slate-200/70 bg-white/75 px-6 py-4 text-sm font-medium text-slate-500 shadow-sm backdrop-blur-xl">
                Loading...
              </div>
            </div>
          )}

          {group === null && (
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.25fr] lg:gap-16">
              {/* Left content */}
              <div className="max-w-lg">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
                  Collaborate&nbsp; • &nbsp;Learn&nbsp; • &nbsp;Grow
                </p>

                <h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-2px] sm:text-5xl">
                  Create Your
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Study Group
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-slate-500 sm:text-lg">
                  Form a group, collaborate with peers, share ideas, and
                  achieve more together.
                </p>

                <div className="mt-9 space-y-5">
                  <InfoRow
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 15c2.7.1 4.4 1.4 5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    }
                    title="Work Together"
                    text="Collaborate and learn with your peers."
                    className="bg-blue-50 text-blue-600"
                  />

                  <InfoRow
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                        <path d="M9 18h6M10 21h4M8.8 14.5C7.7 13.5 7 12 7 10.3A5 5 0 0 1 12 5a5 5 0 0 1 5 5.3c0 1.7-.7 3.2-1.8 4.2-.7.7-1.2 1.2-1.2 2.5h-4c0-1.3-.5-1.8-1.2-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    title="Share Ideas"
                    text="Discuss, solve, and grow together."
                    className="bg-violet-50 text-violet-600"
                  />

                  <InfoRow
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                        <path d="M4 19V9M10 19V5M16 19v-8M22 19H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="m4 7 5-2 5 2 6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    title="Achieve More"
                    text="Stay motivated and reach your goals."
                    className="bg-emerald-50 text-emerald-600"
                  />
                </div>
              </div>

              {/* Form card */}
              <form
                onSubmit={handleCreateSubmit}
                className="w-full rounded-[24px] border border-slate-200/75 bg-white/90 p-6 shadow-[0_22px_65px_rgba(35,65,120,0.10)] backdrop-blur-xl sm:p-8 lg:p-9"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 15c2.7.1 4.4 1.4 5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold tracking-[-1px] sm:text-[29px]">
                      Create a Group
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      You&apos;re not in a group yet. Create one to get started.
                    </p>
                  </div>
                </div>

                {error && <ErrorMessage message={error} />}

                <div className="mt-8">
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Group name
                  </label>

                  <div className="relative">
                    <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400">
                      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 15c2.7.1 4.4 1.4 5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>

                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-12 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="e.g. Team Falcons"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Description (optional)
                  </label>

                  <div className="relative">
                    <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-400">
                      <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M15 3v5h5M9 13h6M9 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>

                    <textarea
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[128px] w-full resize-y rounded-xl border border-slate-300 bg-white px-12 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      rows={4}
                      placeholder="Tell us about your group..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="group mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                  {!creating && (
                    <span className="text-xl transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Existing group */}
          {group && !editing && (
            <GroupView
              group={group}
              isLeader={isLeader}
              error={error}
              setError={setError}
              startEditing={startEditing}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              identifier={identifier}
              setIdentifier={setIdentifier}
              adding={adding}
              handleAddMember={handleAddMember}
              removingId={removingId}
              handleRemoveMember={handleRemoveMember}
              disbanding={disbanding}
              handleDisbandGroup={handleDisbandGroup}
              leaving={leaving}
              handleLeaveGroup={handleLeaveGroup}
            />
          )}

          {/* Edit group */}
          {group && editing && (
            <form
              onSubmit={handleUpdateGroup}
              className="mx-auto max-w-3xl rounded-[24px] border border-slate-200/75 bg-white/90 p-6 shadow-[0_22px_65px_rgba(35,65,120,0.10)] backdrop-blur-xl sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Group Settings
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-1.2px]">
                Edit Group
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Update your group name and description.
              </p>

              {error && <ErrorMessage message={error} />}

              <div className="mt-7">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Group name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Description (optional)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[140px] w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  rows={4}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function GroupView({
  group,
  isLeader,
  error,
  setError,
  startEditing,
  showAddForm,
  setShowAddForm,
  identifier,
  setIdentifier,
  adding,
  handleAddMember,
  removingId,
  handleRemoveMember,
  disbanding,
  handleDisbandGroup,
  leaving,
  handleLeaveGroup,
}) {
  const leader = group.members.find((m) => m.role === 'owner');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
          Student Space
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-[-1.7px] sm:text-5xl">
              My Group
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Collaborate, learn, and grow together.
            </p>
          </div>

          <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
            {group.members.length}/{group.maxMembers || 4} members
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[24px] border border-slate-200/75 bg-white/90 p-6 shadow-[0_20px_55px_rgba(35,65,120,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Group Name
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.8px]">
                {group.name}
              </h2>
            </div>

            {isLeader && (
              <button
                onClick={startEditing}
                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                Edit
              </button>
            )}
          </div>

          {group.description && (
            <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
              {group.description}
            </p>
          )}

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-500">
              Group Leader
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-bold text-blue-600 shadow-sm">
                {leader?.fullName?.charAt(0)?.toUpperCase() || 'L'}
              </div>
              <span className="font-bold text-slate-800">
                {leader?.fullName || '—'}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200/75 bg-white/90 p-6 shadow-[0_20px_55px_rgba(35,65,120,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Members
              </p>
              <h2 className="mt-1 text-xl font-extrabold">
                Your teammates
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              {group.members.length}/{group.maxMembers || 4}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-slate-600 shadow-sm">
                    {member.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {member.fullName}
                    </p>
                    {member.role === 'owner' && (
                      <span className="text-xs font-semibold text-blue-600">
                        Group Leader
                      </span>
                    )}
                  </div>
                </div>

                {isLeader && member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removingId === member.id}
                    className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    {removingId === member.id ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {isLeader && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
            >
              + Add Member
            </button>
          )}

          {isLeader && showAddForm && (
            <form onSubmit={handleAddMember} className="mt-5 space-y-3">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Student email or ID"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {adding ? 'Adding...' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setIdentifier('');
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          {isLeader
            ? 'You are the group leader. Manage your group carefully.'
            : 'You are a member of this study group.'}
        </p>

        {isLeader ? (
          <button
            onClick={handleDisbandGroup}
            disabled={disbanding}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {disbanding ? 'Disbanding...' : 'Disband Group'}
          </button>
        ) : (
          <button
            onClick={handleLeaveGroup}
            disabled={leaving}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {leaving ? 'Leaving...' : 'Leave Group'}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, title, text, className }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${className}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export default MyGroup;
