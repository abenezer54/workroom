# Workroom Backend

Go/Gin API foundation for Workroom.

## Current Scope

This phase includes only the backend foundation:

- Gin HTTP server
- PostgreSQL connection through GORM
- Environment-driven configuration
- CORS middleware
- Request logger and recovery middleware
- `GET /health`
- `/api/v1` route group for future API modules
- Shared JSON response and error helpers
- Clean Architecture-friendly folders for future handlers, services, repositories, and models
- Local PostgreSQL Docker Compose setup

Authentication, clients, projects, tasks, invoices, and project updates are intentionally not implemented yet.

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
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed frontend origins. |

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
