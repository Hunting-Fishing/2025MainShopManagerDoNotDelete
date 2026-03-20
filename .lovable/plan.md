

# Auto Body Fat Estimation & Supplement Selector for Intake Form

## Changes

### 1. Auto-Estimate Body Fat % from Height + Weight

Replace the manual Body Fat % input with an auto-estimated value using the U.S. Navy / BMI-derived formula:

```text
BMI = weight_kg / (height_m²)
Adult Body Fat % ≈ (1.20 × BMI) + (0.23 × age) − (10.8 × sex) − 5.4
  where sex = 1 for male, 0 for female
```

- When height, weight, gender, or date of birth changes, recalculate and pre-fill the body fat field
- Show it as a read-only estimated value with an "Override" toggle that lets the user type a manual value
- Label: "Body Fat % (est.)" with a small info tooltip explaining the formula is an estimate

**File**: `ClientIntakeForm.tsx` — add a `useEffect`/`useMemo` that watches `height_cm`, `weight_kg`, `gender`, and `date_of_birth` to compute estimated body fat. Update the body fat input to show the estimate but allow manual override.

### 2. Supplement Selector on Nutrition Tab

Replace the plain "Supplement Notes" textarea with a supplement picker that queries the existing `pt_supplements` table, plus keeps a free-text notes area.

- Add a searchable multi-select component (similar to the existing `MultiSelectDialog` pattern) that fetches supplements from `pt_supplements`
- Group by category: Vitamins, Minerals, Amino Acids, Proteins, Herbs, etc.
- Selected supplements show as badges below the selector
- Keep a smaller textarea underneath for additional free-text notes
- On submit, store selected supplement names as a JSON array in a new form field (`selected_supplements`), and keep `supplement_notes` for free text

**File**: `ClientIntakeForm.tsx`
- Add state for `selectedSupplements: string[]`
- Query `pt_supplements` for the categorized list
- Replace line 522's simple textarea with a `MultiSelectDialog` for supplements + a smaller notes textarea below it
- On submit, include `selected_supplements` in the payload

## Files to Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientIntakeForm.tsx` | Add body fat auto-estimation logic + supplement multi-select picker |

No database changes needed — body fat estimate is a client-side calculation, and supplement selection uses existing `pt_supplements` table data.

