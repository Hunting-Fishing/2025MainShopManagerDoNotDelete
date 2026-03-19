

# Add Personal Trainer Module to All Navigation & Routing Layers

## What We're Doing

The Personal Trainer module exists in `moduleRoutes.ts`, `pricing.ts`, and `getPostLoginDestination.ts` but is missing from 5 other integration layers needed for full visibility and routing.

## Changes

### 1. `src/config/landingModules.ts` — Add to LANDING_MODULES array

Add a new `LandingModule` entry after `export-company` (before the closing `];` on line 636) with slug `personal-trainer`, icon `Dumbbell`, color `bg-orange-500`, `available: true`, and core features covering client management, workout programming, session scheduling, and medical condition tracking with ICD-10 integration.

### 2. `src/components/layout/sidebar/navigation.ts` — Add sidebar section

Add a "Personal Trainer" navigation section after the Fuel Delivery block (after line 891) with items: Dashboard, Clients, Workout Programs, Exercises, Sessions, Body Metrics, Packages, Client Billing, Settings — all with `permissionModule: 'personal_trainer'` and `/personal-trainer/*` hrefs.

### 3. `src/utils/routeGuards.ts` — Add route permission

Add `{ path: '/personal-trainer', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'owner'] }` after the Export Company entry (line 134).

### 4. `src/components/layout/Navbar.tsx` — Add to hamburger menu

Add a "Personal Trainer" section to the `menuSections` array with items: Dashboard, Clients, Programs, Sessions, Exercises, Metrics.

### 5. `src/components/mobile/MobileNavigation.tsx` — Add path detection

Update the `getDefaultModule` function's return type union to include `'personal_trainer'` and add `if (path.startsWith('/personal-trainer')) return 'personal_trainer';` to the path checks.

## Files to Edit

| File | Change |
|------|--------|
| `src/config/landingModules.ts` | Add Personal Trainer to LANDING_MODULES |
| `src/components/layout/sidebar/navigation.ts` | Add sidebar nav section |
| `src/utils/routeGuards.ts` | Add route permission entry |
| `src/components/layout/Navbar.tsx` | Add hamburger menu section |
| `src/components/mobile/MobileNavigation.tsx` | Add path detection for feedback module |

