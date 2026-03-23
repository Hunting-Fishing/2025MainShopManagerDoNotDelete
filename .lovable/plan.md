
Issue rephrased: your app shows a white screen on both preview and published, even after cache clear, with no visible error.

Short answer: this is likely **client-side startup failure/performance pressure**, not a Supabase/database memory issue.

What I found:
- In a clean runtime session, `/` renders correctly (so not a universal code crash).
- Current bootstrap protections exist (`/index` redirects, auth timeout, error boundaries, cache/SW cleanup).
- Runtime profile shows heavy startup cost on landing: many script loads and slow first paint, which can fail silently on constrained mobile devices.
- Do I know what the issue is? **Yes, likely a fragile frontend bootstrap on your device (load pressure + silent startup failure), not backend memory/storage.**

Implementation plan to repair this robustly:

1) Add explicit startup-failure UI (no more silent white screen)
- In `src/main.tsx`, add a bootstrap watchdog (e.g., 6–8s) that shows a visible fallback card if React doesn’t mount.
- Catch global `error`/`unhandledrejection` at bootstrap and render a minimal recovery screen (Reload / Safe Mode / Login).

2) Reduce initial boot workload for public routes
- Move heavy authenticated-only providers out of global boot path:
  - Keep minimal providers for `/` and public routes.
  - Mount `CompanyProvider`, auth-heavy data hooks, and other expensive providers only inside authenticated route trees.
- This prevents unauth/public page startup from paying full app cost.

3) Make landing page lighter on low-memory devices
- In `src/pages/Index.tsx`, lazy-load non-critical sections (testimonials/pricing/module grids) below the fold.
- Defer large background/media assets until after first content render.
- Keep hero/header interactive first; progressively hydrate the rest.

4) Harden chunk/script loading
- Keep route-level lazy loading, but add a chunk-load recovery path (retry once on `ChunkLoadError`, then show fallback UI).
- In `vite.config.ts`, refine chunking so landing/public path excludes unnecessary heavy deps from initial graph.

5) Add a “Safe Mode” fallback
- Query flag like `?safe=1` (or auto-trigger after bootstrap timeout):
  - disable heavy visuals/animations
  - render lightweight static landing shell
- Gives users a guaranteed non-white recovery path on weak devices.

6) Validation checklist (must pass before publish)
- Test on the affected mobile device for both:
  - Preview URL
  - Published domain
- Verify logged-out and logged-in flows.
- Confirm: no white screen, visible fallback on forced failure, first paint improves materially.

Technical details:
- This is frontend runtime stability/perf, not septic database schema/data.
- Likely failure modes: script/chunk load timeout, mobile tab resource pressure, or early mount failure before app UI appears.
- Existing cache/SW cleanup is helpful but not sufficient if startup remains too heavy/fragile.
