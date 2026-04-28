DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
    CREATE TYPE client_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  email text NOT NULL,
  company_name text NULL,
  phone text NULL,
  status client_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS clients_agency_email_active_unique
  ON clients (agency_id, LOWER(email))
  WHERE status <> 'ARCHIVED' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS clients_agency_id_idx ON clients (agency_id);
CREATE INDEX IF NOT EXISTS clients_agency_status_idx ON clients (agency_id, status);
CREATE INDEX IF NOT EXISTS clients_deleted_at_idx ON clients (deleted_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_client_id_fkey'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES clients(id);
  END IF;
END $$;
