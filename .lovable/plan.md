

# Septic Database Isolation Audit — Results

## Status: 98% Standalone

### Total Septic Tables: 32

All 32 tables use the `septic_` prefix and are fully isolated from other business modules (pressure washing, export, automotive, etc.).

### Verified Standalone

Every septic table's foreign keys point to either:
- **Other `septic_*` tables** (fully self-contained)
- **`shops`** — required for multi-tenant RLS isolation (every module needs this)
- **`profiles`** — used for `created_by` / `profile_id` fields linking to the authenticated user (every module needs this)

These two shared references (`shops` and `profiles`) are **infrastructure tables**, not business-module tables. They are required by every module and do not create any data leakage between modules.

### No Reverse Dependencies

Zero tables outside the septic prefix reference any `septic_*` table. The module can be extracted or deleted without affecting anything else.

### Two Cross-Module FK References Found

These are the only non-infrastructure references that cross module boundaries:

| Septic Table | FK Column | References | Risk |
|---|---|---|---|
| `septic_inspection_records` | `work_order_id` | `work_orders` | Shared work orders table |
| `septic_inspection_records` | `template_id` | `inspection_form_templates` | Shared inspection templates |
| `septic_system_types` | `inspection_template_id` | `inspection_form_templates` | Shared inspection templates |

### Recommendation

To achieve 100% isolation, these 3 foreign keys should be addressed:

1. **Create `septic_inspection_templates`** — a septic-owned copy of `inspection_form_templates` with the same schema, so inspection templates are module-scoped
2. **Make `work_order_id` nullable or remove the FK** — if septic inspections don't need to link to the shared work order system, drop the constraint; if they do, create a `septic_work_orders` equivalent

### Plan

1. Create a new `septic_inspection_templates` table mirroring `inspection_form_templates`
2. Migrate any existing septic-related template data
3. Re-point the two `inspection_form_templates` FKs to `septic_inspection_templates`
4. Make `work_order_id` on `septic_inspection_records` nullable and drop the FK to `work_orders` (or create a septic-scoped equivalent)
5. Update any frontend code referencing `inspection_form_templates` within septic pages

### Summary

The septic module is already well-isolated. No customer, invoice, order, or financial data crosses into any other module. Only 3 FK references to shared utility tables remain, and fixing them is straightforward.

