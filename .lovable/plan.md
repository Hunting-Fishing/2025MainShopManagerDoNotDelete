

# Fix Module Card Name Truncation on Landing Page

## Problem
Module names like "Welding & Fabrication", "Personal Trainer", "Power Washing" get cut off because the card title uses `line-clamp-1`, and the grid packs 3-5 columns making cards very narrow.

## Changes

### 1. Update `src/components/landing/ModuleCard.tsx`
- Change `line-clamp-1` to `line-clamp-2` on the h3 title so longer names wrap to a second line instead of being cut off
- Add `min-h-[2rem] md:min-h-[3.5rem]` to the title to keep card heights consistent even when names are short

### 2. Update grid in `src/pages/Index.tsx`
- Change from `grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` to `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` — on the smallest screens, 2 columns gives each card more room for the name

## Result
All module names will be fully visible. Cards will have consistent heights. Mobile users see 2 columns (more readable), while desktop still shows up to 5.

