

# Make Module Hub Cards Much Smaller

## Problem
The module cards on `/module-hub` are large — each takes ~200px height with big icons, full descriptions, and full-width buttons. The grid is only 3 columns, so 9 modules requires significant scrolling.

## Changes

### 1. `src/components/module-hub/ModuleCard.tsx` — Compact layout
- Reduce padding from `p-6` to `p-3`
- Shrink icon from `w-14 h-14` to `w-9 h-9`, icon inner from `w-7 h-7` to `w-4 h-4`
- Reduce title from `text-lg` to `text-sm`
- Hide description entirely (or show as single-line `text-xs`)
- Replace full-width "Enter Module" button with a small `size="sm"` button
- Reduce badge size
- Shrink gradient accent bar from `h-1` to `h-0.5`
- Make icon and text sit on same row (horizontal layout) instead of stacked

### 2. `src/pages/ModuleHub.tsx` — More columns
- Change grid from `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` with `gap-3` instead of `gap-6`

## Files to Edit

| File | Change |
|------|--------|
| `src/components/module-hub/ModuleCard.tsx` | Compact horizontal card layout |
| `src/pages/ModuleHub.tsx` | Denser grid (4 cols, smaller gaps) |

