

# Fix: Drivers Page & Driver App — Connect to Employee System

## Problem

The **Drivers page** (`SepticDrivers.tsx`) and **Driver Detail** (`SepticDriverDetail.tsx`) still query the old `septic_drivers` table, which is empty. Meanwhile, employees with the "driver" role exist in `septic_employees` + `septic_employee_roles`. The Driver App also doesn't filter by the logged-in driver.

## Plan

### 1. Rewrite `SepticDrivers.tsx` to query `septic_employees` with driver role

- Query `septic_employees` joined with `septic_employee_roles!inner(role)` filtered to `role = 'driver'`
- Display employee name, status, phone, email, role badges
- "Add Driver" button → navigates to `/septic/staff` (Add Employee dialog) instead of maintaining a separate add flow
- Clicking a driver card → navigates to `/septic/staff/{id}` (the existing employee detail page with full profile, certs, orders tabs)

### 2. Redirect `SepticDriverDetail.tsx` to Employee Detail

- Replace the entire component with a redirect: `navigate('/septic/staff/{id}', { replace: true })`
- This avoids maintaining two separate detail pages — the employee detail already has all driver info plus certs, roles, orders, invoices

### 3. Enhance `SepticDriverApp.tsx` — filter by logged-in driver

- Look up the current auth user's `septic_employees` record (match `profile_id` or email)
- Filter today's orders to only those assigned to this employee (`assigned_employee_id` or `assigned_driver_id`)
- Show the driver's name and today's job count in header
- Keep existing job card UI (navigate, status badges, customer info)

### 4. Update `SepticCompletions.tsx` join

- Change `septic_drivers(first_name, last_name)` → join `septic_employees` via `driver_id` FK
- Display employee name instead of old driver name

## Files to modify

| File | Change |
|---|---|
| `src/pages/septic/SepticDrivers.tsx` | Query `septic_employees` + `septic_employee_roles` filtered by driver role |
| `src/pages/septic/SepticDriverDetail.tsx` | Redirect to `/septic/staff/:id` |
| `src/pages/septic/SepticDriverApp.tsx` | Filter orders by logged-in employee |
| `src/pages/septic/SepticCompletions.tsx` | Update driver join to `septic_employees` |

