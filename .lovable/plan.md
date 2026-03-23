

# Fix: Save Profile Button Not Working on Septic Module Profile

## Root Cause

The `shop_enabled_modules` table has **no record** for the septic module for the user's shop. The `updateDisplayInfo()` function runs `.update()` against this table filtering by `shop_id` + `module_id` — but since no row exists, it updates zero rows and returns no error. The toast never fires because the update technically "succeeds" (no SQL error), but nothing is actually saved.

Other modules (automotive, fuel delivery, water delivery, etc.) all have their `shop_enabled_modules` records — septic is missing.

## Fix

### 1. `useUpdateModuleDisplayInfo` — upsert instead of update

Change the `updateDisplayInfo` function to use **upsert** logic: first try to update, and if no row was affected, insert a new `shop_enabled_modules` record. This ensures the profile save works even when the module hasn't been formally "enabled" in the modules table.

**File: `src/hooks/useModuleDisplayInfo.ts`** (~line 99-108)

Replace the `.update()` call with an upsert approach:
- First, check if a record exists for this shop + module
- If it exists, update it
- If not, insert a new row with `shop_id`, `module_id`, and the display info fields

### 2. Ensure toast feedback is reliable

The current code in `SepticProfile.tsx` already has `toast.success('Profile updated')` — once the upsert works, this will fire correctly. No changes needed here.

### Summary

Single-file fix in `useModuleDisplayInfo.ts` — switch from `.update()` to upsert logic so the save works regardless of whether a `shop_enabled_modules` row pre-exists.

