# Fix: App stuck on "Loading your workspace"

## Root cause

The "Loading your workspace…" screen comes from `src/components/auth/ShopGuard.tsx`, which depends on `src/hooks/useShopId.ts`. That hook:

1. Calls `supabase.auth.getUser()` itself (a second, parallel auth call to the one already running in `AuthContext`).
2. Then queries `profiles` with an `.or(id.eq.<uid>,user_id.eq.<uid>)` filter.
3. Has **no timeout** — if either call hangs (network blip, RLS denial that never resolves, slow profile lookup), `loading` stays `true` forever and the user is locked on the spinner.

`AuthContext` already has an 8s safety timeout, but `useShopId` runs independently after auth resolves and can hang indefinitely on its own.

## Plan

### 1. Refactor `src/hooks/useShopId.ts`
- Read `userId` from `useAuthUser()` (AuthContext singleton) instead of calling `supabase.auth.getUser()` again — removes one redundant network round-trip and an entire failure mode.
- Wait for auth to finish (`isLoading` from context) before querying.
- Wrap the profile query in a `Promise.race` with a **6-second timeout** that resolves with `shopId = null` and an error message instead of hanging forever.
- Keep the existing `.or(id.eq.X,user_id.eq.X).maybeSingle()` shape so multi-staff profile resolution still works.

### 2. Improve `src/components/auth/ShopGuard.tsx` UX
- When the timeout fires (loading finishes with an `error`), show the existing error card with a "Retry" button (calls a `refetch` returned from `useShopId`) in addition to "Return to Login", so users aren't forced to sign out for a transient failure.
- Add a `refetch` function to `useShopId` to support the retry button.

### 3. No other files change
- `AuthContext`, `ProtectedRoute`, routing, and RLS are untouched. This is purely a hook resilience fix.

## Technical details

```ts
// useShopId.ts (shape)
const { userId, isLoading: authLoading } = useAuthUser();
useEffect(() => {
  if (authLoading) return;
  if (!userId) { setShopId(null); setLoading(false); return; }

  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new Error('Profile lookup timed out')), 6000)
  );
  const query = supabase.from('profiles')
    .select('shop_id')
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .maybeSingle();

  Promise.race([query, timeout])
    .then(({ data }) => setShopId(data?.shop_id ?? null))
    .catch(err => { setError(err); setShopId(null); })
    .finally(() => setLoading(false));
}, [userId, authLoading, refetchTick]);
```

## Verification
- Reload `/module-hub` while authenticated → spinner resolves within 6s worst case.
- Throttle network in DevTools → after 6s, error card with Retry appears instead of indefinite spinner.
- Unauthenticated → still redirects to `/login` via `ProtectedRoute`.

## Out of scope
- Changes to RLS, AuthContext, routing, or UI design.
- The earlier lazy-loading / chunking work remains in place.
