

# Add Missing `welding_line_item_categories` Table

## Summary

The database comparison found **23 of 24 tables match** between the Climax Welding Hub and this project. The only missing table is `welding_line_item_categories` — a lookup table used by `welding_quote_materials.category` to categorize line items (Labour, Travel Cost, Glass, Hardware, etc.).

## What Will Be Created

**1 table**: `welding_line_item_categories`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| shop_id | UUID | Multi-tenant isolation |
| name | TEXT | Category name |
| icon | TEXT | Icon identifier, default 'plus' |
| sort_order | INTEGER | Display ordering |
| is_active | BOOLEAN | Soft delete |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

**RLS**: Standard `shop_id = get_current_user_shop_id()` policy.

**Trigger**: Reuses existing `update_updated_at_column()`.

## Result

After this, the welding database will be **24/24 tables complete** — a full match with the Climax Welding Hub project.

