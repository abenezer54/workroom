DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('AGENCY_ADMIN', 'CLIENT');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  agency_id uuid NULL,
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL,
  client_id uuid NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT users_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_client_id_idx ON users (client_id);
CREATE INDEX IF NOT EXISTS users_agency_id_idx ON users (agency_id);
CREATE INDEX IF NOT EXISTS users_deleted_at_idx ON users (deleted_at);
