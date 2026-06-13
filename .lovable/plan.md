## Diagnosis — why the site shows a blank/loading screen for so long

Inspected `index.html`, `src/main.tsx`, `src/App.tsx`, `src/pages/Index.tsx`, `src/index.css`, and `src/assets/`. Four concrete, high-impact culprits — none require backend or routing changes:

### 1. The 2.2 MB logo is preloaded on the critical path (biggest single win)

```
-rw-r--r-- 2,204,978 bytes  src/assets/ab365-logo.png
```

It is:
- Preloaded in `index.html` line 46: `<link rel="preload" as="image" href="/images/ab365-logo.png">`
- Used as the only graphic in `<PageLoader />`, so the user stares at an empty page while a 2 MB PNG downloads on slow / mobile connections.

A logo should be ≤ 30 KB. This alone can make first paint feel "broken" on a 4G phone.

### 2. Render-blocking Google Fonts `@import` in `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter…Space+Grotesk…Plus+Jakarta+Sans…');
```

CSS `@import` is the worst possible way to load fonts — Tailwind's stylesheet cannot finish parsing (and the browser cannot start painting) until that second stylesheet is fetched and parsed. The same fonts are *also* loaded two more times: as a `<link>` in `index.html` and via `@fontsource/plus-jakarta-sans/latin.css` bundled into the main JS chunk. Triple-loaded, blocking, and overlapping.

### 3. `Cache-Control: no-cache, no-store, must-revalidate` in `index.html`

Lines 11–13:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

This tells every browser to redownload `index.html`, JS chunks via the new asset URLs, and images on every visit — destroying repeat-visit performance. Vite's hashed asset filenames already handle cache busting safely; these meta tags are actively harmful.

### 4. The landing page eagerly bundles 8 hero/category JPGs

`src/pages/Index.tsx` static-imports 8 category JPGs + a mobile bg (~575 KB total) before any below-the-fold lazy section can render. These end up in the first Index chunk that the user must download before seeing anything.

---

## Plan

### Step 1 — Compress / replace the 2.2 MB logo (must-do)

Generate a fresh, properly sized logo asset (≤ 30 KB) into `src/assets/ab365-logo.png` using `imagegen` (premium tier, transparent background, 512×512). Reuse the same file path so every existing import keeps working — no other code changes.

Also drop the `<link rel="preload" as="image" href="/images/ab365-logo.png">` line in `index.html`; the bundled import already inlines a hashed URL, and `/images/ab365-logo.png` doesn't exist at that public path anyway (it's a 404 preload, which is its own performance bug).

### Step 2 — Remove the `@import` from `src/index.css`

Delete line 1 entirely. Fonts will still load via the existing `<link rel="preload" as="style">` + `<link rel="stylesheet" media="print" onload="this.media='all'">` block in `index.html` (already non-blocking) and the bundled `@fontsource/plus-jakarta-sans`.

### Step 3 — Remove the Cache-Control meta tags from `index.html`

Delete lines 11–13. Hashed Vite assets handle cache busting; the HTML shell can use the host's default caching.

### Step 4 — Lazy-load the category images on the landing page

Convert the 8 static `import categoryX from '@/assets/...'` statements in `src/pages/Index.tsx` into `lazy` dynamic imports inside the `CategoryBanner`/grid section, OR replace them with `<img loading="lazy" decoding="async" src={…} />` once they are no longer needed at first paint. Practical approach: keep the imports but mark the `<img>` tags `loading="lazy"` and `decoding="async"` and move the `mobile-bg-home.jpg` to a CSS background only loaded at the breakpoint that uses it.

### Step 5 — Add a tiny inline boot splash to `index.html`

Add ~15 lines of inline CSS + an SVG/spinner inside `<div id="root">…</div>` so the *very first paint* (before React mounts) shows the brand name and a spinner instead of a literal blank white screen. Users will perceive load as instant.

### Out of scope (for this task)

- Server-side rendering / SSG — would help but is a much bigger change.
- Removing `@fontsource/plus-jakarta-sans` from the JS bundle — defer until fonts are confirmed working from index.html alone.
- The 2050-line `App.tsx` route table is already route-split via `lazy()` + `<Suspense>`; not the bottleneck.

## Verification after build

1. Reload the preview — first paint should show the inline splash immediately.
2. Open DevTools Network → throttle to "Fast 3G" → record load. Expect:
   - `ab365-logo.png` < 30 KB (was 2.2 MB).
   - No `fonts.googleapis.com/css2` request blocking the main thread before first paint.
   - JS chunks served with default caching headers (no `Cache-Control: no-store`).
3. Lighthouse Performance score should jump materially (FCP/LCP improvement of several seconds on throttled mobile).
4. Publish to push the fix to allbusiness365.com.
