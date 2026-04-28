# Workroom

Workroom is a professional client portal SaaS for agencies, freelancers, consultants, and service businesses.

It helps service businesses manage clients, projects, tasks, invoices, and project updates in one organized workspace, while giving clients a focused portal where they can view only their own work.

## Status

Current status: Planning

The project is being planned as a polished full-stack portfolio project for an Upwork profile. The goal is to show practical business software skills: authentication, role-based access, dashboards, CRUD modules, client-specific data access, relational database design, and production deployment.

## Target Users

| User | Description |
| --- | --- |
| Agency Admin | Agency owner, freelancer, consultant, or service provider who manages clients and project work |
| Client | Customer who logs in to view only their own assigned projects, tasks, updates, and invoices |

## Core Problem

Small service businesses often manage client work across email, spreadsheets, chat apps, and separate invoicing tools. That makes project status, tasks, updates, and billing harder to track and less professional for clients.

Workroom brings those client-facing workflows into one calm, organized portal.

## MVP Features

- Authentication
- Role-based access control
- Agency/admin dashboard
- Client management
- Project management
- Task and milestone management
- Project updates
- Invoice management
- Client portal

## Role Permissions

### Agency Admin

Agency admins can:

- Manage clients.
- Manage projects for their own clients.
- Manage tasks and milestones.
- Create and manage project updates.
- Create and manage invoices and invoice items.
- View an admin dashboard with business summaries.

Agency admins cannot access another agency admin's records.

### Client

Clients can:

- Log in to the client portal.
- View only their own assigned projects.
- View tasks and milestones for their projects.
- View project updates for their projects.
- View their own invoices.

Clients cannot create, edit, archive, or delete business records in the MVP.

## Data Model

Planned MVP entities:

- `users`
- `clients`
- `projects`
- `tasks`
- `project_updates`
- `invoices`
- `invoice_items`

Every business record is scoped to the owning agency where appropriate. For the MVP, `agency_id` references the agency admin user ID.

Examples:

- `clients.agency_id`
- `projects.agency_id`
- `tasks.agency_id`
- `project_updates.agency_id`
- `invoices.agency_id`

Client portal access is isolated through the authenticated client's `client_id`, so clients can only view their own data.

## API Plan

The backend will expose a REST API under:

```txt
/api/v1
```

Planned API areas:

- Auth: register, login, current user
- Dashboards: admin dashboard, client dashboard
- Clients
- Projects
- Tasks
- Project updates
- Invoices and invoice items

Protected requests will use:

```http
Authorization: Bearer <access_token>
```

The API will use consistent success and error responses, pagination for list endpoints, and server-side authorization for every protected route.

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

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## Design Direction

Workroom should feel calm, professional, premium, trustworthy, and practical.

The visual direction avoids bright blues, gradients, glowing UI, and generic tech startup styling. The interface should feel like focused business software for real client work.

Core design tokens:

| Token | Value |
| --- | --- |
| Font | Inter |
| Primary | `#1F2937` |
| Accent | `#6B7A5E` |
| Background | `#F8F7F4` |
| Surface | `#FFFFFF` |
| Muted Surface | `#F2F0EB` |
| Border | `#E5E7EB` |
| Text Primary | `#111827` |
| Text Secondary | `#4B5563` |
| Text Muted | `#6B7280` |

## Out of Scope for MVP

These features are intentionally deferred:

- AI update generator
- File upload
- PDF invoice generation
- Email notifications
- Payments
- Team members
- Comments
- Approvals

## Future Features

- AI-assisted project update generator
- File uploads for project assets and invoice attachments
- PDF invoice generation
- Email notifications
- Payment integration
- Internal team members
- Comments and client discussions
- Approval workflows
- Advanced reporting

## Planned Roadmap

1. Planning
2. Backend foundation
3. Authentication and permissions
4. Core backend modules
5. Frontend foundation
6. Admin dashboard
7. Client portal
8. Testing and polish
9. Deployment
10. Portfolio packaging

## Repository Structure

```txt
workroom/
  frontend/
  backend/
  README.md
```

## Local Development

Local development will be defined when implementation begins.

Planned local services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Live Demo

Coming soon.

## Demo Accounts

Demo accounts will be added after deployment.
