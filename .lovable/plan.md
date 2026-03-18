

## Plan: Expand Personal Trainer Module to Full 3-Role System

### Current State

**Existing DB tables (9):** `pt_clients`, `pt_exercises`, `pt_workout_programs`, `pt_program_exercises`, `pt_client_programs`, `pt_sessions`, `pt_body_metrics`, `pt_packages`, `pt_client_packages`

**Existing pages (9 admin + 4 portal):** Dashboard, Clients, Exercises, Programs, Sessions, Metrics, Packages, Billing, Settings + PT Portal (Landing, Login, Register, Dashboard)

**Missing from the prompt:** Trainers table, workout days structure, check-ins, messaging, invoices, progress photos, trainer role UI, admin reports, workout builder with day/exercise drag, charts, session notes, workout completion tracking.

---

### Phased Implementation Plan

This is a large scope. I recommend building in 3 phases to keep each deliverable testable.

---

### Phase 1 -- Database Expansion + Trainer Role + Core Missing Pages

**New database tables (migration):**

| Table | Purpose |
|---|---|
| `pt_trainers` | Trainer profiles (linked to auth user, shop-scoped) with specializations, bio, certifications |
| `pt_workout_days` | Days within a program (e.g., "Day 1 - Chest & Triceps") |
| `pt_workout_day_exercises` | Exercises within a workout day (sets, reps, rest, order) |
| `pt_check_ins` | Weekly client check-ins (weight, mood, energy, sleep, notes, photos) |
| `pt_messages` | Messaging between trainer and client (room-based, text/image) |
| `pt_progress_photos` | Client progress photos with date/category |
| `pt_invoices` | Invoices tied to client packages or custom charges |

**Schema alterations:**
- Add `trainer_id` column to `pt_client_programs` (who assigned it)
- Add `progress_photos_url` to `pt_body_metrics` (optional link)
- Restructure `pt_program_exercises` to reference `pt_workout_days` instead of flat `day_of_week` integer

**New admin pages:**
- `/personal-trainer/trainers` -- Manage trainer profiles (CRUD)
- `/personal-trainer/check-ins` -- View client weekly check-ins
- `/personal-trainer/messages` -- Trainer-client messaging
- `/personal-trainer/reports` -- Revenue, attendance, retention charts
- `/personal-trainer/clients/:id` -- Client detail page (profile, goals, injuries, measurements, photos, assigned programs, sessions, billing)

**Sidebar updates:** Add Trainers, Check-ins, Messages, Reports nav items.

---

### Phase 2 -- Workout Builder + Program Assignment Flow

**Workout Builder** (on Programs page or dedicated sub-page):
- Select a program, then manage days within it
- For each day, add exercises from the library with sets/reps/rest/order
- Drag-to-reorder exercises within a day
- Template duplication

**Program Assignment Flow:**
- From client detail page or programs page, assign a program to a client
- Set start date, auto-calculate end date from duration_weeks
- Track completion status

**Workout Completion Tracking** (client portal):
- Client marks exercises as completed per day
- New table `pt_workout_logs` for tracking sets/reps/weight used per exercise

---

### Phase 3 -- Client Portal Expansion + Charts + Polish

**Client portal enhancements:**
- Weekly check-in submission form
- Progress photo uploads
- Messaging with trainer
- Workout day view with completion checkboxes
- Package/session balance display
- Simple progress charts (weight over time, measurements over time) using Recharts

**Admin reports page:**
- Revenue by month (bar chart)
- Session attendance rate
- Client retention rate
- Expiring packages alerts

---

### Implementation Order (Phase 1 first)

1. **Database migration** -- Create 7 new tables + alter existing ones
2. **Trainers page** -- CRUD for trainer profiles
3. **Client detail page** -- Full profile view with tabs (Profile, Programs, Sessions, Metrics, Check-ins, Billing)
4. **Check-ins page** -- View/manage weekly check-ins
5. **Messages page** -- Simple trainer-client messaging
6. **Reports page** -- Revenue/attendance/retention with Recharts
7. **Sidebar + routing updates**
8. **Client portal** -- Add check-in form, progress photos, messaging tab

Shall I proceed with Phase 1?

