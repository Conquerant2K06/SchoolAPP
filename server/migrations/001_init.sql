-- Migration initiale SchoolCI : gestion des notes et bulletins
-- Idempotente (IF NOT EXISTS) pour permettre une réexécution sans erreur.

CREATE TABLE IF NOT EXISTS classes (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  level       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  class_id       INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  code         TEXT NOT NULL UNIQUE,
  coefficient  INTEGER NOT NULL CHECK (coefficient > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS school_years (
  id          SERIAL PRIMARY KEY,
  label       TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trimesters (
  id              SERIAL PRIMARY KEY,
  school_year_id  INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  number          INTEGER NOT NULL CHECK (number BETWEEN 1 AND 3),
  UNIQUE (school_year_id, number)
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id          SERIAL PRIMARY KEY,
  teacher_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, subject_id, class_id)
);

CREATE TABLE IF NOT EXISTS notes (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id      INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id        INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  school_year_id  INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  trimester       INTEGER NOT NULL CHECK (trimester BETWEEN 1 AND 3),
  value           NUMERIC(4, 2) NOT NULL CHECK (value >= 0 AND value <= 20),
  coefficient     INTEGER NOT NULL CHECK (coefficient > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_cards (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_year_id  INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  trimester       INTEGER NOT NULL CHECK (trimester BETWEEN 1 AND 3),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, school_year_id, trimester)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id, role);
CREATE INDEX IF NOT EXISTS idx_notes_lookup ON notes(class_id, subject_id, student_id, trimester);
CREATE INDEX IF NOT EXISTS idx_notes_year ON notes(school_year_id, trimester);
CREATE INDEX IF NOT EXISTS idx_report_cards_lookup ON report_cards(school_year_id, trimester, status);
