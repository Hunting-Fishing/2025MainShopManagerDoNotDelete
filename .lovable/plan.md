

# Upgrade Edit Client Profile to Tabbed Layout with Structured Selectors

## Problem
The "Edit Client Profile" dialog is a single flat form with plain textareas for Goals, Health Conditions, and Injuries. It doesn't match the tabbed client detail view or the structured selectors used elsewhere in the app (intake form, medical profile, nutrition profile, fitness interests).

## What Changes

### 1. Replace the flat dialog with a tabbed dialog
Expand the dialog to `max-w-3xl` and add tabs mirroring the client detail view:

- **Profile** — Personal info fields (name, email, phone, DOB, sex, height, fitness level, status, emergency contact, preferred workout days, membership type). Keep these as inputs/selects — they are correct as-is.
- **Medical** — Embed `ClientMedicalProfile` component directly (same as the Medical tab in the detail view). This gives the full "+ Add Condition" searchable catalog with ICD-10 search, severity, restrictions, and dietary implications.
- **Interests** — Embed `FitnessInterestIntake` component with `embedded` prop (same as the Interests tab). This gives the full 7-step fitness interest intake.
- **Nutrition** — Embed `NutritionProfile` component (same as the Nutrition page). This gives the full dietary styles, allergies, intolerances MultiSelectDialogs, budget/cooking levels, meals/snacks, hydration, and digestive notes.

### 2. Remove duplicated fields from the Profile tab
Remove Goals, Health Conditions, and Injuries textareas from the Profile tab since they are now handled by the dedicated Medical and Interests tabs with their proper structured selectors.

### 3. Keep the save flow for Profile tab only
The Medical, Interests, and Nutrition tabs already have their own save mechanisms built into their respective components. Only the Profile tab needs the `updateClient.mutate()` save button.

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx` | Replace the flat edit dialog with a tabbed dialog containing 4 tabs: Profile (existing input fields minus Goals/Conditions/Injuries), Medical (ClientMedicalProfile), Interests (FitnessInterestIntake), Nutrition (NutritionProfile). Replace inline `NutritionCard` with the full `NutritionProfile` component on the main Nutrition tab too. |

