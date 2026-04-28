DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY,
  invoice_number text NOT NULL,
  agency_id uuid NOT NULL REFERENCES users(id),
  client_id uuid NOT NULL REFERENCES clients(id),
  project_id uuid NULL REFERENCES projects(id),
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  issue_date date NOT NULL,
  due_date date NULL,
  subtotal integer NOT NULL DEFAULT 0,
  tax integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT invoices_amounts_non_negative CHECK (subtotal >= 0 AND tax >= 0 AND discount >= 0 AND total >= 0),
  CONSTRAINT invoices_due_after_issue CHECK (due_date IS NULL OR due_date >= issue_date)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price integer NOT NULL DEFAULT 0,
  amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT invoice_items_amounts_non_negative CHECK (unit_price >= 0 AND amount >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS invoices_agency_invoice_number_unique ON invoices (agency_id, invoice_number);
CREATE INDEX IF NOT EXISTS invoices_agency_id_idx ON invoices (agency_id);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON invoices (client_id);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON invoices (project_id);
CREATE INDEX IF NOT EXISTS invoices_agency_status_idx ON invoices (agency_id, status);
CREATE INDEX IF NOT EXISTS invoices_agency_client_idx ON invoices (agency_id, client_id);
CREATE INDEX IF NOT EXISTS invoices_deleted_at_idx ON invoices (deleted_at);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items (invoice_id);
