

# Business Operations Section for Personal Trainer Module

## Overview

Add a **Business** section to the PT module sidebar with two new pages: **Gym Staff** (manage non-trainer employees like front desk, cleaners, managers) and **Time Tracking** (clock-in/out, shift logs, hours worked reports). This is scoped to the Owner role and provides operational management within the module.

## Database — New Tables

### `pt_gym_staff`
General gym employees (distinct from `pt_trainers` which are fitness professionals).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops | Multi-tenant |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| email | text | |
| phone | text | |
| role | text DEFAULT 'staff' | front_desk, manager, cleaner, maintenance, staff |
| department | text | |
| hourly_rate | numeric | Pay rate |
| hire_date | date | |
| is_active | boolean DEFAULT true | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `pt_time_entries`
Clock-in/out records for all gym staff and trainers.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops | |
| staff_id | uuid FK → pt_gym_staff, nullable | For gym staff |
| trainer_id | uuid FK → pt_trainers, nullable | For trainers |
| clock_in | timestamptz NOT NULL | Start time |
| clock_out | timestamptz | End time (null = still clocked in) |
| break_minutes | int DEFAULT 0 | Break duration |
| total_hours | numeric | Computed on clock-out |
| notes | text | Shift notes |
| status | text DEFAULT 'active' | active, completed, edited |
| created_at | timestamptz | |

RLS: Both tables scoped by `shop_id = public.get_current_user_shop_id()`.

## New Pages

### 1. Gym Staff Page (`/personal-trainer/staff`)
- Staff list with role badges, contact info, active/inactive status
- Add/edit staff dialog with role selector (front desk, manager, cleaner, maintenance, etc.)
- Toggle active/inactive status
- Search and filter by role/department

### 2. Time Tracking Page (`/personal-trainer/time-tracking`)
- **Active Shifts**: Cards showing who is currently clocked in with elapsed time
- **Clock In/Out**: Select a staff member or trainer, clock them in or out
- **Shift Log**: Table of past entries with date range filter, showing staff name, clock-in/out times, break, total hours
- **Weekly Summary**: Aggregate hours per staff member for the selected week, with total pay calculation (hours x hourly_rate)

## New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `GymStaffPage.tsx` | `src/pages/personal-trainer/` | Staff CRUD page |
| `TimeTrackingPage.tsx` | `src/pages/personal-trainer/` | Clock-in/out and shift history |
| `AddGymStaffDialog.tsx` | `src/components/personal-trainer/business/` | Staff creation/edit form |
| `ClockInOutCard.tsx` | `src/components/personal-trainer/business/` | Active shift display and clock action |
| `ShiftLogTable.tsx` | `src/components/personal-trainer/business/` | Historical shift entries table |
| `WeeklyHoursSummary.tsx` | `src/components/personal-trainer/business/` | Weekly hours + pay aggregation |

## Sidebar Changes

Add a new **Business** section between Billing and Engagement:

```text
Business
  ├── Gym Staff      (UsersRound icon, blue-indigo gradient)
  └── Time Tracking  (Clock icon, green-teal gradient)
```

## Route Changes

Add two lazy-loaded routes under the `/personal-trainer` parent:
- `/personal-trainer/staff`
- `/personal-trainer/time-tracking`

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create `pt_gym_staff` and `pt_time_entries` with RLS |
| `PersonalTrainerGymStaff.tsx` | New page |
| `PersonalTrainerTimeTracking.tsx` | New page |
| `src/components/personal-trainer/business/AddGymStaffDialog.tsx` | New |
| `src/components/personal-trainer/business/ClockInOutCard.tsx` | New |
| `src/components/personal-trainer/business/ShiftLogTable.tsx` | New |
| `src/components/personal-trainer/business/WeeklyHoursSummary.tsx` | New |
| `PersonalTrainerSidebar.tsx` | Add Business section |
| `App.tsx` | Add routes |

