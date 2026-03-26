

# Fix Inspection Tab — Schema Mismatch & Missing Templates

## Problems Found

1. **`customer_id` error**: The `septic_inspections` table has no `customer_id` column. The insert payload on line 74 of `SepticOrderInspectionTab.tsx` includes `customer_id: customerId`, which Supabase rejects.
2. **No templates showing**: All 3 inspection templates in the database are set to `is_published: false`. The dropdown only queries for published templates, so it finds none and hides the selector entirely.

## Fixes

### 1. Remove `customer_id` from insert payload
**File:** `src/components/septic/orders/SepticOrderInspectionTab.tsx`
- Remove `customer_id: customerId` from the `createInspection` mutation payload (line 74)
- The service order already links to the customer via `septic_service_orders`, so the relationship is preserved

### 2. Show all templates (not just published)
**File:** `src/components/septic/orders/SepticOrderInspectionTab.tsx`
- Change the templates query to fetch all templates (remove `.eq('is_published', true)` filter), or fetch both published and draft templates with a label distinction
- This ensures the existing templates appear in the dropdown immediately

### 3. Optionally: publish the existing templates via data update
- Update the 3 existing templates to `is_published: true` so they appear even with the current filter

## Files to Modify

| File | Change |
|---|---|
| `src/components/septic/orders/SepticOrderInspectionTab.tsx` | Remove `customer_id` from insert; show all templates in selector |

