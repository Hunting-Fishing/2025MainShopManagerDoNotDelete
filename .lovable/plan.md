

# Speed Up App Loading — Professional Optimizations

## Current State

The app already has good foundations: lazy-loaded routes (~300+), manual chunk splitting, and code-splitting. But several areas can be significantly improved.

## Key Bottlenecks Identified

1. **Index page is statically imported** — it's the only non-lazy page, pulling in 7 category images, multiple landing components, `useAuthUser`, and keyword search logic into the initial bundle
2. **Google Fonts loaded via render-blocking `<link>`** — two font families (Inter + Space Grotesk) block first paint
3. **Duplicate cache/SW cleanup runs on every load** — the `index.html` inline script clears caches and unregisters service workers on every single page load, adding unnecessary startup work (main.tsx already handles this for preview domains)
4. **Three font systems loaded** — Plus Jakarta Sans (via npm), Inter + Space Grotesk (via Google Fonts) — likely only one or two are actually used
5. **No resource hints** — no `<link rel="preload">` for critical assets like the logo or main CSS

## Plan

### 1. Lazy-load the Index page

Change `Index` from a static import to `React.lazy()` like all other pages. This removes ~7 images + landing components + search logic from the critical initial bundle.

**File**: `src/App.tsx` — Change line 11 from static import to lazy import.

### 2. Preload Google Fonts (non-blocking)

Change the Google Fonts `<link>` from render-blocking to async loading using the `media="print" onload` pattern or `rel="preload"`.

**File**: `index.html` — Update the fonts link tag to load asynchronously.

### 3. Remove duplicate cache cleanup from index.html

The inline script (lines 49-65) that clears caches, unregisters SW, and removes localStorage items runs on **every page load** unnecessarily. `main.tsx` already handles SW/cache cleanup for preview domains. Remove this redundant script.

**File**: `index.html` — Remove the inline cache-clearing script block.

### 4. Add resource preloads for critical assets

Add `<link rel="preload">` for the company logo and critical fonts to start downloading them earlier.

**File**: `index.html` — Add preload hints.

### 5. Lazy-load below-fold landing sections

Wrap `TestimonialsSection`, `PricingSection`, and `FeatureGrid` in lazy imports within `Index.tsx` so they only load when scrolled into view (or after initial render).

**File**: `src/pages/Index.tsx` — Lazy-load heavy below-fold sections.

## Files to Modify

| File | Change |
|---|---|
| `src/App.tsx` | Lazy-load Index page |
| `index.html` | Async fonts, remove duplicate cache script, add preloads |
| `src/pages/Index.tsx` | Lazy-load below-fold sections |

## Expected Impact

- **Smaller initial JS bundle** — Index page + images no longer in critical path
- **Faster first paint** — non-blocking fonts, preloaded critical assets
- **Less startup overhead** — no redundant cache clearing on every load
- **Progressive loading** — below-fold content loads on demand

