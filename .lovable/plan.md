

# Upgrade Workout Programs: Enhanced Creator + AI Generation + Preset Library

## What We're Building

A major upgrade to the Workout Programs feature with three pillars:

1. **Enhanced "Create Program" dialog** -- more fields, workout style categories, training platform, target muscles, and client limitation awareness
2. **AI-Generated Programs** -- a "Generate with AI" button that builds a full program based on workout style, client profile, equipment, and limitations
3. **Preset Workout Library** -- a large collection of ready-made program templates categorized by style (PPL, Upper/Lower, Full Body, CrossFit, HIIT, Bodybuilding, Powerlifting, etc.)

---

## Changes

### 1. Enhanced Create Program Dialog (`PersonalTrainerPrograms.tsx`)

Expand the current minimal form to include:

- **Workout Style** (multi-select): Push/Pull/Legs, Upper/Lower, Full Body, Bro Split, CrossFit/WOD, HIIT/Circuit, Powerlifting, Olympic Lifting, Bodybuilding, Calisthenics, Functional, Sport-Specific, Endurance, Flexibility/Mobility, Rehabilitation
- **Training Platform**: Gym, Home, Outdoor, Hotel/Travel, Minimal Equipment, Hybrid
- **Target Muscle Groups** (multi-select): Chest, Back, Shoulders, Arms, Core, Legs, Glutes, Full Body
- **Difficulty**: Expand to 5 levels (Absolute Beginner, Beginner, Intermediate, Advanced, Elite)
- **Days Per Week**: 1-7 selector
- **Session Duration**: 30/45/60/75/90 min
- **Client Limitations** (optional, for assigned programs): Injuries, mobility restrictions, equipment constraints
- **Goal**: Keep existing but expand options (Fat Loss, Muscle Gain, Strength, Endurance, Recomp, Sport Performance, Rehab, General Fitness)

### 2. AI Program Generator

Add a "Generate with AI" button in the create dialog that:

- Sends the selected workout style, platform, duration, difficulty, goals, limitations, and optionally a selected client's profile to the `pt-ai-assistant` edge function with a new `generate_program_template` action
- Returns a structured program with days and exercises that auto-populates into the builder
- Uses tool-calling to get structured JSON output (program name, days, exercises per day with sets/reps/rest/tempo)
- Saves the generated program and its days/exercises directly to the database

**Edge function update** (`pt-ai-assistant/index.ts`):
- Add new `generate_program_template` action
- Accept workout_style, platform, days_per_week, session_duration, difficulty, goals, limitations, and optional clientId
- If clientId provided, fetches full client context (injuries, fitness scores, equipment access)
- Uses structured output (tool calling) to return JSON with program structure
- Returns the structured data for the frontend to insert into DB

### 3. Preset Program Library

Add a "Browse Presets" button that opens a full-screen dialog/sheet with pre-built program templates:

- **Categories**: PPL, Upper/Lower, Full Body, Bro Split, 5x5, CrossFit, HIIT, Bodybuilding, Powerlifting, Calisthenics, Sport-Specific, Rehab/Mobility
- Each preset includes: name, description, difficulty, duration, days per week, workout style tags
- "Use Template" button that clones the preset into the shop's programs
- Presets are seeded via a migration with ~30-40 template programs across categories
- Each template includes pre-built workout days and exercise references

### 4. New Component: `ProgramCreatorDialog.tsx`

A new dedicated component replacing the inline dialog, featuring:
- Tabbed interface: **Manual** | **AI Generate** | **Browse Presets**
- Manual tab: the enhanced form from step 1
- AI tab: form fields + "Generate" button, shows preview of AI output before saving
- Presets tab: searchable/filterable grid of preset programs

### 5. Database Changes (Migration)

- Add columns to `pt_workout_programs`: `workout_style TEXT[]`, `training_platform TEXT`, `target_muscles TEXT[]`, `days_per_week INTEGER`, `session_duration_minutes INTEGER`, `limitations TEXT`, `is_preset BOOLEAN DEFAULT false`, `preset_category TEXT`
- Seed ~30-40 preset program templates with `is_preset = true` and a null `shop_id` (global presets accessible to all shops)
- RLS policy update to allow reading presets where `is_preset = true`

---

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/personal-trainer/ProgramCreatorDialog.tsx` | **Create** -- new tabbed program creator |
| `src/components/personal-trainer/PresetProgramLibrary.tsx` | **Create** -- preset browser with filters |
| `src/pages/personal-trainer/PersonalTrainerPrograms.tsx` | **Edit** -- use new ProgramCreatorDialog |
| `supabase/functions/pt-ai-assistant/index.ts` | **Edit** -- add `generate_program_template` action with structured output |
| `supabase/migrations/new_migration.sql` | **Create** -- add columns + seed preset programs |

---

## Technical Details

**AI Structured Output** (tool calling in edge function):
```text
Tool: create_workout_program
Parameters:
  - program_name: string
  - description: string  
  - days: array of { name, focus_area, exercises: [{ name, muscle_group, sets, reps, rest_seconds, tempo, notes }] }
```

The frontend receives this JSON, creates the program, then batch-inserts days and exercises (matching exercise names to the shop's `pt_exercises` library or creating new ones).

**Preset Seeding**: ~30-40 programs across 12 categories, each with 3-6 workout days. Exercises reference generic names that get matched or created when a shop "uses" a preset.

