# Fix slow initial load — defer module code

## Problem

Landing page (`/`) feels slow because `src/App.tsx` **statically** imports 7 heavy module Layout components at the top of the file:

- `FuelDeliveryLayout`, `WaterDeliveryLayout`, `PersonalTrainerLayout`, `GameDevLayout`, `SepticLayout`, `ExportLayout`, `WeldingSettingsProvider`

Each is a barrel re-export that pulls in dozens of components, hooks, and context providers. Even though the *pages* are `React.lazy(...)`, the **Layouts are not**, so Vite eagerly bundles every module's UI tree into the initial JS shipped to visitors who only want the landing page.

Two other factors amplify this:

1. `vite.config.ts` has `optimizeDeps.force: true` — forces Vite to re-prebundle every dep on each dev start, slowing the preview.
2. The `manualChunks` rule `if (id.includes('/src/pages/')) return 'app-pages'` lumps **all** page modules into one giant chunk, so loading one lazy page pulls all of them.

## Fix

### 1. Lazy-load module Layouts in `src/App.tsx`
Convert all 7 static imports to `React.lazy`, and wrap each `<*Layout>` JSX usage in `<Suspense fallback={<PageLoader />}>`. Pattern already used for pages — extend to layouts.

```ts
const FuelDeliveryLayout   = lazy(() => import('@/components/fuel-delivery').then(m => ({ default: m.FuelDeliveryLayout })));
const WaterDeliveryLayout  = lazy(() => import('@/components/water-delivery').then(m => ({ default: m.WaterDeliveryLayout })));
const PersonalTrainerLayout= lazy(() => import('@/components/personal-trainer').then(m => ({ default: m.PersonalTrainerLayout })));
const GameDevLayout        = lazy(() => import('@/components/game-development').then(m => ({ default: m.GameDevLayout })));
const SepticLayout         = lazy(() => import('@/components/septic').then(m => ({ default: m.SepticLayout })));
const ExportLayout         = lazy(() => import('@/components/export').then(m => ({ default: m.ExportLayout })));
const WeldingSettingsProvider = lazy(() => import('@/contexts/WeldingSettingsContext').then(m => ({ default: m.WeldingSettingsProvider })));
```

### 2. Split module chunks in `vite.config.ts`
Replace the catch-all `app-pages` rule with per-module chunks so visiting one module doesn't download all of them:

```ts
if (id.includes('/src/pages/septic/')           || id.includes('/src/components/septic/'))           return 'app-septic';
if (id.includes('/src/pages/export/')           || id.includes('/src/components/export/'))           return 'app-export';
if (id.includes('/src/pages/personal-trainer/') || id.includes('/src/components/personal-trainer/') || id.includes('/src/components/nutrition/')) return 'app-personal-trainer';
if (id.includes('/src/pages/welding/')          || id.includes('/src/components/welding/'))          return 'app-welding';
if (id.includes('/src/pages/game-development/') || id.includes('/src/components/game-development/')) return 'app-game-dev';
if (id.includes('/src/pages/fuel-delivery/')    || id.includes('/src/components/fuel-delivery/'))    return 'app-fuel';
if (id.includes('/src/pages/water-delivery/')   || id.includes('/src/components/water-delivery/'))   return 'app-water';
if (id.includes('/src/pages/automotive/')       || id.includes('/src/components/automotive/'))       return 'app-automotive';
if (id.includes('/src/pages/gunsmith/')         || id.includes('/src/components/gunsmith/'))         return 'app-gunsmith';
if (id.includes('/src/components/landing/'))                                                          return 'app-landing';
// Remove the broad 'app-pages' bucket.
```

### 3. Remove `optimizeDeps.force: true`
This is the default `false` — forcing prebundle on every start hurts cold preview load.

## Out of scope

- No changes to auth/routing logic, RLS, business logic, or UI.
- No design changes.
- Existing chunk-error boundary and `PageLoader` reused as-is.

## Verification

After the build:
1. Open `/` in a fresh tab → only landing + vendor chunks should hit the network (no `app-septic`, `app-export`, etc.).
2. Navigate to a module → only that module's chunk loads.
3. Confirm no TDZ / "Cannot access before init" regressions (recharts/d3 rule preserved).
