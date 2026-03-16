
Goal: make category selection reliable, simplify what users see first (main categories only), and provide a professional 3-level flow: Main Category → Category → Subcategory.

1) Confirmed issue from current implementation
- The picker closes when an item is clicked, but selected state is not consistently applied.
- Current selection depends on `cmdk` text value normalization + name lookup map; this is fragile.
- UX is also mixing “main grouping” and “actual categories,” which makes the list feel too long.

2) Selection reliability fix (first priority)
- Refactor `ExportCategoryPicker` selection to be ID-driven (not name-string driven):
  - `onSelect={() => handleCategorySelect(cat)}` per item
  - remove name-based `catByName` mapping
  - store and compare by `category_id` only
- Keep search filtering via `CommandInput`, but do not use command return value for identity.
- Add explicit required validation in product save flow so category must be selected (`category_id` required).

3) Professional hierarchy refinement (main list first)
- Update picker layout to 3 fields:
  - Main Category (top-level)
  - Category (filtered by selected main)
  - Subcategory (filtered by selected category; inline add remains)
- Use `group_name` as Main Category source (with strict display order), so users first see only top-level buckets.
- Category dropdown/search should only show categories under the selected main category.

4) Data cleanup and ordering
- Add migration to normalize/clean `group_name` assignments and set deterministic `display_order` for top-level + category order.
- Ensure seeded categories map cleanly into a professional main list (e.g., Food, Electronics, Vehicles, Industrial, Consumer Goods, Raw Materials, Other).
- Update category creation UI to include/select a Main Category so new categories don’t fall into “Other” unintentionally.

5) Form consistency updates
- Remove implicit default `category: 'salt'` in empty form to avoid hidden mismatches.
- Ensure edit mode backfills:
  - if legacy product has `category` slug but missing `category_id`, resolve category_id on load.
- Keep subcategory reset behavior when category changes.

6) QA/acceptance checks
- Open Add Product → choose Main Category → search/select Category → verify selected label persists.
- Verify Subcategory appears correctly and inline add auto-selects new subcategory.
- Save product and confirm persisted `category_id` + `subcategory_id`.
- Re-open product in edit mode and confirm all 3 selectors hydrate correctly.
- Validate mobile/desktop layout (stacked on small screens, multi-column on desktop).
