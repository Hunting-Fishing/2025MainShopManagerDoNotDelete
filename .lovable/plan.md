

# Fix: Boot Fallback Appearing on Every Page Load

## Root Cause

In `src/main.tsx`, the global `error` and `unhandledrejection` event listeners (lines 107-131) call `showBootFallback()` for **any** error — not just chunk load failures. Any minor runtime error (e.g., a failed network request, a non-critical warning) triggers the recovery screen, making it appear as the app's landing page.

The 8-second watchdog timer in `index.html` is the correct safety net for genuine boot failures. The aggressive catch-all in `main.tsx` is redundant and harmful.

## Fix

### `src/main.tsx` — Remove catch-all fallback triggers

- **Line 114**: Remove `showBootFallback(...)` from the generic `error` handler — only handle chunk load errors
- **Line 130**: Remove `showBootFallback(...)` from the generic `unhandledrejection` handler — only handle chunk load errors

The `window.addEventListener('error', ...)` block should **only** act on chunk load failures and silently ignore everything else. The 8-second watchdog in `index.html` already covers the case where React never mounts.

### Summary of change

Two lines removed. The fallback UI will now only appear if:
1. A chunk fails to load (and auto-reload already happened once)
2. React genuinely fails to mount within 8 seconds (index.html watchdog)

It will no longer hijack the page on routine JS errors.

