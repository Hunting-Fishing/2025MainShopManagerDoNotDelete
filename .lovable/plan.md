

## Plan: Multi-Size Package Breakdown with Profit & ROI Analysis

### What it does

Upgrades the Bulk Purchase Breakdown calculator to support **multiple selling package sizes simultaneously**, so you can compare profitability across different configurations from the same bulk purchase.

**Example**: You buy 50kg of salt for $12 CAD. You want to see:
- 454g bags @ $4 each → 110 bags, $0.109 cost/bag, $440 revenue, $428 profit
- 1kg bags @ $8 each → 50 bags, $0.24 cost/bag, $400 revenue, $388 profit
- 227g bags @ $2.50 each → 220 bags, $0.054 cost/bag, $550 revenue, $538 profit

Each scenario shows yield, cost per unit, revenue, gross profit, margin %, and ROI %.

### Implementation

**1. Add a `PackageScenario` system inside `BulkBreakdownCalculator`**

Add local state for an array of package scenarios:
```typescript
interface PackageScenario {
  id: string;
  weight: string;       // e.g. "454"
  unit: string;         // e.g. "g"
  sellingPrice: string;  // e.g. "4.00"
  currency: string;     // e.g. "USD"
}
```

The first scenario auto-populates from the Basic tab values (weight_per_unit, unit_of_measure, unit_price, sale_currency). Users can add more scenarios with a "+ Add Package Size" button.

**2. For each scenario, calculate and display:**
- **Yield** (bags/units from the bulk)
- **Product Used** (how much of the 50kg is consumed)
- **Cost per Unit** (bulk price ÷ yield)
- **Total Revenue** (yield × selling price)
- **Gross Profit** (revenue − bulk cost)
- **Margin %** ((profit / revenue) × 100)
- **ROI %** ((profit / bulk cost) × 100)

**3. Comparison table layout**

Render scenarios as cards or a compact table so they can be visually compared side-by-side. Highlight the most profitable scenario. Each row has a delete button (except the primary one from Basic tab).

**4. Keep "Apply to Purchase Cost" for the selected/primary scenario.**

### Files to edit

| File | Action |
|------|--------|
| `src/components/export/products/ExportProductForm.tsx` | Refactor `BulkBreakdownCalculator` to support multiple package scenarios with comparison view |

Single file change — all logic stays in the existing calculator component with local state for scenarios.

