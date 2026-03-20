

# Gym Calendar — Monthly, Weekly & Daily Views

## Overview

Add a full-featured calendar page to the Personal Trainer module at `/personal-trainer/calendar`. This calendar supports event creation for signups, upcoming events, gym notifications, closed days, health concerns, and general announcements — visible to trainers, staff, and clients.

## Database

### New table: `pt_gym_events`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops | Multi-tenant scoping |
| title | text NOT NULL | Event title |
| description | text | Details |
| start_time | timestamptz NOT NULL | Event start |
| end_time | timestamptz NOT NULL | Event end |
| all_day | boolean DEFAULT false | Full-day event |
| event_type | text NOT NULL | `class`, `signup`, `notification`, `closed_day`, `health_concern`, `event`, `maintenance` |
| location | text | Room, bay, etc. |
| color | text | Display color |
| max_signups | int | Capacity limit (null = unlimited) |
| current_signups | int DEFAULT 0 | Current count |
| is_recurring | boolean DEFAULT false | Future: recurring support |
| recurrence_rule | text | Future: iCal RRULE |
| created_by | uuid FK → profiles | Who created it |
| created_at | timestamptz | |

RLS: Scoped by `shop_id = get_current_user_shop_id()`.

### New table: `pt_event_signups`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| event_id | uuid FK → pt_gym_events | |
| client_id | uuid FK → pt_clients | |
| signed_up_at | timestamptz | |
| status | text DEFAULT 'confirmed' | `confirmed`, `waitlisted`, `cancelled` |
| UNIQUE(event_id, client_id) | | |

RLS: Scoped via event's shop_id join.

## New Page

### `PersonalTrainerCalendar.tsx` (`/personal-trainer/calendar`)

- **Header**: Month/Week/Day toggle buttons, navigation arrows (prev/next), "Today" button, current date display
- **Month view**: Grid of days showing event dots/badges with color-coded event types; click a day to drill into day view
- **Week view**: 7-column time grid (7am–9pm) with events as colored blocks
- **Day view**: Single-column hourly timeline with full event details
- **Create Event dialog**: Floating action button opens a form with title, type selector (class/signup/closed day/notification/health concern/event), date/time pickers, description, location, max signups, color picker
- **Event detail dialog**: Click any event to see full details, signup count, and edit/delete options

## New Components

| Component | Purpose |
|-----------|---------|
| `GymCalendar.tsx` | Main calendar wrapper with view toggle and date navigation |
| `GymCalendarMonthView.tsx` | Month grid with event indicators |
| `GymCalendarWeekView.tsx` | Week time-grid layout |
| `GymCalendarDayView.tsx` | Day hourly timeline |
| `GymEventCard.tsx` | Compact event display within calendar cells |
| `CreateGymEventDialog.tsx` | Form dialog for creating/editing events |
| `GymEventDetailDialog.tsx` | Event detail view with signup management |

All in `src/components/personal-trainer/calendar/`.

## Event Type Color Scheme

- **Class**: Blue — group fitness classes
- **Signup**: Green — open registration events
- **Notification**: Yellow — general gym announcements
- **Closed Day**: Red — gym closures/holidays
- **Health Concern**: Orange — safety/health alerts
- **Event**: Purple — special events, competitions
- **Maintenance**: Gray — equipment/facility maintenance

## Navigation

Add "Calendar" to the **Scheduling** section in `PersonalTrainerSidebar.tsx` alongside Sessions, using the `CalendarDays` icon.

## Files to Create/Edit

| File | Change |
|------|--------|
| `src/pages/personal-trainer/PersonalTrainerCalendar.tsx` | New page |
| `src/components/personal-trainer/calendar/GymCalendar.tsx` | Main calendar component |
| `src/components/personal-trainer/calendar/GymCalendarMonthView.tsx` | Month grid |
| `src/components/personal-trainer/calendar/GymCalendarWeekView.tsx` | Week time-grid |
| `src/components/personal-trainer/calendar/GymCalendarDayView.tsx` | Day timeline |
| `src/components/personal-trainer/calendar/GymEventCard.tsx` | Event display chip |
| `src/components/personal-trainer/calendar/CreateGymEventDialog.tsx` | Create/edit event form |
| `src/components/personal-trainer/calendar/GymEventDetailDialog.tsx` | Event detail + signups |
| `PersonalTrainerSidebar.tsx` | Add Calendar nav item |
| `App.tsx` | Add route |
| Migration SQL | Create `pt_gym_events` and `pt_event_signups` tables with RLS |

