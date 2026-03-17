

## Plan: Replace Packaging Type Input with Select + Add in ProductVariantsManager

The **main product form** (`ExportProductForm.tsx`) already has a Select dropdown with an inline "Add" button for packaging type. The **ProductVariantsManager** (used for variant creation/editing) still uses a plain text `Input`. This plan brings parity.

### Changes — `src/components/export/products/ProductVariantsManager.tsx`

1. **Import** `useExportPackagingTypes` hook and add a `Dialog` for inline creation (same pattern as the main form).

2. **Replace the plain `Input`** at line 178-181 with a `Select` dropdown populated from `useExportPackagingTypes()`, plus a `+` button to add a new type inline via a small dialog/prompt.

3. **Add inline "Add Type" dialog** — a simple `Dialog` with a text input and submit button. On submit, calls `addType(name)` from the hook, then sets the form's `packaging_type` to the new value.

The implementation mirrors exactly what's already in `ExportProductForm.tsx` (lines 846-863 + the add dialog), just applied to the variant form.

