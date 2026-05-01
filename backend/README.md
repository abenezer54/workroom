# Workroom Backend

Go/Gin API foundation for Workroom.

## Current Scope

The backend currently includes:

- Gin HTTP server
- PostgreSQL connection through GORM
- Environment-driven configuration
- CORS middleware
- Request logger and recovery middleware
- `GET /health`
- `/api/v1` route group for future API modules
- Shared JSON response and error helpers
- Clean Architecture-friendly folders for future handlers, services, repositories, and models
- JWT authentication for agency admins
- Auth middleware and role middleware
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- Clients module for agency admins
- `GET /api/v1/clients`
- `POST /api/v1/clients`
- `GET /api/v1/clients/:id`
- `PATCH /api/v1/clients/:id`
- `DELETE /api/v1/clients/:id`
- Projects module for agency admins
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `PATCH /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`
- Tasks/milestones module
- `GET /api/v1/projects/:projectId/tasks`
- `POST /api/v1/projects/:projectId/tasks`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`
- Project updates module
- `GET /api/v1/projects/:projectId/updates`
- `POST /api/v1/projects/:projectId/updates`
- `GET /api/v1/updates/recent`
- Invoices module
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/:id`
- `PATCH /api/v1/invoices/:id`
- `PATCH /api/v1/invoices/:id/status`
- `DELETE /api/v1/invoices/:id`
- Dashboard summaries
- `GET /api/v1/dashboard/admin`
- `GET /api/v1/dashboard/client`
- Demo data seed command
- Automatic SQL migrations on API startup
- Local PostgreSQL Docker Compose setup

Files, email notifications, payments, PDF generation, and AI features are intentionally not implemented yet.

## Requirements

- Go 1.22+
- Docker and Docker Compose

## Setup

Copy the example environment file:

```sh
cp .env.example .env
```

Start local PostgreSQL:

```sh
docker compose up -d postgres
```

Download dependencies:

```sh
go mod tidy
```

Run the API:

```sh
go run ./cmd/server
```

The API automatically runs pending SQL migrations from `migrations/` on startup and records applied files in `schema_migrations`.

The API listens on `http://localhost:8080` by default.

## Demo Seed Data

Run the seed command from the backend directory after PostgreSQL is running:

```sh
go run ./cmd/seed
```

The seed command connects using `DATABASE_URL`, runs pending SQL migrations, and upserts demo records so it can be run more than once without duplicating the known demo users, clients, projects, tasks, updates, invoices, or invoice items.

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Agency admin | `admin@workroom.demo` | `password123` |
| Client user | `client@workroom.demo` | `password123` |

The client demo user is linked through the existing `users.client_id` relationship to the `Acme Studio` client record. Client portal and client dashboard queries derive access from that authenticated `client_id`; no client-supplied ownership fields are used.

Seeded demo data includes:

- Clients: Acme Studio, BrightPath Marketing, Nova Retail Group, GreenLeaf Accounting
- Projects: Website Redesign, CRM Dashboard, Brand Landing Page, Invoice Automation
- Tasks for project progress and upcoming deadlines
- Project updates for recent activity
- Invoices `INV-000001`, `INV-000002`, and `INV-000003` with calculated line item totals

Quick demo checks:

```sh
ADMIN_TOKEN="$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workroom.demo","password":"password123"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["access_token"])')"

curl http://localhost:8080/api/v1/dashboard/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl http://localhost:8080/api/v1/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl http://localhost:8080/api/v1/projects \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl http://localhost:8080/api/v1/invoices \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Client demo check:

```sh
CLIENT_TOKEN="$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@workroom.demo","password":"password123"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["access_token"])')"

curl http://localhost:8080/api/v1/dashboard/client \
  -H "Authorization: Bearer $CLIENT_TOKEN"

curl http://localhost:8080/api/v1/invoices \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

The client user should only see data tied to the linked `Acme Studio` client record.

## Health Check

```sh
curl http://localhost:8080/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "service": "workroom-api",
    "status": "ok"
  }
}
```

The same health response is also available at:

```sh
curl http://localhost:8080/api/v1/health
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `APP_ENV` | `development` | App environment. Use `production` for release mode. |
| `PORT` | `8080` | HTTP server port. |
| `DATABASE_URL` | `postgres://workroom:workroom@localhost:5432/workroom?sslmode=disable` | PostgreSQL connection string. |
| `JWT_SECRET` | `change-me-local-dev-secret` | Secret used to sign JWT access tokens. Set a strong value outside local development. |
| `JWT_EXPIRES_IN` | `24h` | JWT access token lifetime. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed frontend origins. |
| `GOOGLE_CLIENT_ID` | empty | Google OAuth web client ID used to verify Google ID tokens. Google auth is unavailable when empty. |

## Auth Endpoints

Register an agency admin:

```sh
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abeni Studio",
    "email": "admin@abeni.studio",
    "password": "secure-password"
  }'
```

Log in:

```sh
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abeni.studio",
    "password": "secure-password"
  }'
```

Log in or register with Google:

```sh
curl -X POST http://localhost:8080/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "GOOGLE_ID_TOKEN",
    "mode": "login"
  }'
```

Use `"mode": "register"` from the agency registration page. Login mode links Google to an existing Workroom account with the same verified email; register mode creates a new agency admin only when that email is not already registered.

Copy the returned `access_token`, then call the current user endpoint:

```sh
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Calling `/api/v1/auth/me` without a token should return `401 UNAUTHORIZED`:

```sh
curl http://localhost:8080/api/v1/auth/me
```

## Client Endpoints

All client management endpoints require an agency admin JWT.

Create a client:

```sh
curl -X POST http://localhost:8080/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "name": "John Carter",
    "email": "john@example.com",
    "company_name": "Acme Studio",
    "phone": "+1 555 123 4567",
    "status": "ACTIVE"
  }'
```

List active and inactive clients:

```sh
curl http://localhost:8080/api/v1/clients \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Filter by status:

```sh
curl "http://localhost:8080/api/v1/clients?status=ARCHIVED" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Search by name, company, or email:

```sh
curl "http://localhost:8080/api/v1/clients?search=acme" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

View one client:

```sh
curl http://localhost:8080/api/v1/clients/YOUR_CLIENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Update a client:

```sh
curl -X PATCH http://localhost:8080/api/v1/clients/YOUR_CLIENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "company_name": "Acme Studio LLC",
    "status": "INACTIVE"
  }'
```

Archive a client:

```sh
curl -X DELETE http://localhost:8080/api/v1/clients/YOUR_CLIENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

## Project Endpoints

All project management endpoints require an agency admin JWT. `GET /api/v1/projects/:id` also supports linked client users for read-only portal access.

Create a project:

```sh
curl -X POST http://localhost:8080/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "title": "Website Redesign",
    "description": "Redesign marketing website and client onboarding pages.",
    "status": "PLANNING",
    "start_date": "2026-04-01",
    "deadline": "2026-05-15",
    "budget": 4500,
    "progress": 0
  }'
```

List projects:

```sh
curl http://localhost:8080/api/v1/projects \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Filter projects:

```sh
curl "http://localhost:8080/api/v1/projects?status=IN_PROGRESS&client_id=YOUR_CLIENT_ID&search=website" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

View one project:

```sh
curl http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Update a project:

```sh
curl -X PATCH http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "status": "IN_PROGRESS",
    "progress": 25
  }'
```

Archive a project:

```sh
curl -X DELETE http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Run the project module smoke test script while the backend is running:

```sh
./scripts/test_projects.sh
```

## Task Endpoints

Task write endpoints require an agency admin JWT. `GET /api/v1/projects/:projectId/tasks` also supports linked client users for read-only portal access.

Create a task:

```sh
curl -X POST http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "title": "Finalize homepage wireframe",
    "description": "Prepare final homepage layout for client review.",
    "status": "TODO",
    "priority": "HIGH",
    "due_date": "2026-05-01"
  }'
```

List tasks:

```sh
curl http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Filter tasks:

```sh
curl "http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID/tasks?status=TODO&priority=HIGH" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Update a task:

```sh
curl -X PATCH http://localhost:8080/api/v1/tasks/YOUR_TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "due_date": "2026-05-03"
  }'
```

Delete a task:

```sh
curl -X DELETE http://localhost:8080/api/v1/tasks/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Run the task module smoke test script while the backend is running:

```sh
./scripts/test_tasks.sh
```

## Project Update Endpoints

Project update creation requires an agency admin JWT. Listing project updates also supports linked client users for read-only portal access.

Create a project update:

```sh
curl -X POST http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID/updates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "title": "Homepage wireframe completed",
    "content": "The homepage wireframe has been finalized and is ready for review."
  }'
```

List project updates:

```sh
curl http://localhost:8080/api/v1/projects/YOUR_PROJECT_ID/updates \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Get recent agency updates:

```sh
curl "http://localhost:8080/api/v1/updates/recent?limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Run the project updates smoke test script while the backend is running:

```sh
./scripts/test_project_updates.sh
```

## Invoice Endpoints

Invoice write endpoints require an agency admin JWT. Client users can read only invoices tied to their own `client_id`.

Create an invoice:

```sh
curl -X POST http://localhost:8080/api/v1/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "project_id": "YOUR_PROJECT_ID",
    "status": "DRAFT",
    "issue_date": "2026-04-01",
    "due_date": "2026-04-15",
    "tax": 100,
    "discount": 50,
    "items": [
      {
        "description": "Website redesign",
        "quantity": 1,
        "unit_price": 2500
      },
      {
        "description": "Client portal setup",
        "quantity": 1,
        "unit_price": 1200
      }
    ]
  }'
```

List invoices:

```sh
curl http://localhost:8080/api/v1/invoices \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Filter invoices:

```sh
curl "http://localhost:8080/api/v1/invoices?status=DRAFT&client_id=YOUR_CLIENT_ID&project_id=YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

View invoice with items:

```sh
curl http://localhost:8080/api/v1/invoices/YOUR_INVOICE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Update invoice and replace items:

```sh
curl -X PATCH http://localhost:8080/api/v1/invoices/YOUR_INVOICE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{
    "tax": 50,
    "discount": 25,
    "items": [
      {
        "description": "Updated implementation work",
        "quantity": 2,
        "unit_price": 500
      }
    ]
  }'
```

Update invoice status:

```sh
curl -X PATCH http://localhost:8080/api/v1/invoices/YOUR_INVOICE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -d '{"status":"SENT"}'
```

Cancel an invoice:

```sh
curl -X DELETE http://localhost:8080/api/v1/invoices/YOUR_INVOICE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

Run the invoice module smoke test script while the backend is running:

```sh
./scripts/test_invoices.sh
```

## Docker

Build the backend image:

```sh
docker build -t workroom-api .
```

Run it against the local Compose database:

```sh
docker run --rm -p 8080:8080 --env-file .env workroom-api
```

When running the backend container on the same Docker network as PostgreSQL, set `DATABASE_URL` to use the Compose service hostname:

```txt
DATABASE_URL=postgres://workroom:workroom@postgres:5432/workroom?sslmode=disable
```
