

## Problem

The `useExportPackagingTypes` hook calls `.from('profiles').select('shop_id').single()` **without filtering by the current user**. Since the RLS policy on `profiles` returns all profiles in the same shop, `.single()` throws an error when multiple profiles exist — causing the fetch to silently fail and show "No types yet."

The same bug exists in the `addType` function within the same hook.

## Fix — `src/hooks/export/useExportPackagingTypes.ts`

1. **Get the current user** via `supabase.auth.getUser()` before querying profiles.
2. **Filter the profiles query** with `.eq('user_id', user.id)` (matching the pattern used across the codebase, e.g., power-washing hooks).
3. Apply this fix in both `fetchTypes` (line 18-21) and `addType` (line 47-50).

### Updated fetch logic (both locations):
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const { data: profile } = await supabase
  .from('profiles')
  .select('shop_id')
  .eq('user_id', user.id)
  .single();
```

This is the only file that needs to change.

