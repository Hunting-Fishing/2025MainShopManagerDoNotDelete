

# Add Filter Bar to Personal Trainer Clients Page

## What We're Doing

Adding a comprehensive filter/sort toolbar to the PT Clients page (`PersonalTrainerClients.tsx`). The database already has all the fields needed — gender, fitness_level, membership_status, membership_type, preferred_workout_days, trainer_id — so this is purely a UI filtering task with no schema changes.

## Changes

### 1. `src/pages/personal-trainer/PersonalTrainerClients.tsx` — Add filter bar

Add filter state variables and a horizontal filter bar below the search input with these filters:

| Filter | Type | Options |
|--------|------|---------|
| Gender | Select | All, Male, Female, Other |
| Fitness Level | Select | All, Beginner, Intermediate, Advanced |
| Status | Select | All, Active, Inactive, Frozen |
| Membership | Select | All, Standard, Premium, VIP |
| Preferred Day | Multi-select buttons (Mon-Sun) | Filters clients who train on selected day(s) |
| Trainer | Select | All, then list from `trainers` query |
| Sort By | Select | Name A-Z, Name Z-A, Newest, Oldest, Fitness Level |

Implementation details:
- Add state: `genderFilter`, `fitnessFilter`, `statusFilter`, `membershipFilter`, `dayFilter`, `trainerFilter`, `sortBy`
- Place filters in a collapsible row with a "Filters" toggle button and active-filter count badge
- Update the `filtered` variable to chain all filter predicates
- Add sort logic after filtering
- Add a "Clear Filters" button when any filter is active
- Use existing `Select` and `Button` components — no new dependencies

### 2. Files to Edit

| File | Change |
|------|--------|
| `src/pages/personal-trainer/PersonalTrainerClients.tsx` | Add filter bar, filter state, filter + sort logic |

One file change only. No database migrations needed.

