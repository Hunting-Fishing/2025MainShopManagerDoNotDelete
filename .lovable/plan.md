
## Full Inspection Results (What is most likely causing the white/unloaded pages)

### What I confirmed from runtime + code
1. **Intermittent runtime disconnects are real**  
   - Your logs show: `"[vite] server connection lost. Polling for restart..."` and failed `text/x-vite-ping` requests.
2. **Chunk-recovery guard is currently neutralized**  
   - `__ab365_chunk_reload_once__` is used as a one-time reload guard, but it is removed on mount in **both**:
   - `src/main.tsx` (`AppWithBootReady` effect)
   - `src/App.tsx` (`App` effect)  
   This can create repeated reload behavior during transient chunk/server failures (looks like white unloading pages).
3. **Two separate chunk recovery systems are competing**
   - Global listeners in `main.tsx` + `ChunkErrorBoundary` in `App.tsx` both react to chunk failure paths.
4. **Auth backend instability is present**
   - Auth logs show refresh-token failures (`/token` 500 timeout).  
   This can block protected routes and produce long loading/error transitions.
5. **Auth listener fan-out is high**
   - `useAuthUser()` is used broadly, and each usage creates auth bootstrap/listener work. Under instability, this amplifies auth pressure.

---

## Implementation Plan (stability-first)

### 1) Fix reload-loop risk in bootstrap
- **Files:** `src/main.tsx`, `src/App.tsx`
- Keep one persisted recovery guard (timestamp + max attempts) and **do not clear it on initial mount**.
- Remove duplicate guard reset logic from both files.
- Ensure only one recovery pathway triggers reload; the other shows fallback UI only.

### 2) Unify chunk-failure handling
- **Files:** `src/main.tsx`, `src/App.tsx`
- Make `main.tsx` responsible for global chunk detection + guarded reload.
- Keep `ChunkErrorBoundary` for UI fallback, but prevent it from performing second competing reload logic.

### 3) Harden auth bootstrap under timeout conditions
- **Files:** `src/hooks/useAuthUser.ts`, `src/components/AuthGate.tsx`
- Add explicit degraded state when refresh/token calls timeout (non-blocking error state instead of indefinite loader behavior).
- Prevent repeated role-fetch/auth-recovery storms during unstable auth windows.

### 4) Convert auth to singleton source (reduce listener pressure)
- **Files:** `src/context/AuthContext.tsx` (new), `src/main.tsx`, `src/hooks/useAuthUser.ts`
- Move `onAuthStateChange + getSession` to one provider.
- Make `useAuthUser` read context only (no new listener per component).

### 5) Add startup diagnostics to eliminate “silent white”
- **Files:** `src/App.tsx` (PageLoader/boot UI), optionally `src/components/debug/*`
- Show user-visible “Startup issue detected” panel after timeout with:
  - retry button
  - safe reset action
  - current route + failure type (chunk/auth)
- This ensures users never see a blank page without explanation.

---

## Validation checklist after implementation
1. Refresh repeatedly during deploy/hash changes → no infinite reload/unload loop.
2. Simulated chunk failure → one guarded reload, then stable fallback (no white screen).
3. Auth timeout scenario → user sees actionable auth fallback, not blank loader.
4. Navigate public + protected routes after edits → pages consistently render.
5. Preview and published both verified for stable first paint.

---

## Primary files to modify
- `src/main.tsx`
- `src/App.tsx`
- `src/hooks/useAuthUser.ts`
- `src/components/AuthGate.tsx`
- `src/context/AuthContext.tsx` (new)
