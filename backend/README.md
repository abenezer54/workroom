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
- Automatic SQL migrations on API startup
- Local PostgreSQL Docker Compose setup

Projects, tasks, invoices, dashboards, files, and project updates are intentionally not implemented yet.

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
