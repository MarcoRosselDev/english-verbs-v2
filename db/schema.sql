-- English Verbs v2 · Esquema de base de datos (PostgreSQL / Neon)
-- Ejecutar una sola vez sobre una base vacía. Es seguro repetirlo (IF NOT EXISTS).

-- Extensión para búsquedas por coincidencia parcial (ILIKE '%term%') rápidas
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ───────────── Usuarios ─────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,                       -- NUNCA la contraseña en claro
  role          TEXT        NOT NULL DEFAULT 'user'
                CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────── Verbos ─────────────
CREATE TABLE IF NOT EXISTS verbs (
  id                    SERIAL PRIMARY KEY,
  infinitive            TEXT        NOT NULL,
  past_simple           TEXT        NOT NULL,
  past_participle       TEXT        NOT NULL,
  present_participle    TEXT        NOT NULL,
  third_person_singular TEXT        NOT NULL,
  spanish_translation   TEXT        NOT NULL,
  is_regular            BOOLEAN     NOT NULL DEFAULT false,
  created_by            INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Permite verbos homógrafos (ej: "lie" = mentir / recostarse) pero no duplicados exactos
  CONSTRAINT verbs_unique_entry UNIQUE (infinitive, spanish_translation)
);

-- Índices trigram: aceleran búsquedas tipo ILIKE '%run%'
CREATE INDEX IF NOT EXISTS idx_verbs_infinitive_trgm
  ON verbs USING gin (infinitive gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_verbs_spanish_trgm
  ON verbs USING gin (spanish_translation gin_trgm_ops);

-- ───────────── Favoritos (relación muchos a muchos) ─────────────
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verb_id    INTEGER     NOT NULL REFERENCES verbs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, verb_id)                             -- evita favoritos duplicados
);