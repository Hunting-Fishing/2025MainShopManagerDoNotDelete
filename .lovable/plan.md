

# Fix NutritionProfile Crash + Convert Add Client Form to Tabs

## Bug Fix: NutritionProfile Hooks Order

The `NutritionProfile` component has a `useQuery` call (line 116) placed **after** an early `return` (line 113). React requires all hooks to be called in the same order every render. This crashes both the main Nutrition tab and the Edit dialog's Nutrition tab.

**Fix**: Move the `useQuery` for `medicalDietaryImplications` above the early return on line 113, alongside the other hooks at the top of the component.

## Add Client Form: Convert to Tabs

The `ClientIntakeForm` is currently one long scrollable form with 6 sections. Convert it to a tabbed layout matching the Edit Client dialog:

- **Profile** — Personal Info + Membership & Training (name, email, phone, DOB, sex, height, weight, body fat, fitness level, membership type, join date, trainer, workout days)
- **Medical** — Goals badge grid, Injuries/Restrictions badge toggles, Health Conditions searchable catalog
- **Nutrition** — Calorie/macro/hydration targets, Dietary Styles MultiSelectDialog, Allergies MultiSelectDialog, Intolerances MultiSelectDialog, Supplement Notes, Meal Guidance
- **Details** — Emergency Contact + Additional Notes + Submit button

Each tab contains the existing form fields, just reorganized. No logic changes — only layout restructuring with `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`.

## Files to Edit

| File | Change |
|------|--------|
| `src/components/nutrition/NutritionProfile.tsx` | Move `useQuery` for medical dietary implications above the early return to fix hooks ordering crash |
| `src/components/personal-trainer/ClientIntakeForm.tsx` | Wrap existing 6 sections into 4 tabs (Profile, Medical, Nutrition, Details) using `Tabs` component |

