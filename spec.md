# Clean — Product Requirements Document
**Date:** 2026-06-11
**Stack:** Next.js 14 (App Router, TypeScript) · Supabase (Postgres, Auth, Storage, Realtime) · Vercel · Tailwind CSS

---

## Context

Clean is a web-based marketplace that connects customers with verified cleaning professionals in a single city. Customers browse cleaners by location, availability, and service type, then send booking requests. Cleaners respond within 24 hours. Payment happens off-platform. Clean's value is trust (verified cleaners) and convenience (availability-aware search).

---

## Scope — MVP

**In:** Customer browse & booking, cleaner profiles & availability, cleaner verified onboarding, admin review panel, real-time booking status updates.
**Out of MVP:** Payments, reviews/ratings, multi-city, mobile app, chat.

---

## Architecture

Single Next.js App Router app, one Vercel project, one Supabase project per environment (`main` → production, `dev` → staging).

**Route groups:**
```
app/
├── (auth)/           # /login  /register  /onboarding
├── (customer)/       # /browse  /cleaners/[id]  /bookings  /profile
├── (cleaner)/        # /dashboard  /profile  /availability  /requests
├── (admin)/          # /applications  /users  /bookings
└── api/              # server actions + route handlers
```

Supabase Auth handles sessions. Next.js middleware reads the user's `role` from the JWT and redirects unauthenticated or wrong-role users at the edge before any page renders.

---

## Data Model

### `profiles`
| column | type | notes |
|---|---|---|
| id | uuid PK | FK → auth.users |
| full_name | text | |
| phone | text | |
| role | enum | `customer` `cleaner` `admin` |
| avatar_url | text | Supabase Storage |
| created_at | timestamptz | |

### `customers`
| column | type | notes |
|---|---|---|
| id | uuid PK | FK → profiles |
| bio | text | optional |
| address | text | display address |
| lat | float8 | geocoded on save |
| lng | float8 | geocoded on save |
| preferred_service_type | enum | `residential` `commercial` `both` |

### `cleaners`
| column | type | notes |
|---|---|---|
| id | uuid PK | FK → profiles |
| bio | text | |
| service_types | text[] | `['residential','commercial']` |
| hourly_rate | numeric | informational only, payment off-platform |
| location | geography(Point,4326) | base location, PostGIS |
| service_radius_km | int | how far they travel |
| status | enum | `pending` `approved` `rejected` `suspended` |
| years_experience | int | |
| languages | text[] | |

### `cleaner_applications`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| cleaner_id | uuid | FK → profiles |
| id_document_url | text | Supabase Storage |
| status | enum | `pending` `approved` `rejected` |
| admin_notes | text | optional rejection reason |
| submitted_at | timestamptz | |
| reviewed_at | timestamptz | |
| reviewed_by | uuid | FK → profiles (admin) |

### `cleaner_availability`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| cleaner_id | uuid | FK → cleaners |
| day_of_week | int | 0=Sun … 6=Sat |
| start_time | time | e.g. 08:00 |
| end_time | time | e.g. 14:00 |

One row per available block. A cleaner can have multiple blocks per day.

### `bookings`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid | FK → profiles |
| cleaner_id | uuid | FK → profiles |
| service_type | enum | `residential` `commercial` |
| scheduled_date | date | |
| scheduled_start | time | |
| duration_hours | int | |
| address | text | customer address for this job |
| notes | text | customer instructions |
| status | enum | `pending` `accepted` `declined` `completed` `cancelled` |
| response_deadline | timestamptz | created_at + 24h |
| created_at | timestamptz | |
| responded_at | timestamptz | |

---

## Location Matching

Cleaners set a base location + service radius. Customers store their geocoded address (lat/lng via OpenStreetMap Nominatim, called once on address save).

Browse query filters by location AND availability:

```sql
SELECT DISTINCT c.*
FROM cleaners c
JOIN cleaner_availability a ON a.cleaner_id = c.id
WHERE c.status = 'approved'
  AND $service_type = ANY(c.service_types)
  AND ST_DWithin(
        c.location::geography,
        ST_Point($lng, $lat)::geography,
        c.service_radius_km * 1000
      )
  AND a.day_of_week = $day
  AND a.start_time <= $requested_start
  AND a.end_time   >= $requested_end
```

---

## User Flows

### Customer
1. Register → fill profile (name, photo, bio, preferred service type) → enter & geocode address
2. Browse cleaners — filter by: service type · day · time window (results = location + availability match)
3. View cleaner profile — bio, rate, service types, languages, experience
4. Send booking request — pick date, time, duration, add notes
5. Wait up to 24h — real-time status update via Supabase subscription
6. **Accepted** → cleaner contact info revealed, settle payment off-platform
7. **Declined / expired** → notification, can request another cleaner
8. After job → mark booking `completed`

### Cleaner
1. Register → submit application (bio, ID document upload)
2. Wait for admin approval → email notification on approval/rejection
3. After approval → set full profile (location, radius, service types, rate, languages, bio)
4. Set weekly availability (recurring day + time blocks)
5. Receive incoming booking requests
6. Accept or decline within 24h response window
7. Accepted → customer contact info revealed

### Admin
1. View pending cleaner applications
2. Review submitted ID documents (Supabase Storage viewer)
3. Approve or reject (with optional notes) → triggers email notification to cleaner
4. View and manage all users and bookings
5. Suspend/unsuspend approved cleaners

---

## Pages & Key Components

| Route | Audience | Description |
|---|---|---|
| `/register` | all | Role selection (customer / cleaner) then role-specific onboarding |
| `/login` | all | Email + password |
| `/customer/browse` | customer | Search bar (day, time, service type) + cleaner card grid |
| `/customer/cleaners/[id]` | customer | Cleaner profile + "Request Booking" CTA |
| `/customer/bookings` | customer | Booking history with real-time status badges |
| `/customer/profile` | customer | Edit profile, address, preferences |
| `/cleaner/dashboard` | cleaner | Pending requests (with countdown), upcoming accepted jobs |
| `/cleaner/profile` | cleaner | Edit bio, rate, service types, photos |
| `/cleaner/availability` | cleaner | Weekly availability grid (add/remove time blocks) |
| `/cleaner/requests` | cleaner | All incoming requests with accept/decline actions |
| `/admin/applications` | admin | Table of pending applications with doc viewer |
| `/admin/users` | admin | All customers and cleaners, status controls |
| `/admin/bookings` | admin | All bookings, status overview |

---

## Real-time & Notifications

- **Supabase Realtime** subscriptions on the `bookings` table
  - Customer subscribes to their bookings → badge updates when cleaner responds
  - Cleaner subscribes to new bookings → notification when a request arrives
- **Email notifications** (Supabase Auth emails + custom triggers via Supabase Edge Function or a simple email API like Resend)
  - Cleaner: application approved / rejected
  - Cleaner: new booking request received
  - Customer: booking accepted / declined / expired

---

## Security & Access Control

- Supabase Row Level Security on every table
  - Customers read/write only their own rows
  - Cleaners read/write only their own rows; read bookings where `cleaner_id = auth.uid()`
  - Admins have full read/write via service role key (admin routes only, never exposed client-side)
- Cleaner documents stored in a private Supabase Storage bucket — accessible only via signed URLs generated server-side
- Booking expiry handled at query time: `pending` bookings where `response_deadline < now()` are treated as `cancelled` — no background job needed for MVP

---

## Out of Scope (Future Versions)

- Reviews & ratings
- In-app payments / escrow
- Multi-city / geolocation expansion
- Real-time chat between customer and cleaner
- Mobile app
- Cleaner availability calendar sync (Google Calendar etc.)

---

## Verification Checklist

- [ ] Customer can register, set profile, and geocode address
- [ ] Cleaner can submit application with document upload
- [ ] Admin can approve/reject application; cleaner receives notification
- [ ] Browse page returns only approved cleaners matching location + availability filters
- [ ] Customer can send a booking request; cleaner sees it in real-time
- [ ] Cleaner can accept/decline; customer status updates in real-time
- [ ] Bookings past `response_deadline` auto-cancel
- [ ] RLS prevents cross-user data access
- [ ] Middleware redirects wrong-role users before page render
