

# Organize Exercise Library by Equipment + Sort by Muscle Group

## What Changes

Update `PersonalTrainerExercises.tsx` to:

1. **Add an Equipment filter** — Extract unique equipment values from loaded exercises, add a new `Select` dropdown alongside existing filters. Since equipment strings are freeform (e.g. "Barbell, Flat Bench", "Cable Machine"), we'll extract distinct primary equipment types: Barbell, Dumbbells, Cable Machine, Bodyweight, Machines, Pull-Up Bar, etc.

2. **Add a "Group By" toggle** — A new select with options: "None", "Equipment", "Muscle Group". When grouping is active, exercises render in collapsible sections with headers (e.g. "🏋️ Barbell (12)" or "Chest (8)"), replacing the flat grid.

3. **Add Sort By dropdown** — Options: Name A-Z, Name Z-A, Muscle Group, Equipment, Difficulty. Replaces the current default alphabetical-only ordering.

## Implementation Details

### File: `src/pages/personal-trainer/PersonalTrainerExercises.tsx`

**New state:**
- `filterEquipment` — select from extracted equipment list
- `groupBy` — 'none' | 'equipment' | 'muscle_group'  
- `sortBy` — 'name-asc' | 'name-desc' | 'muscle_group' | 'equipment' | 'difficulty'

**Equipment extraction:** Derive unique equipment values from `exercises` using `useMemo`. Normalize by taking the first item before any comma (e.g. "Barbell, Flat Bench" → "Barbell") to create clean filter options, but also keep exact-match filtering.

**Filter bar updates:** Add Equipment select and Sort By select to the existing filter row. Add Group By select.

**Grouped rendering:** When `groupBy` is set, group the filtered array into a `Record<string, Exercise[]>`, then render each group as a section with a heading and the existing card grid underneath.

### No other files need changes.

