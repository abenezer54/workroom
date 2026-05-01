# Workroom Frontend

Next.js frontend for Workroom, a calm client portal for service businesses.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- TanStack Query
- TanStack Table
- React Hook Form
- Zod

## Setup

Install dependencies:

```sh
npm install
```

Create a local environment file:

```sh
cp .env.example .env.local
```

Run the development server:

```sh
npm run dev
```

The app runs on:

```txt
http://localhost:3000
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Workroom backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth web client ID used by the Google sign-in/sign-up button |

Default local value:

```txt
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=replace-with-google-oauth-client-id
```

## Scripts

```sh
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Structure

```txt
frontend/
  app/
    (public)/
    (auth)/
    (admin)/
    (client)/
  components/
    auth/
    layout/
    shared/
    ui/
  hooks/
  lib/
    api/
    auth/
    validations/
```

## Design System

The frontend uses the Workroom design tokens from `docs/DESIGN_SYSTEM.md`.

The interface should feel calm, professional, mature, trustworthy, and premium. It avoids blue-heavy styling, gradients, glowing effects, decorative dashboards, and overly playful UI.

## API Client

API helpers live in `lib/api`.

- `client.ts` reads `NEXT_PUBLIC_API_URL`.
- Requests automatically attach `Authorization: Bearer <token>` when a token exists.
- Standard backend success and error envelopes are parsed in one place.
- `ApiError` normalizes API failures for UI components and forms.

## Auth Foundation

Auth helpers live in `lib/auth`.

- `token.ts` centralizes access token storage.
- `auth-provider.tsx` loads the current user with `/auth/me`.
- Google login and signup use Google Identity Services, then exchange the returned ID token with `/auth/google`.
- `roles.ts` contains role utilities for `AGENCY_ADMIN` and `CLIENT`.
- `useRequireRole` provides a client-side route protection helper for app shells.

Token storage currently uses `localStorage` for MVP simplicity. Keep token handling centralized if this moves to cookies later.

## Initial Routes

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/client`

These routes are foundation placeholders only. Full CRUD pages are intentionally left for the feature implementation phases.
