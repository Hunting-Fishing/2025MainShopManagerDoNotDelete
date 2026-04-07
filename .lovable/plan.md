

# Fix All Welding Placeholder Pages — Full CRUD Implementation

## Problem
13 of 14 welding pages display "coming in next batch" placeholders, violating the project's production-first doctrine. All 24 database tables exist and are ready — only the frontend is missing.

## Architecture Pattern
Each page will follow the existing project conventions:
- `useShopId()` hook for multi-tenant shop_id
- `useQuery` / `useMutation` from TanStack Query against Supabase
- `as any` cast on table names (welding tables aren't in generated types)
- `WeldingAdminLayout` wrapper
- Mobile-first card layouts, search/filter, add/edit dialogs
- `useWeldingSettings()` for currency formatting and document numbering

## Implementation — 4 Batches

### Batch 1: Core Business (Quotes, Invoices, Customers, Inventory)

**WeldingAdminQuotes** — `welding_quotes` + `welding_quote_materials`
- List with status badges (new/sent/accepted/rejected/completed), search by customer/quote number
- Create/edit dialog: customer info, project type, labour hours/rate, travel, materials list, tax calc
- Status transitions, validity date tracking
- Materials sub-table CRUD inline

**WeldingAdminInvoices** — `welding_invoices` + `welding_invoice_items` + `welding_payments`
- List with status badges (draft/sent/paid/overdue/partial), search/filter
- Create/edit: line items, tax, amount paid tracking
- Record payment dialog
- Link to quote if converted

**WeldingAdminCustomers** — `welding_customers` + `welding_customer_interactions`
- List with search, status filter (active/inactive/lead)
- Create/edit dialog: name, company, contact, address fields
- Interaction log (calls, emails, meetings) as expandable section

**WeldingAdminInventory** — `welding_inventory` + `welding_inventory_purchase_history`
- List with low-stock highlighting, category filter, search
- Create/edit: name, category, specs, quantity, unit, min qty, costs
- Purchase history sub-list

### Batch 2: Financial (Payments Due, Accounts Payable, Purchase Orders)

**WeldingAdminPaymentsDue** — filtered view of `welding_invoices` where status != paid
- Outstanding balance cards, aging summary
- Quick "record payment" action

**WeldingAdminAccountsPayable** — `welding_accounts_payable` + `welding_vendors`
- List with status filter, vendor lookup
- Create/edit: vendor, amount, due date, notes
- Vendor management inline

**WeldingAdminPurchaseOrders** — `welding_purchase_orders` + `welding_purchase_order_items`
- List with status badges (draft/ordered/received/cancelled)
- Create/edit with line items linked to inventory
- Auto PO numbering from settings

### Batch 3: Operations (Messages, Calendar, Sales, Gallery)

**WeldingAdminMessages** — `welding_contact_messages`
- Inbox list with read/unread styling
- Detail view, mark as read toggle
- Delete capability

**WeldingAdminCalendar** — `welding_schedule_entries`
- Month/week view using date grid
- Create/edit entries: date, type (job/meeting/deadline/reminder), title, notes, color
- Link to customer/quote optionally

**WeldingAdminSales** — `welding_sales_activities`
- Pipeline list with status filter (new/contacted/quoted/won/lost)
- Create/edit: activity type, customer, follow-up date, notes, linked quote
- Follow-up date highlighting

**WeldingAdminGallery** — `welding_gallery_projects`
- Grid of project cards with images
- Create/edit: title, description, category, image URL, featured toggle, tags
- Drag-to-reorder via display_order

### Batch 4: Configuration (Links, Settings)

**WeldingAdminLinks** — `welding_quick_links`
- Sortable list of external links
- Create/edit: title, URL, description, icon

**WeldingAdminSettings** — `welding_company_settings`
- Full settings form: company info, tax rate, invoice terms, document numbering config
- Mobile quick-link selector
- Travel rate, deposit settings, currency config
- Preview of next invoice/quote/PO numbers (already in context)

## Technical Details
- ~13 files rewritten in `src/pages/welding/`
- No new DB tables or migrations needed — all 24 tables exist
- Each page: 150-400 lines depending on complexity
- All queries use `supabase.from("welding_*" as any)` pattern
- Shop scoping via `useShopId()` on all queries
- Toast notifications for all CRUD operations via `sonner`

## Execution Order
Batch 1 first (highest business value), then 2, 3, 4 sequentially. Each batch in one implementation turn.

