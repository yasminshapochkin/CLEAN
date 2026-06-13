# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (polling flags are set for WSL file-watching)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

There is no test suite currently.

## Architecture

**Clean** is a cleaning-services marketplace: customers browse and book verified cleaners; cleaners manage availability and respond to requests; admins approve cleaner applications.

Stack: Next.js 14 App Router · TypeScript · Supabase (Postgres + Auth + Storage + Realtime) · Tailwind CSS · Resend (email).

### Route groups

```
src/app/
├── (auth)/       # /login  /register  /register/cleaner
├── (cleaner)/    # /cleaner/dashboard  /profile  /availability  /requests  /pending  /preview
└── api/auth/signout/
```

The `(customer)/` and `(admin)/` route groups are specified in `spec.md` but not yet implemented.

### Supabase client hierarchy

Three distinct clients — use the right one per context:

| File | Use when |
|---|---|
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `src/lib/supabase/client.ts` | Client Components (`"use client"`) |
| `src/lib/supabase/admin.ts` | Admin-only operations requiring service role (bypasses RLS) |

`createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` and must never be called from client-side code.

### Middleware & auth

`src/middleware.ts` runs at the edge on every non-static request. It:
1. Skips `supabase.auth.getUser()` entirely when no session cookie is present (avoids a network hang).
2. Redirects unauthenticated users to `/login`.
3. Redirects authenticated users away from `/login`/`/register` to `/{role}/dashboard`.
4. Enforces role — only `cleaner` role can access `/cleaner/*` routes.

Role is stored in the `profiles.role` column and read from Supabase (not the JWT) inside middleware.

### Server Actions pattern

All mutations are Next.js Server Actions (`"use server"`) in `actions.ts` files co-located with their route group. They always:
- Call `supabase.auth.getUser()` to get the authenticated user (never trust client-passed IDs).
- Return `{ error: string }` on failure or `{ success: true }` on success.
- Call `revalidatePath(...)` after mutations so Server Components re-fetch.

### Realtime

Realtime is implemented via headless `"use client"` components that subscribe to Supabase Postgres changes and call `router.refresh()` to re-render Server Components. See `RealtimeBookings.tsx` for the pattern.

### Geocoding & location

Cleaner base location is geocoded via OpenStreetMap Nominatim on profile save (`(cleaner)/actions.ts`). The result is stored as a PostGIS `POINT(lng lat)` string in `cleaners.location`. Browse queries use `ST_DWithin` to filter by distance.

### Email notifications

`src/lib/resend.ts` exports typed functions for each notification event (booking accepted/declined, application approved/rejected, new booking request). These are called from Server Actions. Email failure is caught and swallowed — it must not block the primary mutation.

### Types

All shared DB types live in `src/types/database.ts`. The key enums are `UserRole`, `BookingStatus`, `CleanerStatus`, `ApplicationStatus`, and `ServiceType`.

### Environment variables

Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
