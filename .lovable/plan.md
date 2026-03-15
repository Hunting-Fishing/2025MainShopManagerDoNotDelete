

## Export Company Module — Integration Gaps

The Export Company module has ~70 pages and full database tables, but it's not properly wired into the 6 synchronization layers the app requires. Here's what's missing and what needs to be done:

### 1. `business_modules` table — No database row
The `export-company` slug was never inserted into the `business_modules` table, so users can't enable it during onboarding or from the Module Hub.

**Fix**: New migration to INSERT `export-company` into `business_modules`.

### 2. `navigation.ts` (Desktop Sidebar) — No section
Gunsmith, Fuel Delivery, and other modules have dedicated sidebar sections. Export Company has none.

**Fix**: Add an "Export Company" section with key pages (Dashboard, Orders, Customers, Shipments, Documents, Invoices, etc.) with `permissionModule: 'export_company'`.

### 3. `routeGuards.ts` — No `/export` route permission
The septic module has `{ path: '/septic', allowedRoles: [...] }` but Export Company is missing entirely.

**Fix**: Add `{ path: '/export', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'owner'] }`.

### 4. `Navbar.tsx` (Hamburger Menu) — No export section
Other modules appear in the hamburger menu navigation categories. Export Company is absent.

**Fix**: Add an "Export Company" category with key navigation items.

### 5. `MobileNavigation.tsx` — Missing `/export` path detection
The `getDefaultModule` function detects `/gunsmith`, `/fuel-delivery`, etc. but not `/export`.

**Fix**: Add `if (path.startsWith('/export')) return 'export_company';` and add `'export_company'` to the return type union.

### 6. `getPostLoginDestination.ts` — Missing route mapping
The `MODULE_ROUTES` map has entries for all live modules except `export-company`.

**Fix**: Add `'export-company': '/export'` to the mapping.

### 7. `moduleRoutes.ts` sections — Missing 20 newer pages
The sections array only has the original ~24 pages. The 20 pages added in the last 3 rounds (Ports, Bonded Warehouses, Intermodal, Shipment P&L, Trade Finance, Document Templates, Customs Declarations, Trade Alerts, Shipment Tracker, Vendor Scorecards, Demand Forecasting, Container Load Planning, Consolidated P&L, Aging Reports, Landed Cost Calculator, Messaging Templates, Customer Portal, EDI Hub, Trade Lane Analytics, KPI Dashboard) are missing.

**Fix**: Add all 20 missing section entries to the `export-company` config in `moduleRoutes.ts`.

### Summary of files to edit

| File | Change |
|------|--------|
| New migration SQL | INSERT `export-company` into `business_modules` |
| `src/components/layout/sidebar/navigation.ts` | Add Export Company sidebar section |
| `src/utils/routeGuards.ts` | Add `/export` route permission |
| `src/components/layout/Navbar.tsx` | Add Export Company hamburger menu category |
| `src/components/mobile/MobileNavigation.tsx` | Add `/export` path detection |
| `src/lib/auth/getPostLoginDestination.ts` | Add `export-company` route mapping |
| `src/config/moduleRoutes.ts` | Add 20 missing page sections |

