

## Plan: Add Bulk Purchase Quantity (Number of Bags/Units)

### The problem

Currently "Bulk Price" = $12 and "Bulk Quantity" = 50kg assumes you're buying **one** 50kg bag. But in reality you might buy **20 bags** of 50kg each. The calculator needs a **qty of bulk units** field so the total investment and total product are multiplied accordingly.

### Changes

**Single file**: `src/components/export/products/ExportProductForm.tsx`

**1. Add `bulk_qty_units` field to `ProductFormData`** — represents how many bulk bags/containers you're purchasing (default "1").

**2. Update the Bulk Purchase Breakdown UI** — restructure the inputs to a 3-column layout:

| Bulk Price (per bag) | Qty of Bags | Purchase Currency |
| Bulk Quantity (per bag) | Bulk Unit | |

- New field: **"Qty of Bags"** with info tooltip: "How many bulk bags/containers you're purchasing at the unit price above."
- Show a computed summary line: **"Total: 20 × 50kg = 1,000kg | Total Cost: 20 × $12 = $240 CAD"**

**3. Update `calcScenario`** — accept `bulkUnitsQty` parameter. Multiply `bulkBase` and `bulkPrice` by this quantity:
```
totalBulkBase = bulkBase × bulkUnitsQty
totalBulkCost = bulkPrice × bulkUnitsQty
```
Then use `totalBulkBase` for yield and `totalBulkCost` for cost/profit calculations.

**4. Update `getEmptyForm`** — add `bulk_qty_units: '1'` default.

This keeps cost-per-unit the same regardless of qty (since both numerator and denominator scale), but correctly shows total yield, total revenue, total gross profit, and total ROI for the full purchase order.

