

# Export Company Module — Plan

## Overview
Create a new **Export** module (`/export/*`) for managing dehydrated food, salt, and vehicle exports. The **Fuel Delivery** module is the best structural template — it has orders, customers, routes, trucks, drivers, inventory, invoicing, and products, which maps directly to export operations.

## Module Concept — Export Company
An export company ships **dehydrated foods**, **salt**, and **vehicles** to international destinations. Key needs:

- **Products & Inventory**: Dehydrated foods (by type, weight, packaging), salt (grades, bulk/bags), vehicles (make/model/VIN)
- **Customers/Buyers**: International buyers with shipping addresses, contact info, trade terms
- **Export Orders**: Multi-product orders with quantities, pricing, destination port/country, Incoterms
- **Shipments & Logistics**: Container tracking, bill of lading, shipping lines, port of origin/destination
- **Vehicles for Export**: VIN tracking, export documentation, customs status
- **Documents & Compliance**: Export licenses, phytosanitary certificates, customs declarations, certificates of origin
- **Routes & Scheduling**: Delivery routes to ports/warehouses
- **Invoicing & Quotes**: Commercial invoices, proforma invoices, packing lists
- **Fleet**: Company trucks for local transport to ports/warehouses
- **Warehouses**: Storage locations for goods awaiting export

## Database Tables (all prefixed `export_`)

| Table | Purpose |
|-------|---------|
| `export_customers` | International buyers (company, country, port, trade terms) |
| `export_products` | Product catalog (dehydrated foods, salt types, vehicle categories) |
| `export_orders` | Export orders with destination, Incoterms, currency |
| `export_order_items` | Line items per order (product, qty, unit price, weight) |
| `export_shipments` | Container/shipping tracking (BOL, container #, vessel, ETD/ETA) |
| `export_vehicles` | Vehicles being exported (VIN, make, model, customs status) |
| `export_documents` | Compliance docs (licenses, certificates, customs forms) |
| `export_inventory` | Warehouse stock levels for foods and salt |
| `export_warehouses` | Storage locations |
| `export_trucks` | Company fleet for port transport |
| `export_drivers` | Driver management |
| `export_routes` | Route planning to ports |
| `export_route_stops` | Individual stops on routes |
| `export_invoices` | Commercial/proforma invoices |
| `export_quotes` | Price quotes for buyers |
| `export_staff` | Module staff |
| `export_equipment` | Equipment (forklifts, scales, etc.) |

All tables include `shop_id` with RLS using `get_current_user_shop_id()`.

## Frontend Pages (~25 pages under `/export/*`)

| Page | Description |
|------|-------------|
| `ExportDashboard` | KPIs: active orders, shipments in transit, inventory levels, revenue |
| `ExportOrders` | Order management with status workflow (draft → confirmed → shipped → delivered) |
| `ExportOrderForm` | Create/edit orders with product lines, destination, Incoterms |
| `ExportCustomers` | International buyer directory |
| `ExportCustomerDetails` | Buyer detail with order history |
| `ExportProducts` | Product catalog (foods, salt, vehicle categories) |
| `ExportInventory` | Warehouse stock with reorder alerts |
| `ExportVehicles` | Vehicles for export with VIN, customs status |
| `ExportShipments` | Container/shipping tracker with timeline |
| `ExportDocuments` | Export licenses, certificates, customs declarations |
| `ExportWarehouses` | Storage locations management |
| `ExportRoutes` | Route planning (split-view map) to ports |
| `ExportTrucks` | Company fleet |
| `ExportDrivers` / `ExportDriverDetail` | Driver management |
| `ExportDriverApp` | Mobile driver interface |
| `ExportInvoices` | Commercial invoices |
| `ExportQuotes` | Proforma invoices / quotes |
| `ExportPricing` | Price lists by product, destination |
| `ExportStaff` | Module staff management |
| `ExportEquipment` | Forklifts, scales, packaging equipment |
| `ExportCompletions` | Completed shipment records |
| `ExportSettings` | Module configuration |
| `ExportProfile` | Business profile |
| `ExportStore` | Recommended gear |
| `ExportDeveloper` | API/developer tools |

## System Integration Points

1. **permissionModules.ts** — Add `export` module definition
2. **useModulePermissions.ts** — Add to hardcoded modules array
3. **navigation.ts** — Add Export section to main sidebar
4. **MobileNavigation.tsx** — Add mobile nav entry
5. **Navbar.tsx** — Add hamburger menu entry
6. **routeGuards.ts** — Add `/export` route protection
7. **App.tsx** — Add `ExportLayout` wrapper with all child routes
8. **ExportSidebar.tsx** — Module-specific sidebar navigation
9. **ExportLayout.tsx** — Layout wrapper component

## Implementation Approach

Will be built in batches across multiple rounds:
- **Round 1**: Database migration (all `export_` tables), layout/sidebar, dashboard, navigation integration
- **Round 2**: Core operations pages (orders, customers, products, inventory, vehicles)
- **Round 3**: Logistics pages (shipments, documents, routes, trucks, drivers)
- **Round 4**: Financial pages (invoices, quotes, pricing) and remaining pages

