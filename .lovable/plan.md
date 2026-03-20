

# Selectable Height & Weight Units with Scroll Pickers

## Problem
Height and weight fields are plain number inputs labeled "(cm)" and "(kg)" with no unit choice. Users may prefer feet/inches or pounds.

## Approach

### Height Field
- Add a unit toggle: **cm** or **ft/in**
- Replace the number input with a `Select` dropdown:
  - **cm mode**: options from 90cm to 245cm (step 1)
  - **ft/in mode**: options from 3'0" to 8'0" (step 1 inch) — display as "5'10"" etc.
- Store in DB as `height_cm` always — convert ft/in to cm on save, convert back for display

### Weight Field
- Add a unit toggle: **kg** or **lbs**
- Replace the number input with a `Select` dropdown:
  - **kg mode**: options from 14kg to 318kg (step 1)
  - **lbs mode**: options from 30lbs to 700lbs (step 1)
- Store in DB as `weight_kg` always — convert lbs to kg on save, convert back for display

### Unit Toggle UI
- Small segmented button pair (e.g. `cm | ft`) next to the label, using existing `Button` with `variant="outline"/"default"` pattern
- Persist unit preference in `localStorage` so it remembers across sessions

### Conversion Constants
- 1 inch = 2.54 cm
- 1 lb = 0.453592 kg

## Files to Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientIntakeForm.tsx` | Replace height/weight inputs with unit toggle + Select dropdowns, convert on save |
| `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx` | Same changes in the Edit Client dialog, and display height/weight with user's preferred unit |

No database changes — values continue to be stored as `height_cm` and `weight_kg`.

