## Goal
Bring the Automotive Dashboard up to a modern, premium product-app standard: stronger visual hierarchy, better color, layered depth, motion, and richer icon/illustration treatment — without changing any data, queries, or routes.

Aesthetic direction (chosen defaults, since you skipped the questions):
- Palette: **Charcoal & Ember** on a light surface — slate/zinc neutrals with an Ember (#e85d3a) + Indigo (#4f46e5) accent pair. Reads "performance garage," not generic SaaS.
- Type: **Space Grotesk** (display/headings) + **DM Sans** (body). Loaded via the existing Google Fonts pipeline in `index.html`.
- Motion: Framer Motion stagger on stat reveal, hover lift + sheen on category tiles, subtle gradient orbs in the hero.

## Scope (locked)
- `src/pages/automotive/AutomotiveDashboard.tsx` — restructure layout.
- `src/components/module-dashboard/*` — extend (NOT break) primitives used here so other modules don't regress. Add optional `variant="premium"` props where needed; default behavior stays identical for septic/welding/etc.
- New file: `src/components/automotive/dashboard/*` — hero banner, bento stat cards, premium category tile, gradient orbs background.
- Add 1 generated hero illustration (compressed JPG, lazy-loaded) to `src/assets/automotive-hero.jpg` for the hero band.
- No DB, no hook, no route, no business-logic changes.

Out of scope: the left sidebar in your screenshot (that's the shared `AppSidebar`), sub-pages (Quotes/Invoices/Diagnostics/etc.), and the other modules' dashboards. We can do those in follow-up passes.

## Layout plan

```text
┌──────────────────────────────────────────────────────────────┐
│  HERO BAND (gradient + orb mesh + car silhouette art)        │
│  ─ Module crest (Car icon in gradient chip)                  │
│  ─ "Automotive Repair" H1 (Space Grotesk, 40/48)             │
│  ─ Live status pills: Today · Open Jobs · Revenue MTD        │
│  ─ Primary CTAs: New Work Order (ember), New Quote (ghost)   │
└──────────────────────────────────────────────────────────────┘
┌─ Alerts row (only if any) ───────────────────────────────────┐
│  Animated alert chips with severity color + icon             │
└──────────────────────────────────────────────────────────────┘
┌─ BENTO STATS (4 cols desktop / 2 mobile) ────────────────────┐
│ ┌──Big──┐ ┌─sm─┐ ┌─sm─┐ ┌─sm─┐                                │
│ │Revenue│ │Pend│ │InPr│ │Done│   gradient borders, sparkline │
│ │ MTD   │ └────┘ └────┘ └────┘   on Revenue, ring on counts  │
│ └───────┘ ┌─sm─┐ ┌─sm─┐ ┌─sm─┐                                │
│           │Appt│ │Parts│ │Overd│                              │
│           └────┘ └────┘ └────┘                                │
└──────────────────────────────────────────────────────────────┘
┌─ QUICK ACTIONS (horizontal pill rail) ───────────────────────┐
│  Scrollable on mobile, hover sheen on desktop                │
└──────────────────────────────────────────────────────────────┘
┌─ CATEGORY BENTO ─────────────────────────────────────────────┐
│  6-col responsive grid, premium tile:                        │
│  - colored gradient icon chip (not flat bg)                  │
│  - hover: tile lift + accent border + arrow slide            │
│  - description always visible (md+), truncated on mobile     │
└──────────────────────────────────────────────────────────────┘
┌─ RECENT WORK ORDERS ─────┐ ┌─ UPCOMING APPOINTMENTS ────────┐
│  card list, status badge │ │  timeline-style list with date │
│  vehicle thumbnail glyph │ │  chips, customer + vehicle     │
└──────────────────────────┘ └────────────────────────────────┘
```

## Visual upgrade specifics
- Stat cards: replace flat colored tile with `bg-card` + 1px gradient border (`from-ember/40 to-indigo/40`) + soft glow shadow. Icon sits in a 40px gradient chip. Numbers use Space Grotesk 32/36 tabular-nums. Revenue card spans 2 cols and includes a tiny inline sparkline (CSS gradient bar, no chart lib needed).
- Category tiles: gradient icon chip (`bg-gradient-to-br from-<color>-500 to-<color>-600`), subtle ring on hover, ChevronRight slides in on hover, premium shadow.
- Hero band: `bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900` with two soft blurred orbs (ember + indigo) + an absolutely-positioned car silhouette illustration on the right (≤ 60 KB, lazy-loaded).
- Iconography: keep lucide-react throughout (already imported), but wrap every primary icon in a gradient chip component for consistency.
- Motion: import existing `framer-motion` if present; otherwise CSS-only stagger via `animation-delay` so we don't add deps.

## Files to touch (technical)
1. `src/pages/automotive/AutomotiveDashboard.tsx` — replace JSX with new composition; keep all hooks/queries identical.
2. `src/components/automotive/dashboard/AutomotiveHero.tsx` — NEW.
3. `src/components/automotive/dashboard/BentoStatCard.tsx` — NEW.
4. `src/components/automotive/dashboard/CategoryTile.tsx` — NEW.
5. `src/components/automotive/dashboard/GradientOrbs.tsx` — NEW (decorative).
6. `src/assets/automotive-hero.jpg` — NEW (generated, ≤ 60 KB, `loading="lazy"`).
7. `src/index.css` — add 2-3 utility classes (`.shadow-glow`, `.bento-border`) if not already present.

## Asset packs / icon strategy
- Lucide-react covers all current icons; no extra icon pack needed.
- For the hero illustration we'll generate a single optimized JPG via the image gen pipeline — cheaper and lighter than a Figma UI-kit import, and avoids licensing/redistribution concerns. If you later want a Figma kit (e.g. "Untitled UI" or "Shadcn Dashboard Kit"), tell me which one and I'll port specific tokens.

## Verification
- `/automotive` renders on desktop (1440), tablet (768), and mobile (375) without overflow.
- Screenshot the new hero + bento + categories at each breakpoint.
- Confirm no regressions on `/septic`, `/welding`, `/power-washing` dashboards (they share `module-dashboard` primitives — only additive props introduced).
- Network: hero image < 60 KB, no new third-party fonts, no new JS deps.

## Out of scope (parking lot)
- Sub-pages (Quotes / Invoices / Vehicle History / Diagnostics / Recalls / Labor Rates).
- Sidebar / `AppSidebar` redesign.
- Dark mode tuning beyond what existing tokens already provide.
- Other modules' dashboards (Septic, Welding, etc.) — same treatment can be templated in a follow-up.

Approve and I'll build it.