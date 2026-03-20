

# Upgrade Client Intake Form to Use Structured Selectors

## Problem
The intake form uses plain text `<Textarea>` fields for Goals, Injuries, Health Conditions, and Food Habits — but the rest of the application already has rich structured selection systems for all of these (fitness goals from `pt_fitness_goals`, medical condition catalog with ICD-10 search, `MultiSelectDialog` for allergies/dietary styles/intolerances, badge-toggle selectors for exercise restrictions). The form should reuse these existing patterns.

## Changes

### 1. Goals — Use `pt_fitness_goals` database selector
Replace the Goals textarea with a multi-select grid that loads from `pt_fitness_goals` (same data used in `FitnessInterestIntake.tsx` step 3). Render as toggleable buttons/badges. Uses existing `useFitnessGoals()` hook.

### 2. Injuries / Limitations — Use exercise restriction badge toggles
Replace the Injuries textarea with the same badge-toggle pattern from `ClientMedicalProfile.tsx` using `ALL_EXERCISE_RESTRICTIONS`. Store as a string array. Add a free-text "Other injuries" input below for anything not covered.

### 3. Health Conditions — Use medical condition catalog search
Replace the Health Conditions textarea with a searchable picker from `pt_medical_condition_catalog` (same catalog used in `ClientMedicalProfile.tsx`). Show selected conditions as dismissible badges. Keep the note about detailed conditions being editable post-creation.

### 4. Food Habits — Use `MultiSelectDialog` for dietary styles + allergies
Replace the Food Habits textarea with:
- **Dietary Style** — `MultiSelectDialog` with `INITIAL_DIETARY_STYLES` categories (from `NutritionProfile.tsx`)
- **Allergies** — `MultiSelectDialog` with `INITIAL_ALLERGY_OPTIONS` categories
- **Intolerances** — `MultiSelectDialog` with `INITIAL_INTOLERANCE_OPTIONS` categories

Store each as arrays. Map to `food_habits` as a JSON string or keep separate fields if columns exist.

### 5. Supplement Notes — Keep as textarea (free-form is appropriate here)

### 6. Update form state & submit payload
- `goals` → `string[]` of goal names
- `injuries` → `string[]` of restriction tags + optional free text
- `health_conditions` → `string[]` of condition names from catalog
- `food_habits` → store dietary styles, allergies, intolerances as structured data
- Map all to existing DB columns (serialize arrays where needed)

## Files to Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientIntakeForm.tsx` | Replace 4 textareas with structured selectors: fitness goals grid, restriction badge toggles, medical catalog search, and MultiSelectDialogs for dietary/allergy/intolerance |

