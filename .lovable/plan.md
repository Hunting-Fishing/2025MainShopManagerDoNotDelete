

# Septic Module: Employee Management with Roles, Training & Certifications

## Overview

Expand the septic module from "Drivers only" to a full **Employee** system. Employees can hold multiple job roles (installer, driver, inspector, manager, reception, etc.), and each employee tracks certifications/training with expiry alerts for WorkSafe compliance.

## Database Changes

### 1. New table: `septic_employees`
Replaces the driver-only model with a broader staff table.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| shop_id | uuid FK → shops | RLS via `get_current_user_shop_id()` |
| profile_id | uuid nullable | Link to auth profile if they're a system user |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| phone | text | |
| email | text | |
| hire_date | date | |
| hourly_rate | numeric | |
| status | text DEFAULT 'active' | active, inactive, terminated |
| emergency_contact_name | text | |
| emergency_contact_phone | text | |
| home_address | text | |
| notes | text | |
| created_at / updated_at | timestamptz | |

### 2. New table: `septic_employee_roles`
Many-to-many: an employee can be a driver AND an inspector.

| Column | Type |
|---|---|
| id | uuid PK |
| employee_id | uuid FK → septic_employees |
| role | text NOT NULL | Values: `driver`, `installer`, `inspector`, `pump_operator`, `manager`, `reception`, `technician`, `laborer` |
| is_primary | boolean DEFAULT false |
| assigned_at | timestamptz |

Unique constraint on (employee_id, role).

### 3. New table: `septic_certification_types`
Module-specific cert types (separate from the general `staff_certificate_types`).

| Column | Type |
|---|---|
| id | uuid PK |
| shop_id | uuid FK |
| name | text | e.g. "CDL Class B", "Tanker Endorsement", "HazMat", "Installer License", "Inspector Certification", "First Aid/CPR", "Confined Space Entry" |
| description | text | |
| requires_renewal | boolean DEFAULT true |
| default_validity_months | integer | |
| category | text | `license`, `certification`, `training`, `endorsement` |

### 4. New table: `septic_employee_certifications`

| Column | Type |
|---|---|
| id | uuid PK |
| employee_id | uuid FK → septic_employees |
| certification_type_id | uuid FK → septic_certification_types |
| certificate_number | text | |
| issue_date | date | |
| expiry_date | date | |
| issuing_authority | text | |
| status | text | `valid`, `expired`, `pending_renewal` |
| document_url | text | Upload scan/photo |
| notes | text | |

### 5. Migrate `septic_drivers` data
Insert existing `septic_drivers` rows into `septic_employees` with a `driver` role entry in `septic_employee_roles`. Keep CDL fields as certifications. Update references in routes/completions to point to new table via a `driver_id` alias view or by updating queries.

### 6. Seed default certification types
Pre-populate common septic industry certifications per shop:
- CDL Class A/B, Tanker Endorsement, HazMat Endorsement
- Septic Installer License, Inspector Certification
- Confined Space Entry, First Aid/CPR, OSHA 10/30
- Medical Card, Water Quality Certification

### 7. RLS policies
All four new tables use `shop_id = get_current_user_shop_id()` for full CRUD.

## UI Changes

### Settings Tab: "Employees" (new tab in `SepticSettings.tsx`)
Add an "Employees" tab alongside existing Profile, Regulations, etc.

### Employee List Page: Upgrade `SepticStaff.tsx`
- Rename page title from "Staff" to "Employees"
- Show role badges (Driver, Inspector, Installer, etc.) on each card
- Filter/search by role
- "Add Employee" dialog with:
  - Name, phone, email, hire date
  - Multi-select role picker (checkboxes for all role types)
  - Status

### Employee Detail Page: Upgrade `SepticDriverDetail.tsx` → generalize
- **Info tab**: Name, contact, emergency contact, hire date, pay rate
- **Roles tab**: Current roles with toggle on/off, primary role indicator
- **Certifications tab**: List all certs with expiry status (green/yellow/red badges), add/edit cert dialog, upload document
- **Training tab**: Training history log

### Certification Dashboard (in Settings → Employees tab)
- Summary cards: Total employees, Expiring soon (30 days), Expired, Fully compliant
- Table view of all certs across employees with sort by expiry
- Bulk reminder capability (future)

### Update existing references
- `SepticRoutes.tsx`: Query `septic_employees` with role filter `driver` instead of `septic_drivers`
- `SepticCompletions.tsx`: Join to `septic_employees` instead of `septic_drivers`
- `SepticDrivers.tsx`: Redirect to new employees page or keep as filtered view

## Files

| File | Action |
|---|---|
| Migration SQL | Create 4 tables + migrate driver data + seed cert types |
| `src/pages/septic/SepticStaff.tsx` | Rewrite to use `septic_employees` + role badges |
| `src/pages/septic/SepticDriverDetail.tsx` | Generalize to employee detail with roles + certs tabs |
| `src/pages/septic/SepticSettings.tsx` | Add "Employees" tab with cert dashboard |
| `src/pages/septic/SepticRoutes.tsx` | Update driver queries to `septic_employees` filtered by role |
| `src/pages/septic/SepticCompletions.tsx` | Update driver join |
| `src/pages/septic/SepticDrivers.tsx` | Redirect to `/septic/staff` or keep as role-filtered view |

