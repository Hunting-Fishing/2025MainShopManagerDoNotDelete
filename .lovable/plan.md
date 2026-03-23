

# Inspections & Compliance — Read-Only with Role-Based Editing

## Problem

The `SepticInspections.tsx` page (1,749 lines) contains full duplicate implementations of System Types management, Inventory Alerts, and a Template Builder — all editable inline. This duplicates what already exists in Settings. The user wants:

1. This page shows **read-only** views of System Regulations and Inspection Forms data (sourced from Settings)
2. Only **Owner** or **Manager** roles can edit — and editing happens in Settings, not here
3. Non-privileged users see the data but cannot modify it

## Changes

### File: `src/pages/septic/SepticInspections.tsx` (major rewrite)

**Reduce from ~1,749 lines to ~400 lines** by removing all inline editing components (`SystemTypesManager`, `SystemTypeCard`, `SystemTypeDialog`, `InventoryAlertsManager`, `CreateAlertDialog`, `SepticTemplateBuilder`, `XDFieldPicker`, `SectionEditor`, `ItemRow`, `CreateSepticTemplateDialog` — roughly 1,300 lines of duplicated code).

Replace the 4 tabs with a cleaner layout:

**Tab 1 — Inspection Forms** (read-only cards)
- Show published templates from `septic_inspection_templates` as cards (name, description, version, section count)
- "Use Form" button navigates to `/septic/inspection-form/:templateId`
- If user is Owner/Manager: show "Manage in Settings" button linking to `/septic/settings` (regulations/inspections tab)
- No edit/delete/duplicate/create actions on this page

**Tab 2 — System Regulations** (read-only)
- Fetch and display `septic_regulatory_classifications` and `septic_system_types` as informational cards
- Show system type name, description, linked template, required products — all read-only
- If Owner/Manager: "Edit in Settings" link

**Tab 3 — Completed Inspections** (keep as-is)
- Existing completed inspections list — this is operational data, not settings

**Tab 4 — Inventory Alerts** (read-only summary)
- Show active alerts and upcoming service warnings — read-only
- Owner/Manager: "Manage in Settings" link

### Role Check

Use `useAllUserRoles` hook to check if user has `owner` or `manager` role:

```ts
const { data: roles = [] } = useAllUserRoles();
const canManageSettings = roles.some(r => 
  ['owner', 'admin', 'manager'].includes(r.name)
);
```

When `canManageSettings` is true, show a subtle "Edit in Settings" button on each tab that navigates to the appropriate Settings tab. When false, no edit actions appear anywhere.

### Files

| File | Change |
|---|---|
| `src/pages/septic/SepticInspections.tsx` | **Rewrite** — remove all inline editors, replace with read-only views + role-gated "Edit in Settings" links |

No database changes needed. No new components needed — the page becomes a simple read-only dashboard pulling the same query data but without mutation hooks.

