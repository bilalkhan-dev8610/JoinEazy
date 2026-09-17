-- =========================================================
-- JoinEazy - Phase 1: Initial Database Schema
-- =========================================================
-- This script is idempotent-safe for first-run container init.
-- It creates enum types, core tables, relationships, constraints
-- and indexes only. No seed/feature data is inserted here.
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE group_member_role AS ENUM ('owner', 'member');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'graded', 'late');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'student',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ---------------------------------------------------------
-- Table: groups
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    created_by      UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_groups_name_owner UNIQUE (name, created_by)
);

CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups (created_by);

-- ---------------------------------------------------------
-- Table: group_members (junction: users <-> groups)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role            group_member_role NOT NULL DEFAULT 'member',
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_group_members_group_user UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members (user_id);

-- ---------------------------------------------------------
-- Table: assignments
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    created_by      UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    due_date        TIMESTAMPTZ,
    max_score       NUMERIC(6,2) NOT NULL DEFAULT 100 CHECK (max_score > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments (created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments (due_date);

-- ---------------------------------------------------------
-- Table: assignment_groups (junction: assignments <-> groups)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignment_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
    group_id        UUID NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_assignment_groups_assignment_group UNIQUE (assignment_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_groups_assignment_id ON assignment_groups (assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_groups_group_id ON assignment_groups (group_id);

-- ---------------------------------------------------------
-- Table: submissions
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content_url     TEXT,
    notes           TEXT,
    status          submission_status NOT NULL DEFAULT 'draft',
    score           NUMERIC(6,2) CHECK (score >= 0),
    submitted_at    TIMESTAMPTZ,
    graded_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_submissions_assignment_student UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);

-- ---------------------------------------------------------
-- updated_at auto-touch trigger (shared across tables)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_groups_updated_at ON groups;
CREATE TRIGGER trg_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON assignments;
CREATE TRIGGER trg_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON submissions;
CREATE TRIGGER trg_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- Phase 3 addition: a student may belong to at most one group
-- at a time (as owner or member). Enforced here at the DB level
-- as a safety net in addition to the application-level checks in
-- the groups API. Purely additive — no existing table/column is
-- changed.
-- ---------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE group_members ADD CONSTRAINT uq_group_members_user UNIQUE (user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------
-- Phase 5 addition: assignment resource link + "assign to all
-- students" flag. Purely additive — no existing column is
-- changed or removed. `assignment_groups` (already created in
-- Phase 1) is used for the "assign to specific groups" case;
-- when `is_global` is true an assignment has no assignment_groups
-- rows and is visible to every student instead.
-- ---------------------------------------------------------
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS resource_url TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
    ALTER TABLE assignments ADD CONSTRAINT chk_assignments_resource_url
        CHECK (resource_url IS NULL OR resource_url ~* '^https?://');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_assignments_is_global ON assignments (is_global);

COMMIT;
