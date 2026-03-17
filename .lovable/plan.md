

## Plan: Rename "bags" terminology to generic "units/items"

Rename all "bag" references in the Bulk Purchase Breakdown Calculator to generic terms since bulk purchases aren't always bags.

### Changes in `src/components/export/products/ExportProductForm.tsx`:

1. **"Qty of Bags"** → **"Qty of Items"**
2. **"Weight per Bag"** → **"Weight per Unit"**
3. **"Price per Bag"** → **"Price per Unit"**
4. **"Cost per Bag"** → **"Cost per Unit"** (in scenario results)
5. Update any related tooltips/labels (e.g., "How many bulk bags/containers" → "How many bulk items/containers")
6. Update the summary line text if it references "bags"

Single file edit — pure label/text changes, no logic changes.

