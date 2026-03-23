

# Build Generic Septic Inspection Form Template

## Overview

Enhance the existing `InspectionFormPreview.tsx` to render a professional, print-ready inspection form matching the uploaded reference image — with header fields (Location, Date, Assigned To, Checklist Score, Signed By), color-coded section rows, ✓/✗/N/A columns, and measurement fields. Also create a standalone generic form page accessible outside the settings builder.

## Changes

### 1. New Component: `SepticInspectionFormTemplate.tsx`

A reusable, interactive form component that renders any saved inspection template in the visual style shown in the image:

- **Header block**: Company logo area, form title, Location, Date, Assigned To, Checklist Score, Signed By fields
- **Section rendering**:
  - Checkbox sections: Purple header bar with ✓ column + item rows with alternating colors (pink/yellow/blue/green)
  - Pass/Fail/N/A sections: Three-column header (✓ | ✗ | N/A) + item rows with alternating colors
  - Number sections: Input fields with units
  - Text/Notes sections: Textarea areas
- **Per-item**: Notes, photo, video attachment indicators based on item settings
- **Footer**: Page number, form version

### 2. New Page: `SepticInspectionForm.tsx`

Route: `/septic/inspection-form/:templateId`

A page that loads a template by ID and renders the generic form for filling out during an actual inspection. Includes:
- Print button (CSS print styles)
- Save/Submit functionality
- Read-only vs fill mode

### 3. Update `InspectionFormPreview.tsx`

Replace the current basic preview with the new styled `SepticInspectionFormTemplate` component so the preview in settings matches the professional look.

### 4. Update `InspectionFormBuilderTab.tsx`

Add a "Use Form" action on each template card that navigates to the fill-out page.

## Files

| File | Action |
|---|---|
| `src/components/septic/inspection/SepticInspectionFormTemplate.tsx` | **Create** — Professional styled form renderer |
| `src/components/septic/settings/InspectionFormPreview.tsx` | **Edit** — Use new styled renderer |
| `src/components/septic/settings/InspectionFormBuilderTab.tsx` | **Edit** — Add "Use Form" action |
| `src/pages/septic/SepticInspectionForm.tsx` | **Create** — Fill-out page with print support |

## Visual Design (matching reference image)

```text
┌──────────────────────────────────────────────────┐
│ Septic Tank Inspection Checklist          [Logo] │
├──────────────────────────────────────────────────┤
│ Location: ________    Date: ________             │
│ Assigned To: ______   Checklist Score: ________  │
│ Signed By: ________                              │
├──────────────────────────────────────────────────┤
│ [✓] Septic Tank Inspection Preparation           │  ← purple header
│  ░  Inspector wearing rubber gloves...           │  ← alternating row colors
│  ░  Inspector has tools and materials...         │
│  ...                                             │
├──────────────────────────────────────────────────┤
│ [✓][✗][N/A] Septic Tank Checklist                │  ← purple header with 3 cols
│  ░  ░  ░   Wastewater directed into...           │
│  ░  ░  ░   Water not backing up...               │
│  ...                                             │
├──────────────────────────────────────────────────┤
│ Scum Layer Thickness: ______                     │
│ Sludge Layer Thickness: ______                   │
└──────────────────────────────────────────────────┘
```

- Row colors cycle: pink (#fce4ec), yellow (#fff9c4), blue (#e3f2fd), green (#e8f5e9)
- Section headers: dark purple background with white text
- Clean borders and professional spacing
- Print-optimized CSS with `@media print` styles

