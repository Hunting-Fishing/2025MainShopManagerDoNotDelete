

## Plan: Bulk Purchase Breakdown Calculator + Multi-Currency

### What it does

Adds a **Bulk Purchase Breakdown** section to the Costs tab that lets users enter:
- **Bulk purchase amount** (e.g. $12 CAD for 50kg)
- **Bulk purchase currency** (CAD, USD, EUR, etc.)
- **Bulk quantity + unit** (e.g. 50 kg)
- **Selling unit weight** (e.g. 454g per bag) — auto-populated from the Basic tab's weight_per_unit + unit_of_measure
- **Selling price per unit** + **selling currency** (e.g. $4 USD per bag)

It then **auto-calculates and displays**:
- **Yield**: how many sellable units from the bulk (e.g. 50,000g ÷ 454g = ~110 bags)
- **Cost per bag**: bulk cost ÷ yield (e.g. $12 ÷ 110 = $0.109/bag)
- **Revenue**: yield × selling price (e.g. 110 × $4 = $440)
- **Speculative gross profit**: revenue − bulk cost
- **Margin %**: profit ÷ revenue

This also **auto-populates** `purchase_cost_per_unit` from the calculated cost-per-bag so the existing MarginPreview stays accurate.

### Currency expansion

Add these currencies to both purchase and sale selectors:
- CAD, USD, EUR, GBP, HTG (existing)
- JPY, CNY, AUD, CHF, MXN, BRL, INR, XOF, XAF, DOP, JMD, TTD, BBD, KYD, BSD

Add a new `sale_currency` field to the form so purchase and sale can use different currencies.

### Implementation details

**Form state additions** (in `ProductFormData`):
```
bulk_purchase_price: string
bulk_purchase_currency: string
bulk_quantity: string
bulk_quantity_unit: string
sale_currency: string
```

**New component**: `BulkBreakdownCalculator` — a self-contained card inside the Costs tab that:
1. Takes bulk inputs and the selling unit info from the Basic tab
2. Performs unit conversion (kg→g, lb→oz, etc.) to normalize bulk and selling units
3. Renders a results panel with yield, cost/unit, revenue, profit, margin
4. Has a "Apply to Purchase Cost" button that writes the calculated per-unit cost into `purchase_cost_per_unit`

**Unit conversion map** for the calculator:
```typescript
const TO_GRAMS: Record<string, number> = { g: 1, kg: 1000, lb: 453.592, oz: 28.3495, ton: 1000000 };
const TO_ML: Record<string, number> = { ml: 1, L: 1000, gal: 3785.41 };
```

**Currency list** — shared constant `CURRENCIES` array used by all currency selects (purchase, sale, and existing cost currency).

### Files to edit/create

| File | Action |
|------|--------|
| `src/components/export/products/ExportProductForm.tsx` | Add form fields, BulkBreakdownCalculator component, expand currency options, add sale_currency select |

No database changes needed — bulk breakdown is a client-side calculator. The `sale_currency` can be stored alongside existing product data if the column exists, or kept as UI-only for now.

