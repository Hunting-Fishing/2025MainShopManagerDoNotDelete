

# Fix Shield Tooltip, Auto-Load Safe Exercises from Local Library & Risk-Level Color Coding

## Problems Identified

1. **Shield icon has no tooltip** — the edit button uses a Shield icon with no title/hover text, so users don't know what it does.
2. **Safe exercises don't pre-load** — the recommendations section waits for the user to click a body part or search. It should auto-load exercises from the shop's own `pt_exercises` table based on the client's conditions.
3. **No risk-level color coding** — exercises aren't visually differentiated by how safe they are for the client's specific restrictions.

## Plan

### 1. Add tooltip to Shield icon button

Add `title="Edit condition details"` to the Shield button on each condition card. Simple one-liner.

### 2. Auto-load safe exercises from local `pt_exercises` library

Currently `SafeExerciseRecommendations` only uses the external ExerciseDB API and requires manual interaction. Change it to:

- Accept `shopId` as a new prop
- On mount, query `pt_exercises` from Supabase filtered to the shop
- Cross-reference each exercise's `muscle_group` against the client's avoided body parts and restrictions
- Classify each exercise into a **risk tier**:
  - **Safe (green)** — targets only safe body parts, no restriction conflicts
  - **Caution (yellow)** — targets a secondary muscle that's near a restricted area, or involves equipment that may be problematic
  - **Warning (orange)** — partially conflicts with a restriction (e.g., exercise involves "back" when client has spinal loading restriction)
  - **Avoid (red)** — directly targets a restricted body part or violates a named restriction (e.g., `no_heavy_deadlifts` and the exercise is "Deadlift")
- Auto-display the **Safe** and **Caution** exercises on load — no click required
- Keep the ExerciseDB search as a secondary "Explore more" option below

### 3. Risk-tier color coding on exercise cards

- Green left border + green shield icon for Safe
- Yellow left border + yellow caution icon for Caution  
- Orange left border + orange warning for Warning
- Red left border + red X for Avoid (shown collapsed/dimmed with "Not recommended" label)

### 4. Restriction-to-exercise name matching

Add a mapping of specific restriction keywords to exercise name patterns so exercises are flagged accurately:

```text
no_heavy_deadlifts  → matches exercises containing "deadlift"
no_heavy_squats     → matches "squat", "leg press"
no_overhead         → matches "overhead", "military press", "shoulder press"
no_spinal_loading   → matches "deadlift", "squat", "good morning", "back extension"
no_bench_press      → matches "bench press"
no_pull_ups         → matches "pull up", "pullup", "chin up"
no_plyometrics      → matches "jump", "box jump", "plyometric"
no_running          → matches "run", "sprint", "jog"
```

### Files to Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientMedicalProfile.tsx` | Add `title` to Shield button, pass `shopId` to SafeExerciseRecommendations |
| `src/components/personal-trainer/SafeExerciseRecommendations.tsx` | Add local exercise query, risk classification engine, auto-load on mount, color-coded cards, keep ExerciseDB as secondary search |

