
Issue restated: the app appears as a white screen across routes after recent upgrades. I checked runtime behavior and code: in a clean browser session the app loads `/` and redirects `/index` → `/login` via auth flow, so this is likely a route/auth bootstrap failure in the preview session (not a total compile break).

## What I found
- `App.tsx` has a public route for `/`, but no explicit route for `/index`.
- Current user preview route is `/index`, which falls into the protected `/*` branch.
- `AuthGate`/`ProtectedRoute` rely on `useAuthUser` and show minimal skeletons while loading; if auth/session init stalls, this can look like a blank page.
- Client network context shows `text/x-vite-ping` 404 to `https://...:/`, which is consistent with preview/HMR instability and can leave the UI in a bad state.
- No hard compile/runtime fatal error reproduced in clean session.

## Repair plan (implementation)
1. **Normalize startup routes in `App.tsx`**
   - Add explicit public redirects:
     - `/index` → `/`
     - `/index.html` → `/`
   - Place these before protected catch-all routes so preview route variants never drop into auth-gated blank states.

2. **Add auth bootstrap fail-safe in `useAuthUser.ts`**
   - Add a hard timeout for initial session load (e.g., 6–8s).
   - If timeout hits, set `isLoading=false`, set a recoverable auth error state, and allow UI to render with a “go to login / retry auth” path.
   - Wrap `fetchUserRoles` and initial session fetch in timeout-safe Promise wrappers so auth cannot stay pending forever.

3. **Make `AuthGate` and `ProtectedRoute` resilient**
   - Replace low-visibility skeleton-only loading with a full-screen loader card + explicit messaging.
   - Add visible recovery actions on auth stalls/errors:
     - “Retry auth”
     - “Go to login”
     - “Go home”
   - Ensure unauthenticated navigation is deterministic and never silently hangs.

4. **Improve startup error visibility (prevent white-screen ambiguity)**
   - In global error handling (`GlobalErrorBoundary` + optional top-level bootstrap guard), ensure any render failure shows a visible fallback screen with retry/home actions.
   - Keep console diagnostics but avoid silent fail paths.

5. **Stabilize preview behavior validation**
   - Verify in this exact order:
     - Direct open `/index` (should redirect/render, never blank)
     - Open `/` (landing should render)
     - Open protected route while logged out (should go to `/login`)
     - Log in and open protected routes (should render or show explicit error UI, not white)

## Files to update
- `src/App.tsx`
- `src/hooks/useAuthUser.ts`
- `src/components/AuthGate.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/error/GlobalErrorBoundary.tsx` (and optionally `src/main.tsx` for bootstrap-level fallback)

## Technical notes
- No database schema changes are needed.
- This fix targets route normalization + auth init deadlock handling, which are the most likely causes of route-wide white screens in preview sessions.
- If preview HMR instability persists after this, we’ll add a one-time auto-recovery reload guard for disconnected dev sessions.
