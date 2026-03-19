

# Build Production Exercise Library with Seed Data

## What We're Doing

The Exercise Library page exists with full CRUD UI, but the database is empty. We need to seed it with a comprehensive set of real exercises via a Supabase migration, and add a "Seed Default Exercises" button for shops that don't have exercises yet.

## Approach

Since exercises are **shop-scoped** (`shop_id` required), we can't use a one-time migration to insert global data. Instead, we'll add a **"Load Default Exercises"** feature that inserts ~80 production-ready exercises into the current shop's `pt_exercises` table on demand.

### 1. Create `src/data/defaultExercises.ts` — Exercise seed data

A constant array of ~80 exercises covering all muscle groups and categories with real instructions, common mistakes, equipment, and difficulty levels. Organized by muscle group:

| Muscle Group | Exercises (examples) |
|---|---|
| Chest | Barbell Bench Press, Incline Dumbbell Press, Cable Flyes, Push-Ups, Dips |
| Back | Deadlift, Barbell Row, Pull-Ups, Lat Pulldown, Seated Cable Row, T-Bar Row |
| Shoulders | Overhead Press, Lateral Raises, Face Pulls, Arnold Press, Front Raises |
| Biceps | Barbell Curl, Hammer Curl, Incline Dumbbell Curl, Preacher Curl |
| Triceps | Tricep Pushdown, Skull Crushers, Close-Grip Bench, Overhead Extension |
| Legs | Barbell Squat, Romanian Deadlift, Leg Press, Lunges, Leg Curl, Leg Extension, Calf Raises |
| Glutes | Hip Thrust, Bulgarian Split Squat, Glute Bridge, Cable Kickback |
| Core | Plank, Hanging Leg Raise, Cable Crunch, Ab Wheel, Russian Twist, Dead Bug |
| Full Body | Clean & Press, Burpees, Turkish Get-Up, Kettlebell Swing |
| Cardio | Rowing Machine, Jump Rope, Battle Ropes, Assault Bike |
| Mobility | Foam Rolling, Hip Flexor Stretch, Cat-Cow, Band Pull-Aparts |

Each exercise includes: `name`, `category`, `muscle_group`, `equipment`, `difficulty`, `description`, `instructions` (step-by-step), `common_mistakes`, and `alternatives`.

### 2. Update `src/pages/personal-trainer/PersonalTrainerExercises.tsx`

- Add a **"Load Default Exercises"** button visible when `exercises.length === 0`
- On click, bulk-insert all default exercises from the data file with the current `shop_id`
- Also add edit and delete capabilities for existing exercises (currently missing)
- Add a count summary in the header

### Files to Create/Edit

| File | Change |
|------|--------|
| `src/data/defaultExercises.ts` | **New** — ~80 real exercises with full metadata |
| `src/pages/personal-trainer/PersonalTrainerExercises.tsx` | Add seed button, edit/delete actions |

