

# Fix: Inspection Forms Should Use Template Styles & Save to Customer Record

## Problem

When a user selects an inspection template in the service order's Inspection tab, `SepticInspectionFormCard` renders a **generic form** (condition dropdowns, text areas) — it completely ignores the template structure. The actual styled form (`SepticInspectionFormTemplate`) with purple headers, colored rows, pass/fail/GYR buttons, signature pad, and score tracking is only used in Settings preview and the standalone `/septic/inspection-form/:templateId` page.

Additionally, completed inspections are not saved/copied to the customer's record for historical reference.

## Solution

### 1. Replace generic form with real template renderer when `template_id` is present

**File: `SepticInspectionFormCard.tsx`** — Major rewrite

- When the inspection has a `template_id`, fetch the template sections and items (same query pattern used in `InspectionFormPreview.tsx`)
- Render `SepticInspectionFormTemplate` with `interactive={true}` instead of the generic condition dropdowns
- Keep the generic card as fallback for blank inspections (no template)
- Wire `onValuesChange` to persist `inspection_data` JSONB field on the `septic_inspections` record
- Wire `onHeaderChange` to persist header values (location, date, inspector name, signature)

### 2. Add "Complete & Save to Customer" action

**File: `SepticInspectionFormCard.tsx`**

- Add a "Complete Inspection" button that:
  - Sets `departed_at` timestamp on the inspection
  - Marks overall status based on form responses
  - Saves a snapshot of the completed inspection data (already in `inspection_data` JSONB)
- The inspection is already linked to the service order which links to the customer, so no additional copy table is needed — just ensure the data is fully persisted and the inspection is marked complete

**File: `SepticOrderInspectionTab.tsx`**

- Show a "Completed" badge on inspections that have `departed_at` set
- Prevent editing on completed inspections (`interactive={false}`)

### 3. Load saved form values on re-open

When expanding a previously saved inspection that has `inspection_data`, initialize the `SepticInspectionFormTemplate` values from that stored JSONB so work is preserved across sessions.

## Files to Modify

| File | Change |
|---|---|
| `src/components/septic/orders/SepticInspectionFormCard.tsx` | Fetch template sections when `template_id` exists; render `SepticInspectionFormTemplate` with interactive mode; auto-save values to `inspection_data`; add Complete button |
| `src/components/septic/orders/SepticOrderInspectionTab.tsx` | Show completed badge; disable editing on completed inspections |

## How It Works

```text
User selects template → Creates inspection record with template_id
                       → Expands card
                       → Fetches template sections/items
                       → Renders SepticInspectionFormTemplate (purple headers, colored rows, pass/fail)
                       → Changes auto-save to inspection_data JSONB
                       → "Complete Inspection" locks it and sets departed_at
```

