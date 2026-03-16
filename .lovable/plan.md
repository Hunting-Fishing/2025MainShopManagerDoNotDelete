

## Plan: Link Unit of Measure to Weight per Unit

### What changes

**Layout restructure** (lines 272-292 of `ExportProductForm.tsx`):
- Move "Unit of Measure" next to "Weight per Unit" on the same row (3-column grid: Selling Price | Weight per Unit | Unit of Measure)
- The Weight per Unit placeholder dynamically reflects the selected unit (e.g., "e.g. 25" when kg is selected)
- The Weight per Unit label updates to show the unit: "Weight per Unit (kg)", "Weight per Unit (g)", etc.
- Packaging Type moves to pair with something else or gets its own row

**Expanded unit options** — add these to the Select:
- Gram (g)
- Kilogram (kg)
- Pound (lb)
- Ounce (oz)
- Metric Ton (ton)
- Millilitre (ml)
- Litre (L)
- Gallon (gal)
- Bag
- Pallet
- Container
- Unit
- Piece (pc)
- Box
- Barrel (bbl)

**Dynamic label mapping** — a simple lookup object:
```typescript
const UNIT_LABELS: Record<string, string> = {
  g: 'Grams', kg: 'Kilograms', lb: 'Pounds', oz: 'Ounces',
  ton: 'Metric Tons', ml: 'Millilitres', L: 'Litres', gal: 'Gallons',
  bag: 'Bags', pallet: 'Pallets', container: 'Containers',
  unit: 'Units', pc: 'Pieces', box: 'Boxes', bbl: 'Barrels'
};
```

The Weight per Unit label becomes: `Weight per Unit (${UNIT_LABELS[form.unit_of_measure] || form.unit_of_measure})`

### Files to edit
- `src/components/export/products/ExportProductForm.tsx` — restructure the row layout and expand the Select options

