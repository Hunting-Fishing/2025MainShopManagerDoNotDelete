## Problem

The published site (allbusiness365.com) and preview show a white screen. The console reports:

```
Uncaught ReferenceError: Cannot access 'P' before initialization
  at vendor-charts-D16U26QP.js:9
```

This is a temporal dead zone (TDZ) error inside the `vendor-charts` bundle, which crashes the app at module init — before React can render — producing a blank page.

## Root cause

`vite.config.ts` uses a `manualChunks` function that splits `recharts` and `d3-*` packages into a `vendor-charts` chunk:

```ts
if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
```

Recharts depends on many `d3-*` sub-packages with internal circular imports. When Rollup forces them all into one chunk together with recharts, the hoisted `const` bindings end up referenced before their initializer runs — producing the "Cannot access 'P' before initialization" TDZ crash in production. This is a well-known Rollup/Vite issue with recharts + manual chunking.

It does not happen in dev because Vite serves ES modules unbundled.

## Fix

Remove the manual chunking rule that forces recharts + d3 into a single chunk and let Rollup handle them with its default chunking (which respects circular-import order). Specifically:

1. In `vite.config.ts`, remove the line:
   ```ts
   if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
   ```
   so recharts and d3 fall through to default chunking (or the `vendor-other` catch-all on a per-package basis won't trigger because we'll also let them be naturally split).

2. As an extra safety measure, also remove the `vendor-other` catch-all `return 'vendor-other'` at the bottom of the function so each remaining `node_modules` package gets its own chunk by default. This prevents future TDZ regressions from other circular-dep libraries.

3. Keep all other intentional chunking (radix, supabase, mapbox, etc.) untouched — those packages don't have the circular-import problem.

No other files need to change. After redeploy the bundle will load cleanly and the white screen will be resolved.

## Verification

After the edit:
- Build runs (harness auto-builds).
- Reload the preview — app should render instead of white screen.
- Console should no longer show the `Cannot access 'P' before initialization` error.
- Then user clicks Publish to push the fix to allbusiness365.com.

## Note on the other console error

The `chrome-extension://...settings.js` SyntaxError is from a browser extension, not the app — unrelated and ignored.
