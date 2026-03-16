

## Plan: Info Tooltips on Every Field + Packaging Type as Searchable Database List

### Two changes requested

**1. Info buttons (ℹ️) on every form field** — small icon buttons next to each label that show a tooltip/popover explaining what the field is, why it matters, and what it connects to.

**2. Packaging Type → database-driven selectable list** — replace the free-text input with a Select dropdown backed by a growing database table (`export_packaging_types`), with an inline "+" to add new types. Seeded with common types: Sealed Bag, Vacuum Sealed Bag, Cardboard Box, Wooden Crate, Plastic Drum, Glass Jar, Metal Can, Poly-Woven Sack, Shrink Wrap, Palletized, Bulk/Loose, Bottle, Pouch, Tin, Barrel.

---

### Implementation

#### A. Field Info Tooltips

Update the `F` helper component (currently just wraps Label + children) to accept an optional `info` string prop. When provided, render a small `Info` icon beside the label that shows a `Tooltip` on hover with the explanation text.

```tsx
function F({ label, info, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Label>{label}</Label>
        {info && (
          <Tooltip><TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">{info}</TooltipContent></Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}
```

Then add `info="..."` to every field across all 6 tabs with contextual explanations. Examples:
- **Product Name**: "The commercial name shown to buyers in quotes and catalogs"
- **SKU**: "Your internal stock-keeping unit code for inventory tracking"
- **Selling Price**: "The price per unit you charge buyers — used to calculate margin"
- **Weight per Unit**: "Net weight of one sellable unit in the selected measure — drives shipping cost estimates"
- **Packaging Type**: "How the product is physically packaged for export (e.g. sealed bag, crate). Affects shipping and customs"
- **HS Code**: "Harmonized System code used by customs worldwide to classify goods and determine duties"
- **Purchase Cost**: "What you pay your supplier per unit — the base of your landed cost calculation"
- **Customs Duty**: "Import tax charged by the destination country, calculated from HS code and trade agreements"
- **Min Margin Threshold**: "System warns you if a quote would drop below this profit margin percentage"
- **Phytosanitary Certificate**: "Required for plant/food products — proves the goods are pest-free per IPPC standards"
- etc. for every field

Wrap the entire form in `<TooltipProvider>` once at the top.

#### B. Packaging Types Database Table + Picker

**Migration** — create `export_packaging_types` table:
```sql
CREATE TABLE public.export_packaging_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, name)
);
ALTER TABLE public.export_packaging_types ENABLE ROW LEVEL SECURITY;
-- RLS policies for authenticated shop members
```

Seed with common types via INSERT.

**Hook** — `useExportPackagingTypes.ts`: fetch list, create new type mutation.

**UI** — Replace the Packaging Type `<Input>` on line 300 with a `<Select>` dropdown showing the shop's packaging types, plus a "+" button to add a new type inline (same pattern as category picker).

#### C. Files to create/edit

| File | Action |
|------|--------|
| `src/components/export/products/ExportProductForm.tsx` | Add `info` prop to `F`, add info text to all fields, replace packaging type input with Select, wrap in TooltipProvider |
| `src/hooks/export/useExportPackagingTypes.ts` | New hook for packaging types CRUD |
| Migration SQL | Create `export_packaging_types` table with seed data |
| `src/components/ui/tooltip.tsx` | Already exists, no changes needed |

