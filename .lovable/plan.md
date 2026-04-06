

# Integrate Welding Module from Climax Welding Hub Project

## Overview

The [Climax Welding Hub](/projects/ed71a28e-1170-46fc-93a7-b7afcfbdd17a) project contains a complete standalone welding/fabrication business app with 14 admin pages, 5 public-facing pages, and supporting components. We need to port this into the main project as a `/welding` module following the same architectural patterns used by Septic, Power Washing, etc.

## What the Welding Module Contains

**Public pages**: Landing (Index), Services, Gallery, Quote Request, Contact
**Customer dashboard**: Quotes list, Invoices list, Balance due
**Admin pages** (14 total): Overview, Gallery Manager, Quotes (with materials, attachments, history, convert-to-invoice), Invoices (with line items, payments, PDF), Payments Due, Accounts Payable, Inventory (with purchase history), Purchase Orders, Customers (with CRM interactions), Messages, Calendar/Scheduling, Sales Pipeline, External Links, Settings (company info, business hours, team/roles, numbering, mobile quick links)

**Key components**: AdminLayout (sidebar + mobile bottom nav), QuoteMaterialsTable, InventoryPicker, ChangeHistory, QuoteHistory, AddressAutocomplete
**Contexts**: AppSettingsContext (company_settings table), AuthContext (profiles + admin check)

## Implementation Plan

### Phase 1: Database Tables (Migration)

Create welding-prefixed tables to maintain module isolation (same pattern as `septic_*`):

| Table | Purpose |
|---|---|
| `welding_company_settings` | Company name, tax rate, invoice prefix, business hours, mobile quick links |
| `welding_customers` | First/last name, email, phone, address, status (lead/active/inactive), notes |
| `welding_customer_interactions` | CRM log: type, notes, linked to customer |
| `welding_quotes` | Customer info, project type, description, timeline, status, estimated amount, labour hours, travel cost |
| `welding_quote_materials` | Line items on quotes: inventory ref, qty, cost, sell price, sort order, category |
| `welding_quote_attachments` | Photos attached to quotes (stored in Supabase storage) |
| `welding_quote_history` | Audit trail of quote changes |
| `welding_invoices` | Invoice number, customer, subtotal, tax, total, status, payments |
| `welding_invoice_items` | Line items on invoices |
| `welding_inventory` | Materials stock: name, category, specs, qty, min_qty, cost, sell price |
| `welding_purchase_orders` | PO tracking for inventory |
| `welding_accounts_payable` | Bills from vendors |
| `welding_vendors` | Vendor directory |
| `welding_gallery_projects` | Portfolio/gallery images with tags |
| `welding_contact_messages` | Contact form submissions |
| `welding_schedule_entries` | Calendar entries (day off, install, on-site, etc.) |
| `welding_sales_activities` | Sales pipeline tracking |
| `welding_labour_rates` | Configurable labour rate tiers |
| `welding_line_item_categories` | Categories for quote line items |
| `welding_admin_links` | Configurable external links |

All tables will have RLS policies scoped to authenticated users, with appropriate shop_id filtering where applicable.

### Phase 2: File Structure

```text
src/pages/welding/
  WeldingLanding.tsx          (public landing page)
  WeldingServices.tsx         (services showcase)
  WeldingGallery.tsx          (portfolio gallery)
  WeldingQuoteRequest.tsx     (public quote form)
  WeldingContact.tsx          (contact form)
  WeldingDashboard.tsx        (customer dashboard)
  WeldingAdminOverview.tsx    (admin dashboard)
  WeldingAdminQuotes.tsx      (quote management)
  WeldingAdminInvoices.tsx    (invoice management)
  WeldingAdminPaymentsDue.tsx
  WeldingAdminAccountsPayable.tsx
  WeldingAdminInventory.tsx
  WeldingAdminPurchaseOrders.tsx
  WeldingAdminCustomers.tsx
  WeldingAdminMessages.tsx
  WeldingAdminCalendar.tsx
  WeldingAdminSales.tsx
  WeldingAdminLinks.tsx
  WeldingAdminSettings.tsx
  WeldingAdminGallery.tsx
  WeldingDeveloper.tsx
  WeldingStore.tsx
  WeldingRoutes.tsx           (route definitions)

src/components/welding/
  WeldingAdminLayout.tsx      (sidebar + mobile nav, adapted)
  WeldingQuoteMaterialsTable.tsx
  WeldingInventoryPicker.tsx
  WeldingChangeHistory.tsx
  WeldingQuoteHistory.tsx
  WeldingAddressAutocomplete.tsx

src/contexts/
  WeldingSettingsContext.tsx   (company settings for welding module)
```

### Phase 3: Module Registration (8-layer sync)

1. **`business_modules` table** — Insert welding module record
2. **`navigation.ts`** — Add welding sidebar entries
3. **`routeGuards.ts`** — Add `/welding` path permissions
4. **`Navbar.tsx`** — Add to hamburger menu
5. **`MobileNavigation.tsx`** — Add path detection
6. **`getPostLoginDestination.ts`** — Add welding redirect
7. **`moduleRoutes.ts`** — Full section config with groups (Dashboard, Services, Customers, Inventory, Billing, etc.)
8. **`SidebarContent.tsx`** — Add to `moduleRoutePatterns`

### Phase 4: Adaptation from Source

Key changes when porting each file:
- Replace `useAuth()` from local AuthContext with main project's `useAuthUser()` hook
- Replace `useAppSettings()` with new `WeldingSettingsContext`
- Replace all table names from `quotes` → `welding_quotes`, `invoices` → `welding_invoices`, etc.
- Replace `AdminLayout` wrapper with `WeldingAdminLayout` that uses the main project's navigation patterns
- Update all route paths from `/welding/admin/...` to match main project convention
- Replace `companyLogo` import with dynamic logo from settings
- Storage bucket: create `welding-photos` bucket or use existing `project-photos` with welding prefix

### Phase 5: Storage Bucket

Create a `welding-photos` storage bucket for quote attachments and gallery images, with public read access and authenticated upload policies.

## Execution Order

Due to the size (~20 files, ~8000+ lines of UI code + migration), this will be implemented in batches:

1. **Batch 1**: Database migration (all tables + RLS + storage bucket)
2. **Batch 2**: Contexts + shared components (WeldingSettingsContext, WeldingAdminLayout, utility components)
3. **Batch 3**: Admin pages (Overview, Quotes, Invoices, Inventory, Customers, Calendar, Settings)
4. **Batch 4**: Remaining admin pages (AP, PO, Sales, Messages, Links, Gallery, Payments Due)
5. **Batch 5**: Public pages (Landing, Services, Gallery, Quote, Contact, Customer Dashboard)
6. **Batch 6**: Module registration (all 8 layers), routes, developer page, store page

## Files to Create/Modify

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/welding_tables.sql` | ~20 tables with RLS |
| Create | ~23 page files in `src/pages/welding/` | All welding pages |
| Create | ~6 component files in `src/components/welding/` | Shared components |
| Create | `src/contexts/WeldingSettingsContext.tsx` | Module settings context |
| Modify | `src/config/moduleRoutes.ts` | Add welding module config |
| Modify | `src/config/navigation.ts` | Add sidebar entries |
| Modify | `src/config/routeGuards.ts` | Add path permissions |
| Modify | `src/components/Navbar.tsx` | Add to hamburger menu |
| Modify | `src/components/MobileNavigation.tsx` | Add path detection |
| Modify | `src/config/getPostLoginDestination.ts` | Add welding redirect |
| Modify | `src/components/sidebar/SidebarContent.tsx` | Add route patterns |
| Modify | `src/App.tsx` | Add welding routes |

