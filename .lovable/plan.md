

## Plan: Enhanced Category Picker with Subcategories and Search

### Problem
The category dropdown is a flat list of 20+ items (and growing with custom categories). No subcategory support and no way to search/filter.

### Solution
Replace the flat `Select` with a **Combobox-style category picker** that has:
1. **Search field** — type-ahead filtering of categories
2. **Grouped display** — categories shown in logical groups (Food & Agriculture, Industrial, Consumer Goods, etc.)
3. **Subcategory support** — after selecting a category, a second dropdown appears for subcategory selection
4. **Clean UX** — uses Popover + Command (cmdk) pattern already available in shadcn

### Visual Flow

```text
┌─ Category ──────────────────┐  ┌─ Subcategory ─────────────┐
│ 🔍 Search categories...     │  │ Select subcategory...      │
│ ─── Food & Agriculture ──── │  │ ● Fine Grade               │
│   Salt                      │  │ ● Coarse Grade              │
│   Grains & Cereals          │  │ ● Industrial                │
│   Seafood                   │  │ ● Iodized                   │
│   Coffee & Cocoa            │  └────────────────────────────┘
│   Agricultural Products     │
│ ─── Industrial ──────────── │
│   Minerals & Ores           │
│   Chemicals                 │
│   Machinery & Equipment     │
│ ─── Consumer ────────────── │
│   ...                       │
└─────────────────────────────┘
```

### Implementation

**1. New DB table: `export_product_subcategories`** (migration)
- `id`, `shop_id`, `category_id` (FK to export_product_categories), `name`, `slug`, `description`, `display_order`, `is_system`, `is_active`
- RLS matching categories pattern
- Seed common subcategories for the top categories (Salt: Fine/Coarse/Industrial/Iodized; Vehicles: Sedan/SUV/Truck/Heavy; Seafood: Frozen/Dried/Canned; etc.)
- Add `subcategory_id` column to `export_products` table
- Add `group_name` column to `export_product_categories` for visual grouping (Food & Agriculture, Industrial, Consumer Goods, Raw Materials, Other)

**2. New hook: `useExportProductSubcategories.ts`**
- Query subcategories filtered by `category_id`
- Create/delete mutations

**3. New component: `ExportCategoryPicker.tsx`**
- Uses Popover + Command (cmdk) for searchable category selection
- Groups categories by `group_name`
- Shows selected category as a badge/chip
- When a category is selected, conditionally shows a subcategory Select if subcategories exist for that category

**4. Edit: `ExportProductForm.tsx`**
- Replace the flat `Select` at lines 261-282 with the new `ExportCategoryPicker` component
- Add `subcategory_id` to `ProductFormData`, `getEmptyForm`, `formToInsert`, and `productToForm`

**5. Edit: `ExportCategoryManager.tsx`**
- Add ability to manage subcategories within each category (expandable rows showing subcategories with add/delete)

### Files

| File | Action |
|------|--------|
| New migration SQL | Create `export_product_subcategories` table, seed data, add `subcategory_id` and `group_name` columns |
| `src/hooks/export/useExportProductSubcategories.ts` | Create — query/create/delete subcategories |
| `src/hooks/export/useExportProductCategories.ts` | Minor update — include `group_name` in type |
| `src/components/export/products/ExportCategoryPicker.tsx` | Create — searchable grouped combobox + subcategory selector |
| `src/components/export/products/ExportProductForm.tsx` | Edit — swap Select for new picker, add subcategory_id field |
| `src/components/export/products/ExportCategoryManager.tsx` | Edit — add subcategory management UI |
| `src/integrations/supabase/types.ts` | Update with new table types |

