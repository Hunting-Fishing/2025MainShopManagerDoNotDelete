

# Fix: Septic Profile Save Button Silent Failure

## Root Causes Found

### Problem 1: Invalid column in insert
`useModuleDisplayInfo.ts` line 119 passes `is_enabled: true` when inserting into `shop_enabled_modules`, but this column does not exist on the table. The actual columns are: `id, shop_id, module_id, enabled_at, enabled_by, display_name, display_logo_url, display_phone, display_email, display_address, display_description`. This causes every insert attempt to fail with a Supabase error.

### Problem 2: Sonner toaster not mounted
228+ files use `toast` from `sonner` for success/error feedback, but the Sonner `<Toaster />` component is never rendered in the app. `App.tsx` only mounts the shadcn `<Toaster />` from `@/components/ui/toaster`. The sonner wrapper exists at `src/components/ui/sonner.tsx` but is never imported. This means all sonner toast calls across the entire app are silently swallowed — no success or error messages ever appear.

## Fix

### File 1: `src/hooks/useModuleDisplayInfo.ts`
Remove `is_enabled: true` from the insert payload (line 119). Replace with `enabled_by` using the current user's ID for audit trail, matching how `SepticSettings.tsx` already does it.

### File 2: `src/App.tsx`
Import and render the Sonner `<Toaster />` alongside the existing shadcn toaster so both toast systems work:
```ts
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
```
Add `<SonnerToaster />` next to the existing `<Toaster />` on line 1837.

## Impact
- Fixes the silent save failure on Septic Profile page
- Fixes all sonner-based toast notifications across the entire app (228+ files affected)
- No database changes needed — the table schema is correct as-is

