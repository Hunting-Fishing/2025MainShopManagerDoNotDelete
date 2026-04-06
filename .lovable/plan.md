

# Create All Welding Database Tables from Climax Welding Hub

## Summary

I read all 37 migration files from the [Climax Welding Hub](/projects/ed71a28e-1170-46fc-93a7-b7afcfbdd17a) project. The original project uses unprefixed table names (`quotes`, `invoices`, `inventory`, etc.). Since this main project already has its own `quotes`, `invoices`, etc., we need to recreate all of them with a `welding_` prefix and adapt the RLS to use the multi-tenant `shop_id` pattern (`get_current_user_shop_id()`) instead of the standalone `has_role()` pattern.

**Current state**: 0 welding tables exist in this database.

## What Will Be Created

### Enums (6)
- `welding_quote_status` (new, reviewed, quoted, accepted, declined)
- `welding_invoice_status` (draft, sent, unpaid, partial, paid, overdue)
- `welding_ap_status` (pending, partial, paid)
- `welding_po_status` (draft, ordered, shipped, received, cancelled)
- `welding_schedule_entry_type` (day_off, vacation, install_day, on_site, shop_day, booking, measurement)
- `welding_customer_interaction_type` (email, phone_call, site_visit, quote_request, deposit, payment, follow_up, conversation, other)

### Tables (20)
| # | Table | Key Columns |
|---|---|---|
| 1 | `welding_company_settings` | shop_id, company_name, tax_rate, prefixes, numbering, business_hours (jsonb), mobile_quick_links (jsonb), travel_rate_per_km |
| 2 | `welding_customers` | shop_id, first/last name, email, phone, company, address fields, area_code, status, deposit_date, notes |
| 3 | `welding_customer_interactions` | customer_id FK, interaction_type enum, description, interaction_date |
| 4 | `welding_quotes` | shop_id, customer_id FK, customer info, project_type, description, timeline, status, estimated_amount, labour_hours, travel_cost, quote_mode, address |
| 5 | `welding_quote_materials` | quote_id FK, inventory_item_id FK (nullable), name, measurements, notes, qty, cost, sell_price, sort_order |
| 6 | `welding_quote_attachments` | quote_id FK, file_url, file_name, description |
| 7 | `welding_quote_history` | quote_id FK, changed_by, field_name, old/new values, change_type |
| 8 | `welding_invoices` | shop_id, invoice_number, customer_id FK, quote_id FK, status, subtotal, tax, total, amount_paid, due_date, notes |
| 9 | `welding_invoice_items` | invoice_id FK, description, qty, unit_price, total |
| 10 | `welding_invoice_history` | invoice_id FK, changed_by, field_name, old/new values, change_type |
| 11 | `welding_payments` | invoice_id FK, amount, payment_method, payment_date, notes |
| 12 | `welding_vendors` | shop_id, name, contact_name, email, phone, address |
| 13 | `welding_accounts_payable` | vendor_id FK, description, amount, amount_paid, status, due_date |
| 14 | `welding_inventory` | shop_id, name, category, specifications, qty, unit, min_quantity, location, cost_per_unit, sell_price |
| 15 | `welding_inventory_purchase_history` | inventory_item_id FK, purchase_date, qty, unit_price, vendor, notes |
| 16 | `welding_purchase_orders` | shop_id, po_number, vendor_id FK, status, total, order/expected dates, notes |
| 17 | `welding_purchase_order_items` | purchase_order_id FK, inventory_item_id FK, description, qty, unit_price, total |
| 18 | `welding_gallery_projects` | shop_id, title, description, category, image_url, is_featured, tags, display_order |
| 19 | `welding_contact_messages` | shop_id, name, email, subject, message, is_read |
| 20 | `welding_schedule_entries` | shop_id, user_id, entry_date, entry_type, title, notes, customer_id, quote_id |
| 21 | `welding_sales_activities` | shop_id, user_id, activity_type, customer info, notes, follow_up_date, status, quote_id |
| 22 | `welding_labour_rates` | shop_id, name, rate, is_default, is_active, sort_order |
| 23 | `welding_quick_links` | shop_id, title, url, description, icon, sort_order |

### Functions (3)
- `generate_welding_invoice_number(shop_uuid)` — reads settings, increments counter, builds formatted number
- `generate_welding_quote_number(shop_uuid)` — same pattern for quotes
- `generate_welding_po_number(shop_uuid)` — same pattern for POs

### Storage
- `welding-photos` bucket (public read, authenticated upload)

### RLS Pattern
All tables use the project's standard multi-tenant isolation:
```sql
USING (shop_id = public.get_current_user_shop_id())
WITH CHECK (shop_id = public.get_current_user_shop_id())
```
Child tables (quote_materials, invoice_items, etc.) use JOINs to their parent's shop_id.

## Approach
- Single database migration file containing all enums, tables, RLS policies, functions, indexes, triggers, storage bucket, and a seed row for default company settings
- All adapted from the original 37 migrations, consolidated and prefixed with `welding_`
- No code file changes needed -- the existing welding page shells already reference these table names

## Technical Details
- The original project's `has_role(auth.uid(), 'admin')` pattern is replaced with `shop_id = get_current_user_shop_id()` to match this project's multi-tenant architecture
- Foreign keys to `auth.users` are replaced with simple UUID columns (no FK to auth schema)
- The `update_updated_at_column()` trigger function already exists in the main project, so we reuse it
- Number generator functions accept a `shop_uuid` parameter and filter by `shop_id` instead of `LIMIT 1`

