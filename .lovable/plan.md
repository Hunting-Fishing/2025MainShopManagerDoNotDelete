

# Fix: Recurring White Pages After Edits

## Root Cause

Every time a code change is made, Vite rebuilds and generates new chunk filenames. The browser may still reference old chunk URLs from the previous build. When `React.lazy()` tries to load those old chunks, the import silently fails or hangs, leaving the `Suspense` fallback (a small spinner) stuck indefinitely — appearing as a "white page."

The current error listeners in `main.tsx` only handle `ChunkLoadError` for global errors, but lazy-loaded route failures inside React's `Suspense` boundary don't always propagate to the global `window.onerror` — they get swallowed by the Suspense/ErrorBoundary system, which then shows nothing useful.

## Fix

### 1. Wrap `Suspense` with a dedicated `ErrorBoundary` in `App.tsx`

Add a React ErrorBoundary **inside** the Suspense wrapper that catches chunk load failures and auto-reloads once (using sessionStorage guard), or shows a "Reload" button.

**File**: `src/App.tsx`
- Wrap `<Suspense fallback={<PageLoader />}>` with an `ErrorBoundary` that detects chunk load errors
- On chunk error: auto-reload once (same sessionStorage guard pattern)
- On second failure: show a card with "Reload Page" button instead of white screen

### 2. Improve `PageLoader` fallback visibility

**File**: `src/App.tsx`
- Add the company logo and "Loading..." text to the `PageLoader` so it's clearly branded, not just a bare spinner
- Add a 10-second timeout that shows a "Taking too long? Click to reload" link

### 3. Remove dead `showBootFallback` code from `main.tsx`

**File**: `src/main.tsx`
- The `showBootFallback` function references `#boot-fallback` which no longer exists in `index.html`
- Remove the dead function and its reference in `tryChunkRecoveryReload` — the chunk error listeners can just call `window.location.reload()` directly

## Files to Modify

| File | Change |
|---|---|
| `src/App.tsx` | Add ErrorBoundary around Suspense with chunk-error recovery + improve PageLoader |
| `src/main.tsx` | Remove dead `showBootFallback` function, simplify chunk recovery |

## Result

- Chunk load failures from lazy routes will be caught and auto-recovered
- Users see branded loading state instead of white screen
- Dead code removed from main.tsx

