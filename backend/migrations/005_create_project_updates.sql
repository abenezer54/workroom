CREATE TABLE IF NOT EXISTS project_updates (
  id uuid PRIMARY KEY,
  agency_id uuid NOT NULL REFERENCES users(id),
  project_id uuid NOT NULL REFERENCES projects(id),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS project_updates_agency_id_idx ON project_updates (agency_id);
CREATE INDEX IF NOT EXISTS project_updates_project_id_idx ON project_updates (project_id);
CREATE INDEX IF NOT EXISTS project_updates_created_by_idx ON project_updates (created_by);
CREATE INDEX IF NOT EXISTS project_updates_agency_created_at_idx ON project_updates (agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS project_updates_project_created_at_idx ON project_updates (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS project_updates_deleted_at_idx ON project_updates (deleted_at);
