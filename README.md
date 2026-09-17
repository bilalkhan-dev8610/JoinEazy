# JoinEazy

## Getting Started

This section is the single place to look for "how do I run this" —
local development and going live. Everything else below is a
phase-by-phase changelog of what was built and why.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (comes with Docker Desktop on Windows/Mac)
- That's it for local dev — Node/Postgres don't need to be installed on your machine, Docker runs them in containers.

### Run it locally

1. Unzip the project and open a terminal in its root folder (`joineazy-task/`).
2. Create the three env files from their examples:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Open `.env` (repo root) and `backend/.env`, and set `JWT_SECRET` to a real random value:
   ```bash
   openssl rand -hex 32
   ```
   (No `openssl`? Any long random string works for local testing — just don't use one in production.)
4. Start everything:
   ```bash
   docker compose up --build
   ```
5. Once it's up:
   - Frontend: http://localhost:5173
   - Backend health check: http://localhost:5000/api/health
6. Register a student account at http://localhost:5173/register. To test the admin side, register normally, then promote that account in the database:
   ```bash
   docker compose exec postgres psql -U joineazy_user -d joineazy -c "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"
   ```
   (adjust the user/db name if you changed them in `.env`), then log in again.
7. To stop: `Ctrl+C`, then `docker compose down` (add `-v` to also wipe the database).

If you change anything in `database/init.sql` after the first run, Postgres won't re-apply it automatically (it only runs init scripts against a fresh data directory) — run `docker compose down -v && docker compose up --build` to pick it up.

### Going live

The local setup above (`docker-compose.yml`) runs the frontend through Vite's **dev server**, which is fine for development but not for production. For a real deployment, use `docker-compose.prod.yml` instead, which builds the frontend into static files served by nginx.

**Option A — one server (simplest)**: rent any small VPS (DigitalOcean, Hetzner, AWS Lightsail, etc.) with Docker installed, copy the project there, and:

1. Fill in `.env` at the repo root with real production values — importantly:
   - `JWT_SECRET` — a real random secret, different from your dev one
   - `PGPASSWORD` — a real password, not `change_me`
   - `CLIENT_ORIGIN` — your frontend's public URL, e.g. `https://joineazy.example.com`
   - `VITE_API_BASE_URL` — your backend's public URL + `/api`, e.g. `https://api.joineazy.example.com/api`
2. Run:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
3. Put a reverse proxy in front of it for HTTPS — e.g. [Caddy](https://caddyserver.com/) (automatic HTTPS with zero config) or nginx + [Certbot](https://certbot.eff.org/). This matters here specifically: in production the auth cookie is marked `secure` (see `backend/src/utils/cookie.js`), meaning browsers will only send it over HTTPS — without a valid TLS certificate in front of it, login will silently fail.
4. Point your domain's DNS at the server.

**Option B — managed platforms (less server maintenance)**: deploy the frontend and backend separately.
- **Frontend**: any static host that can run `npm run build` and serve `dist/` — Vercel, Netlify, Cloudflare Pages. Set `VITE_API_BASE_URL` as a build-time environment variable in their dashboard.
- **Backend**: any Node host — Render, Railway, Fly.io. Set the same env vars as `backend/.env.example` in their dashboard (`JWT_SECRET`, `PG*`, etc.), pointing `PG*` at a managed Postgres (Render/Railway/Neon/Supabase all offer one). Run `database/init.sql` against it once, manually (`psql <connection-string> -f database/init.sql`), since there's no `docker-entrypoint-initdb.d` mechanism outside Docker.
- Set `CLIENT_ORIGIN` on the backend to the frontend's deployed URL, and `VITE_API_BASE_URL` on the frontend to the backend's deployed URL + `/api`.

Either way, the checklist is the same: real `JWT_SECRET` and DB password (never the `.env.example` placeholders), HTTPS on both ends, `CLIENT_ORIGIN`/`VITE_API_BASE_URL` pointed at each other's real public URLs, and `database/init.sql` applied to whatever Postgres instance you're using.

---

## Phase 1 — Foundation

This phase sets up the technical foundation only. No feature work.

### Stack

- **Frontend**: React + Vite, Tailwind CSS, React Router, Axios-based API service
- **Backend**: Node.js + Express, dotenv, CORS, PostgreSQL (via `pg`), modular structure (`routes/controllers/models/middlewares`)
- **Database**: PostgreSQL with the initial schema, relationships, constraints, and indexes
- **Docker**: Separate containers for frontend, backend, and PostgreSQL, orchestrated with `docker-compose`

### Project structure

```
joineazy-task/
├── frontend/           # React + Vite + Tailwind app
├── backend/             # Express API
├── database/
│   └── init.sql        # Schema: users, groups, group_members,
│                        # assignments, assignment_groups, submissions
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Database tables (Phase 1)

- `users`
- `groups`
- `group_members`
- `assignments`
- `assignment_groups`
- `submissions`

See `database/init.sql` for full column definitions, foreign keys,
constraints, and indexes.

### Running locally with Docker

1. Copy the env examples:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. From the repo root:
   ```bash
   docker compose up --build
   ```
3. Services:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health
   - PostgreSQL: localhost:5432

The `database/init.sql` script runs automatically on the first Postgres
container start (via the Postgres image's `/docker-entrypoint-initdb.d`
mechanism), creating the schema.

### Running locally without Docker

**Backend**
```bash
cd backend
cp .env.example .env   # edit values to match your local Postgres
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Database**
Run `database/init.sql` against your local PostgreSQL instance, e.g.:
```bash
psql -U <user> -d <database> -f database/init.sql
```

### What's intentionally NOT in Phase 1

No auth, no CRUD endpoints, no business logic/features — those are
scoped for later phases. This phase only proves the stack is wired
together end-to-end (frontend ⇄ backend ⇄ database) and that the schema
is in place.

---

## Phase 2 — Authentication + RBAC

Adds a full authentication system on top of the Phase 1 foundation:
registration, login, logout, JWT-based sessions, protected/role-gated
routes, and a profile screen. No other features were added.

### How auth works

- Passwords are hashed with **bcrypt** (`backend/src/utils/password.js`) — never stored in plaintext.
- On login/register, the backend issues a **JWT** (`backend/src/utils/jwt.js`) and sets it as an **httpOnly cookie** (`backend/src/utils/cookie.js`), so it isn't accessible to frontend JS (mitigates XSS token theft). A `Bearer` header is also accepted as a fallback.
- `backend/src/middlewares/auth.middleware.js` (`protect`) verifies the JWT and loads the current user on every protected request → **401 Unauthorized** if missing/invalid/expired.
- `backend/src/middlewares/role.middleware.js` (`authorize(...roles)`) checks `req.user.role` → **403 Forbidden** if the authenticated user's role isn't allowed.
- Public self-registration (`POST /api/auth/register`) always creates a **student** account server-side, regardless of what the client sends — there is no public way to create an admin account, even though admin logs in through the exact same `/api/auth/login` endpoint.

### New backend endpoints

| Method | Route                  | Access          | Notes                                  |
|--------|-------------------------|-----------------|-----------------------------------------|
| POST   | `/api/auth/register`    | Public          | Creates a student account, sets auth cookie |
| POST   | `/api/auth/login`       | Public          | Works for any role (student/teacher/admin) |
| POST   | `/api/auth/logout`      | Public          | Clears the auth cookie |
| GET    | `/api/auth/profile`     | Authenticated   | Returns the current user |
| GET    | `/api/students/dashboard` | Student only  | 403 for any other role |
| GET    | `/api/admin/overview`   | Admin only      | 403 for any other role (e.g. a student) |

### New frontend routes

| Route               | Access                  |
|----------------------|--------------------------|
| `/login`             | Public |
| `/register`          | Public |
| `/profile`           | Any authenticated user |
| `/dashboard/student` | `student` role only, else redirected to `/unauthorized` |
| `/dashboard/admin`   | `admin` role only, else redirected to `/unauthorized` |
| `/unauthorized`      | 403 page |

After login/register, the user is redirected based on role: `admin` →
`/dashboard/admin`, `student` → `/dashboard/student`.

### Creating an admin account

There is no public admin-registration endpoint (by design). To create
one for testing: register a normal account through `/register`, then
promote it directly in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Running Phase 2 locally

Same steps as Phase 1, plus a JWT secret is now required:

```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET, e.g. `openssl rand -hex 32`
cp frontend/.env.example frontend/.env
cp .env.example .env                   # repo root, used by docker-compose
docker compose up --build
```

Without a `JWT_SECRET` set, both the backend process (`server.js`) and
`docker compose` itself will fail fast with a clear error instead of
booting into a broken auth system.

---

## Phase 3 — Groups + Members

Adds student group functionality on top of Phase 1/2: create a group,
view it, and manage its members. No schema changes were needed — the
`groups` and `group_members` tables already existed from Phase 1; this
phase only added one additive DB safety constraint (see below).

### Rules

- A student may belong to **at most one group** at a time, as leader or
  member — enforced both in the API (checked before create/add) and at
  the database level (`uq_group_members_user` unique constraint on
  `group_members.user_id`).
- The student who creates a group automatically becomes its **leader**
  (`group_members.role = 'owner'`).
- Only the **leader** can add or remove members. Any member can view the
  group.
- The leader cannot be removed via the remove-member endpoint (they can
  only leave the group by disbanding it — see Phase 4).
- A group has a maximum member count (leader included), configurable via
  `GROUP_MAX_MEMBERS` (default **4**).
- **"Student ID"**: the system doesn't have a separate roll-number field,
  so the existing user UUID doubles as the student's ID. `POST
  /api/groups/mine/members` accepts either a student's **email** or their
  **UUID** in the same `identifier` field (auto-detected). A student's ID
  is shown on their own Profile page so they can share it with a leader.

### Add-member validation (checked in this order)

1. Caller is the group leader (else 403)
2. Target user exists (else 404)
3. Target user has the `student` role (else 400)
4. Target isn't already a member of this group (else 409)
5. Target isn't already in a different group (else 409)
6. Group hasn't reached `GROUP_MAX_MEMBERS` (else 400)

### New backend endpoints

All under `/api/groups`, student-only (`protect` + `authorize('student')`).

| Method | Route                          | Notes |
|--------|----------------------------------|-------|
| POST   | `/api/groups`                   | Create a group; caller becomes leader. 409 if already in a group. |
| GET    | `/api/groups/mine`               | Returns `{ group: null }` if not in a group yet, otherwise the group + members. |
| POST   | `/api/groups/mine/members`       | Leader-only. Body: `{ identifier }` (email or student ID). |
| DELETE | `/api/groups/mine/members/:userId` | Leader-only. Cannot remove the leader themself. |

### New frontend route

| Route     | Access | Notes |
|-----------|--------|-------|
| `/groups` | `student` role only | "My Group" page: create-group form when not in a group, otherwise group name/leader/members list with add/remove controls (add/remove shown only to the leader). Linked from the Student Dashboard. |

### Running Phase 3 locally

No new required env vars — `GROUP_MAX_MEMBERS` defaults to `4` if unset.
If you want a different limit, set it in `backend/.env` and/or the repo
root `.env` (used by `docker-compose.yml`).

If you already have a Postgres data volume from an earlier phase, the
new Phase 3 constraint in `database/init.sql` won't apply automatically
(Postgres only runs init scripts against an empty data directory). Reset
the volume to pick it up:

```bash
docker compose down -v
docker compose up --build
```

---

## Phase 4 — Student Group Management

Phase 3 already covered create/view/add-member/remove-member end to end.
Phase 4 rounds out "manage group" with the pieces that were explicitly
out of scope before: renaming/editing a group, disbanding it, and a
member leaving voluntarily. No database changes were needed.

### New backend endpoints

All under `/api/groups`, student-only, same auth/role middleware as the rest of the group API.

| Method | Route              | Access        | Notes |
|--------|---------------------|---------------|-------|
| PATCH  | `/api/groups/mine`  | Leader only   | Body: `{ name?, description? }` — at least one required. |
| DELETE | `/api/groups/mine`  | Leader only   | Disbands the group; memberships cascade-delete. |
| POST   | `/api/groups/mine/leave` | Non-leader member | Leader can't use this — must disband instead (a group can't exist without a leader). |

### Frontend

The `/groups` page now also has:
- An **Edit** link next to the group name (leader only) for renaming/updating the description.
- A **Disband Group** button (leader only, with a confirmation prompt).
- A **Leave Group** button (non-leader members, with a confirmation prompt).

### Running Phase 4 locally

No new env vars or schema changes — the existing Phase 1–3 setup works as-is.

---

## Phase 5 — Assignment Management

Adds assignment create/edit/view for admins and a read-only assignment
list for students. Builds on the `assignments` and `assignment_groups`
tables that already existed from Phase 1 — no new tables, just two
additive columns.

### Schema additions

- `assignments.resource_url TEXT` — the "OneDrive link" shown to students. Nullable, and checked (`chk_assignments_resource_url`) to be `http(s)://...` when present.
- `assignments.is_global BOOLEAN NOT NULL DEFAULT FALSE` — `true` means "assign to all students"; `false` means the assignment is scoped to whatever's in `assignment_groups` ("assign to specific groups", already modeled since Phase 1).

### Visibility rule

A student sees an assignment if it's global, **or** if it's targeted at
the group they currently belong to. A student not in any group only
sees global assignments.

### New backend endpoints

| Method | Route                     | Access      | Notes |
|--------|----------------------------|-------------|-------|
| POST   | `/api/assignments`         | Admin only  | Body: `{ title, description?, dueDate?, resourceUrl?, isGlobal, groupIds? }`. `groupIds` required (non-empty) when `isGlobal` is `false`. |
| GET    | `/api/assignments`         | Admin only  | Lists every assignment with a group count. |
| GET    | `/api/assignments/:id`     | Admin only  | Full detail, including the actual list of targeted groups. |
| PATCH  | `/api/assignments/:id`     | Admin only  | Partial update of any field and/or re-targeting; switching to global clears group targeting, switching away from global requires the assignment to end up with at least one group (from the new `groupIds` or, if omitted, its existing ones). |
| GET    | `/api/students/assignments`| Student only| Assignments visible to the caller — title, description, due date, resource link. |
| GET    | `/api/admin/groups`        | Admin only  | Lists all groups (name, leader, member count) — powers the "assign to specific groups" picker. |

### New frontend routes

| Route                | Access | Notes |
|------------------------|--------|-------|
| `/admin/assignments`   | `admin` role only | Create/edit form (title, description, due date, OneDrive link, all-students vs specific-groups picker) plus a list of all assignments. Linked from the Admin Dashboard. |
| `/assignments`         | `student` role only | Read-only list: title, description, due date, and an "Open OneDrive link" link. Linked from the Student Dashboard. |

### Running Phase 5 locally

No new required env vars. If you have an existing Postgres volume from
an earlier phase, the two new columns are added via `ALTER TABLE ...
ADD COLUMN IF NOT EXISTS`, which Postgres only runs against a fresh
data directory as part of `init.sql`. Reset the volume to pick them up:

```bash
docker compose down -v
docker compose up --build
```

---

## Post-Phase-5 audit

A full pass over the project to check for missing pieces or wiring bugs
before considering it complete:

- Verified every route → controller/middleware function reference actually
  exists and is exported (no undefined handlers).
- Verified every `process.env.*` used in the backend is documented in both
  `backend/.env.example` and `docker-compose.yml` (and vice versa) — no
  drift.
- Verified frontend/backend `package.json` dependencies exactly match what
  the code actually imports — nothing missing, nothing unused.
- Loaded the real Express app (`app.js` → all routes → all controllers →
  all middlewares) end-to-end against stub modules that throw on any
  malformed route registration — it loaded cleanly.
- Bundled the entire frontend from its real entry point (`main.jsx`),
  which resolves every import across all 17 components/pages/services —
  it bundled cleanly.
- **Fixed**: route params like `/api/assignments/:id` and
  `/api/groups/mine/members/:userId` didn't validate the ID looked like a
  UUID before querying, so a malformed ID would surface a raw Postgres
  error instead of a clean `400`. Added `validateUuidParam` and applied
  it to both routes.
- **Fixed**: a stale line in the Phase 3 docs said "no leave/delete group
  flow exists" — no longer true since Phase 4 added exactly that.

Nothing else needed changing — Phases 1–5 are otherwise implemented as
documented above. The only thing this environment genuinely can't verify
is a live run (no Docker/Postgres/network available here), so a real
`docker compose up --build` is still the last step to confirm everything
end-to-end.
