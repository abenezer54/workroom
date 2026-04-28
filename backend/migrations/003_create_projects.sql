DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM (
      'PLANNING',
      'IN_PROGRESS',
      'REVIEW',
      'COMPLETED',
      'ON_HOLD',
      'ARCHIVED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES users(id),
  client_id uuid NOT NULL REFERENCES clients(id),
  title text NOT NULL,
  description text NULL,
  status project_status NOT NULL DEFAULT 'PLANNING',
  start_date date NULL,
  deadline date NULL,
  budget integer NOT NULL DEFAULT 0,
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT projects_budget_non_negative CHECK (budget >= 0),
  CONSTRAINT projects_progress_range CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX IF NOT EXISTS projects_agency_id_idx ON projects (agency_id);
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects (client_id);
CREATE INDEX IF NOT EXISTS projects_agency_status_idx ON projects (agency_id, status);
CREATE INDEX IF NOT EXISTS projects_agency_client_idx ON projects (agency_id, client_id);
CREATE INDEX IF NOT EXISTS projects_client_status_idx ON projects (client_id, status);
CREATE INDEX IF NOT EXISTS projects_deleted_at_idx ON projects (deleted_at);
