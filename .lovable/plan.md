

## Plan: Simplify Export Sidebar with Section Hub Navigation

### Problem
The Export sidebar lists ~70 individual pages across 11 sections, creating an overwhelming scroll experience that will only grow.

### Solution
Replace the detailed item lists with **section-level buttons only**. Each section button navigates to a **section hub page** — a dashboard-style page with card tiles for every sub-page in that section.

### How It Works

```text
BEFORE (sidebar):                    AFTER (sidebar):
┌──────────────────────┐            ┌──────────────────────┐
│ ▸ Overview           │            │ ● Dashboard          │
│   Dashboard          │            │ ● Overview           │
│   Alerts             │            │ ● Orders & Requests  │
│   Trade Alerts       │            │ ● Customers & Products│
│   Reports            │            │ ● Fleet & Logistics  │
│   Activity Log       │            │ ● Inventory          │
│ ▸ Orders & Requests  │            │ ● Documents          │
│   Orders             │            │ ● Billing & Finance  │
│   Requests           │            │ ● Analytics          │
│   Shipments          │            │ ● Communication      │
│   Completions        │            │ ● Import             │
│   Quotes             │            │ ● Configuration      │
│   Contracts          │            └──────────────────────┘
│   Returns & Claims   │
│   Samples            │            Clicking "Orders & Requests"
│ ▸ Customers & ...    │            opens a hub page with tiles:
│   (6 items)          │            ┌─────┐┌─────┐┌─────┐
│ ▸ Fleet & Logistics  │            │Order││Req. ││Ship.│
│   (13 items)         │            └─────┘└─────┘└─────┘
│   ...70+ total...    │            ┌─────┐┌─────┐┌─────┐
└──────────────────────┘            │Quote││Contr││Ret. │
                                    └─────┘└─────┘└─────┘
```

### Files to Create (9 section hub pages)

Each hub page will be a simple card-grid dashboard that reuses the existing `navSections` data (icons, colors, titles, hrefs):

1. `src/pages/export/hubs/ExportOverviewHub.tsx`
2. `src/pages/export/hubs/ExportOrdersHub.tsx`
3. `src/pages/export/hubs/ExportCustomersHub.tsx`
4. `src/pages/export/hubs/ExportLogisticsHub.tsx`
5. `src/pages/export/hubs/ExportInventoryHub.tsx`
6. `src/pages/export/hubs/ExportDocumentsHub.tsx`
7. `src/pages/export/hubs/ExportFinanceHub.tsx`
8. `src/pages/export/hubs/ExportAnalyticsHub.tsx`
9. `src/pages/export/hubs/ExportCommunicationHub.tsx`
10. `src/pages/export/hubs/ExportImportHub.tsx`

**Note**: "Configuration" only has 2 items — it can stay inline or get a small hub. The main Dashboard (`/export`) stays as-is since it's already a hub.

### Files to Edit

| File | Change |
|------|--------|
| `src/components/export/ExportSidebar.tsx` | Replace 70+ item listings with ~12 section buttons. Each section becomes one nav item linking to its hub route. Keep header, back button, toggle, and styling. |
| `src/App.tsx` | Add lazy imports and routes for the 10 new hub pages under `/export/hub/*` |

### Hub Page Pattern
Each hub page will follow a shared pattern — a reusable `SectionHub` component that takes a title, description, and array of `{title, href, icon, color, description}` tiles. This avoids duplicating layout code across 10 files. One shared component + 10 thin wrapper pages.

### Sidebar After
- Dashboard (stays as direct link to `/export`)
- Overview → `/export/hub/overview`
- Orders & Requests → `/export/hub/orders`
- Customers & Products → `/export/hub/customers`
- Fleet & Logistics → `/export/hub/logistics`
- Inventory & Warehouses → `/export/hub/inventory`
- Documents & Compliance → `/export/hub/documents`
- Billing & Finance → `/export/hub/finance`
- Analytics & Intelligence → `/export/hub/analytics`
- Communication & Integration → `/export/hub/communication`
- Import → `/export/hub/import`
- Configuration → `/export/hub/config`

Active state: A section button highlights when the current path matches any of its child pages (e.g., being on `/export/orders` highlights "Orders & Requests").

