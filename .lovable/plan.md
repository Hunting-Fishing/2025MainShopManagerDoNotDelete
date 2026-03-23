

# Fix: Empty Certification Type List + Add Custom Type

## Problem

The seed migration only inserted certification types for shops that had the septic module enabled **at migration time**. Your shop likely enabled septic after the migration ran, so `septic_certification_types` has zero rows for your shop. The dropdown is empty.

## Fix

### 1. Migration: Re-seed certification types for shops missing them

A new migration that inserts the 12 default cert types for any shop that has septic enabled but has zero cert types. Uses `ON CONFLICT DO NOTHING` to be safe.

### 2. UI: Add "+ Add Custom Type" option in the certification dropdown

In `SepticEmployeeDetail.tsx`, add a special option at the bottom of the Select dropdown: **"+ Add New Type..."**. When selected, it opens a small inline dialog to create a new `septic_certification_types` record (name, category, requires_renewal, validity months). After saving, the dropdown refreshes and auto-selects the new type.

This lets managers add certifications not in the pre-populated list (e.g., state-specific licenses, company-specific training).

## Files

| File | Action |
|---|---|
| Migration SQL | Re-seed default cert types for shops missing them |
| `src/pages/septic/SepticEmployeeDetail.tsx` | Add "+ Add New Type" option in cert type dropdown with inline create dialog |

