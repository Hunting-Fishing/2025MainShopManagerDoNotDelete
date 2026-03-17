

## Plan: Seed Default Packaging Types and Ensure Add Works

### Findings

- The `export_packaging_types` table exists with correct columns and RLS policies (SELECT, INSERT, UPDATE scoped to `get_current_user_shop_id()`)
- The `AddPackagingTypeDialog` and `useExportPackagingTypes` hook are properly wired
- The table is currently **empty** — zero rows — which is why the dropdown shows "No types yet"
- The RLS insert policy uses `get_current_user_shop_id()` which requires an authenticated user with a profile linked to a shop — this should work in normal usage

### What I will do

1. **Seed common default packaging types** via a migration that inserts standard packaging types for the user's shop. Since types are shop-scoped, I will create an Edge Function or a database trigger approach. The simplest approach: add a set of default types during shop creation, OR provide a "seed defaults" button. Given the pattern, I will insert defaults using a migration tied to existing shops, and add a trigger so new shops get defaults automatically.

2. **Pre-seed defaults for existing shops**: Migration inserts common types (Vacuum Sealed Bag, Cardboard Box, Plastic Container, Metal Can, Wooden Crate, Glass Jar, Foil Pouch, Woven Sack, Shrink Wrap, Drum) for all existing shops.

3. **Auto-seed for new shops**: Create a trigger function that inserts default packaging types when a new shop is created.

4. **Ensure DELETE policy exists** so users can remove unwanted types (currently missing).

### Changes

**Database migration** (single SQL file):
- Insert ~10 default packaging types for each existing shop in `shops` table
- Create trigger function `seed_default_packaging_types()` that fires on `INSERT` to `shops`
- Add DELETE RLS policy for own-shop types

**No frontend changes needed** — the Select dropdown and Add dialog are already correctly implemented.

