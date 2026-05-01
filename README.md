# Workroom

Workroom is a client portal for service businesses to manage client work in one organized place.

Agencies, consultants, and independent service providers can manage clients, projects, tasks, project updates, and invoices. Clients get a focused portal where they can see only their own projects, updates, milestones, and invoices.

## What Workroom Does

- Centralizes client records, project details, tasks, updates, and invoices.
- Gives agency admins a dashboard for active work, upcoming deadlines, recent updates, and invoice status.
- Gives clients a private dashboard scoped to their own client record.
- Enforces role-based access for agency admins and client users.
- Keeps all business records scoped by agency ownership.
- Supports demo data for local development and product walkthroughs.

## Product Areas

### Agency Workspace

Agency admins can:

- Manage client records.
- Create and update projects for their clients.
- Track project tasks and milestones.
- Publish project updates.
- Create invoices with line items.
- Review dashboard summaries for clients, projects, tasks, updates, and invoices.

### Client Portal

Client users can:

- Log in with a linked client account.
- View only their assigned projects.
- View tasks and milestones for those projects.
- Read project updates.
- View their own invoices.

Client users cannot create, edit, archive, or delete agency records.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- TanStack Table

### Backend

- Go
- Gin
- PostgreSQL
- GORM
- JWT authentication
- Clean Architecture
- Docker

## Backend API

The backend exposes a REST API under:

```txt
/api/v1
```

Main API areas:

- Auth
- Admin dashboard
- Client dashboard
- Clients
- Projects
- Tasks
- Project updates
- Invoices

Protected requests use:

```http
Authorization: Bearer <access_token>
```

Responses use a consistent JSON envelope for success and error cases.

## Data Model

Core entities:

- `users`
- `clients`
- `projects`
- `tasks`
- `project_updates`
- `invoices`
- `invoice_items`

Agency-owned records are scoped by `agency_id`. Client portal access is derived from the authenticated user's `client_id`, so clients cannot request or view another client's data.

## Repository Structure

```txt
workroom/
  backend/
    cmd/
    internal/
    migrations/
  frontend/
  docs/
  README.md
```

## Local Development

### Requirements

- Go 1.22+
- Docker and Docker Compose
- PostgreSQL, provided locally through Docker Compose

### Backend Setup

```sh
cd backend
cp .env.example .env
docker compose up -d postgres
go mod tidy
go run ./cmd/server
```

The API runs on:

```txt
http://localhost:8080
```

Health check:

```sh
curl http://localhost:8080/health
```

## Demo Data

Seed local demo data:

```sh
cd backend
go run ./cmd/seed
```

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Agency Admin | `admin@workroom.demo` | `password123` |
| Client User | `client@workroom.demo` | `password123` |

Seeded data includes:

- Clients: Acme Studio, BrightPath Marketing, Nova Retail Group, GreenLeaf Accounting
- Projects: Website Redesign, CRM Dashboard, Brand Landing Page, Invoice Automation
- Tasks, project updates, invoices, and invoice line items

## Useful Commands

Run backend checks:

```sh
cd backend
go test ./...
go vet ./...
```

Run the final backend smoke check:

```sh
cd backend
./scripts/final_backend_check.sh
```

The smoke check verifies auth, demo logins, clients, projects, tasks, project updates, invoices, dashboards, seed data, and ownership boundaries.

## Environment

Backend environment variables are defined in `backend/.env.example`.

Key variables:

| Variable | Description |
| --- | --- |
| `PORT` | API server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWT access tokens |
| `JWT_EXPIRES_IN` | JWT token lifetime |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID used by the backend to verify Google ID tokens |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same Google OAuth web client ID exposed to the frontend Google button |

## Product Scope

Workroom focuses on the core client portal workflow:

- Authentication
- Role-based access
- Agency dashboard
- Client dashboard
- Client management
- Project management
- Task and milestone tracking
- Project updates
- Invoice management

Features such as payments, email notifications, file uploads, PDF generation, team members, and AI-generated updates are outside the current product scope.
