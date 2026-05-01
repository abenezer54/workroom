ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_subject text NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_google_subject_unique
  ON users (google_subject)
  WHERE google_subject IS NOT NULL AND deleted_at IS NULL;
