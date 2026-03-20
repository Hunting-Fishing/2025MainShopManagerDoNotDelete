

# Redirect All "Back" Navigation to Module Hub & Rename Dashboard

## Problem

`/dashboard` is the Repair Shop (Automotive) dashboard, but it's used as the universal "home" across the entire app. When Chrissy (Personal Trainer only) navigates to `/dashboard`, she sees Repair Shop content with work orders, inventory, etc. — none of which applies to her.

Every module sidebar has a "Back to Main App" link pointing to `/dashboard`, and `getPostLoginDestination` correctly sends single-module users to their module. But if users manually navigate or click "Back", they land on the wrong page.

## Fix

Replace **all** references to `navigate('/dashboard')` and `to="/dashboard"` with `/module-hub` across the app. The Module Hub is the correct universal landing — it shows only the user's enabled modules and lets them pick one.

### Files to update (10 files, ~20 occurrences)

| File | Change |
|------|--------|
| `src/components/personal-trainer/PersonalTrainerSidebar.tsx` | `navigate('/dashboard')` → `navigate('/module-hub')` |
| `src/components/personal-trainer/PersonalTrainerHeader.tsx` | Same |
| `src/components/fuel-delivery/FuelDeliverySidebar.tsx` | Same |
| `src/components/water-delivery/WaterDeliverySidebar.tsx` | Same |
| `src/components/water-delivery/WaterDeliveryHeader.tsx` | Same |
| `src/components/export/ExportSidebar.tsx` | Same |
| `src/components/septic/SepticSidebar.tsx` | Same |
| `src/components/septic/SepticHeader.tsx` | Same |
| `src/components/common/PlaceholderPage.tsx` | Same (2 occurrences) |
| `src/components/auth/RoleGuard.tsx` | `to="/dashboard"` → `to="/module-hub"` (2 occurrences) |
| `src/components/layout/Navbar.tsx` | `to="/dashboard"` → `to="/module-hub"` (2 occurrences) |
| `src/components/ux/KeyboardShortcuts.tsx` | `navigate('/dashboard')` → `navigate('/module-hub')` |

### Route rename

In `src/App.tsx`, keep the `/dashboard` route for backward compatibility but also add a redirect:
- Add: `<Route path="/dashboard" element={<Navigate to="/module-hub" replace />} />` (redirect any direct `/dashboard` visits to module hub)
- Move the Dashboard component to `/repair-shop` or keep it under `/automotive` (it's already the Automotive module's dashboard)

### Label updates

Change "Back to Main App" and "Return to Dashboard" labels to "All Modules" for consistency with the sidebar terminology.

### main.tsx

Re-save to fix recurring duplicate attribute build error.

