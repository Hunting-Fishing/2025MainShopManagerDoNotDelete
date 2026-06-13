
# App-Wide UI Modernization — Cloud White SaaS

A full visual pass that re-skins the entire app around a Linear/Vercel-style "Cloud White SaaS" aesthetic, extends the bento dashboard pattern from Automotive to every module, and layers in free graphic upgrades (MagicUI effects, Framer Motion micro-interactions, Tabler icons, Undraw illustrations) plus a real light/dark toggle.

No business logic, data queries, RLS, routing, or module functionality changes — purely a presentation pass.

## What you'll get

- A crisp, modern light theme — soft off-white surfaces (`#fafbfc`), slate text, indigo `#3b82f6` accent, refined shadows and 14px radius — applied app-wide through design tokens (no per-component hex rewrites).
- A working dark mode with a toggle in the header; remembers your choice.
- A modernized app shell: sidebar, header, footer, breadcrumbs, page transitions.
- Every module dashboard restructured into the bento layout pioneered on Automotive (hero band, stat tiles with gradient icon chips, category tiles, scrollable quick-action rail).
- Polished list, detail, and form pages — consistent card styling, sticky toolbars, empty-state illustrations, skeleton loaders, smoother hovers.
- Selected MagicUI flourishes used sparingly: Border Beam on hero/CTA cards, Shimmer Button for primary CTAs, Animated List for activity feeds, Particles only on the Module Hub landing.
- Framer Motion micro-interactions: page fades, staggered card entrances, hover lift on tiles.
- Replace generic icons with Tabler / refined Lucide where it sharpens meaning. Undraw illustrations on empty states and portal landing screens.

## Plan of work (phased)

### Phase 1 — Design system foundation
- Rewrite light-mode HSL tokens in `src/index.css` to the Cloud White palette (background `#fafbfc`, surfaces `#ffffff` + `#e8ecf1` borders, slate text, primary `#3b82f6`, muted-foreground slate-500).
- Tune dark-mode tokens to match (deep slate background, indigo-400 primary, slate-800 surfaces).
- Refresh shadows (softer, slate-tinted), set `--radius: 0.875rem`, add `--shadow-soft` and `--ring-focus`.
- Add typography tokens; keep existing Space Grotesk / Plus Jakarta Sans pairing already in `tailwind.config.ts`.

### Phase 2 — Theme toggle
- Add a `ThemeProvider` using `next-themes` (or a lightweight in-house equivalent) and a Sun/Moon toggle button in `src/components/layout/Header.tsx`.
- Persist preference in `localStorage`; respect `prefers-color-scheme` on first load.
- Verify Tailwind `darkMode: ["class"]` (already set) and audit any hardcoded `bg-white`/`text-black` usages along the shell.

### Phase 3 — App shell
- `Header.tsx`, `HeaderActions.tsx`, `AppFooter.tsx`: switch to token-driven surfaces, add subtle bottom border, command-K search affordance, theme toggle, refined avatar menu.
- `AppSidebar.tsx` + `sidebar/SidebarContent.tsx`: keep the clean white look you approved, swap active-state to indigo-50/indigo-700 ring, add small Tabler section icons, subtle hover translate.
- `Layout.tsx`: add Framer Motion `AnimatePresence` page fade wrapper (already have `AnimatedPage`; wire it in).

### Phase 4 — Reusable upgraded UI primitives
- Lift the Automotive `BentoStatCard`, `CategoryTile`, `AutomotiveHero`, `GradientOrbs` into module-agnostic versions under `src/components/module-dashboard/`:
  - `BentoStatCard`, `CategoryTile`, `ModuleHero`, `QuickActionRail`, `ActivityFeedCard`, `EmptyStateIllustration`.
- Add MagicUI components (manual install per their docs): `border-beam`, `shimmer-button`, `animated-list`, `particles`, `magic-card`. Files placed under `src/components/ui/magicui/`.
- Add a small `<Illustration name="...">` wrapper that pulls Undraw SVGs (stored locally under `src/assets/illustrations/` as inline SVG, recolored via `currentColor` to follow the theme).

### Phase 5 — Module Hub landing
- Re-skin `/module-hub` with the new hero (Particles backdrop, Shimmer CTA), bento module grid using `CategoryTile`, animated stats row.

### Phase 6 — Module dashboards
Apply the bento pattern to each module dashboard, keeping live data queries unchanged:
- Septic, Welding, Power Washing, Personal Trainer, Export Company, Game Development, Gunsmith, Fuel Delivery, Fleet, Equipment.
- Each gets: `ModuleHero` with live KPI pills, 4-card bento stat grid, category tiles for sub-pages, activity feed using `AnimatedList`.

### Phase 7 — List / detail / form pass
- Standardize page chrome: sticky page header with breadcrumbs + primary action, consistent `Card` surfaces, refined `Table` row hover, refined `Input`/`Select`/`Button` focus rings.
- Add `Skeleton` loading and `EmptyStateIllustration` to all data-driven lists.
- Page-level Framer Motion fade-in.

### Phase 8 — Customer portals
- Apply Cloud White tokens, refreshed `CustomerPortalLayout` header/footer, hero illustration, dark mode support.

### Phase 9 — QA pass
- Walk the major routes at desktop + mobile viewports, light + dark, verify contrast, fix any leftover hardcoded color classes flagged by ripgrep (`bg-white|text-black|bg-slate-9` etc. inside components).

## Technical notes

- New deps: `next-themes` (theme toggle), `@tabler/icons-react` (icon vocabulary). MagicUI components are copy-pasted source (no npm dep). Framer Motion is already in the project.
- All color decisions live in `src/index.css` tokens + `tailwind.config.ts` — components reference semantic classes (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-primary`), never raw hex.
- Bento primitives in `src/components/module-dashboard/` are pure presentation; they accept props for icon, gradient, value, onClick — no data fetching.
- MagicUI installs follow https://magicui.design/docs manual install (component files dropped into `src/components/ui/magicui/`).
- Undraw illustrations stored as local SVG components so they recolor with the theme.
- No DB migrations, no edge functions, no auth/RLS changes.
- Code-splitting and existing `React.lazy` route boundaries are preserved.

## Out of scope

- Adding/removing features or pages
- Changing data models, queries, or RLS
- Reworking auth flows
- Rewriting business logic in any module

## File impact (high level)

- Edited: `src/index.css`, `tailwind.config.ts`, `src/components/layout/*`, `src/components/layout/sidebar/*`, `src/pages/ModuleHub.tsx`, every `src/pages/<module>/<Module>Dashboard.tsx`, `src/components/customer-portal/CustomerPortalLayout.tsx`, shared `src/components/ui/*` (button/card/table/input visual tweaks).
- Created: `src/components/theme/ThemeProvider.tsx`, `src/components/theme/ThemeToggle.tsx`, `src/components/module-dashboard/{BentoStatCard,CategoryTile,ModuleHero,QuickActionRail,ActivityFeedCard,EmptyStateIllustration}.tsx`, `src/components/ui/magicui/{border-beam,shimmer-button,animated-list,particles,magic-card}.tsx`, `src/assets/illustrations/*.svg`.

Approve to start with Phase 1–3 (foundation, theme toggle, shell) so you see the new look immediately, then proceed phase-by-phase.
