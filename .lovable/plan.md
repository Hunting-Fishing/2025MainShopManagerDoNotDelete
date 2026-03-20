

# Restrict Developer Section to Developer Role Only

## Problem

The Developer section in the left sidebar (line 118 of `SidebarContent.tsx`) currently checks for `admin` or `owner` roles. This means Chrissy (who has the `owner` role) sees the Developer links, but she should not — only the platform developer (`jordilwbailey@gmail.com`) should see them.

## Fix

In `src/components/layout/sidebar/SidebarContent.tsx`:

1. **Import `useAllUserRoles`** instead of (or in addition to) the existing `useUserRoles` hook — since the developer status is determined via the `is_platform_developer` RPC, which is only checked in `useAllUserRoles`.

2. **Change the guard on line 118** from:
   ```
   (userRoles.includes('admin') || userRoles.includes('owner'))
   ```
   to:
   ```
   isDeveloper
   ```
   where `isDeveloper` comes from checking `useAllUserRoles` roles for `source === 'developer'`.

3. **Also fix `src/main.tsx`** — re-save to clear the recurring duplicate attribute build error.

## Files to Edit

| File | Change |
|------|--------|
| `src/components/layout/sidebar/SidebarContent.tsx` | Import `useAllUserRoles`, replace admin/owner check with developer role check |
| `src/main.tsx` | Re-save to fix build error |

