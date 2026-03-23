

# Septic Inspection Form Builder — Settings Tab

## Overview

Add an "Inspection Forms" tab to Septic Settings containing a full form builder that lets users create, name, edit, duplicate, and manage multiple inspection checklist templates. Each template has sections with checklist items supporting ✓/✗/N/A responses, notes, and photo/video attachments per line. Pre-loaded with the checklist from the uploaded image as a starter template.

## Database

Already exists — `septic_inspection_templates`, `septic_inspection_template_sections`, `septic_inspection_template_items` are all in place with RLS. The `item_type` field supports `checkbox`, `text`, `number`, `photo`, `video`, `notes`, and `gyr_status`.

**One migration needed**: Add columns to `septic_inspection_template_items` for the enhanced per-line capabilities:
- `allows_notes BOOLEAN DEFAULT true` — whether the item has a notes field
- `allows_photos BOOLEAN DEFAULT true` — whether photos can be attached
- `allows_videos BOOLEAN DEFAULT false` — whether videos can be attached
- `response_type TEXT DEFAULT 'pass_fail_na'` — the response format (pass_fail_na / gyr_status / checkbox / text / number)

## UI Architecture

### New Tab in Settings

Add "Inspection Forms" tab (with `ClipboardCheck` icon) to `SepticSettings.tsx`.

### Component: `InspectionFormBuilderTab.tsx`

**Form List View** (default):
- Cards showing all saved templates with name, description, section count, item count, published status
- "Create New Form" button
- Actions per form: Edit, Duplicate, Delete, Publish/Unpublish
- "Load Default Checklist" button that seeds the BC inspection checklist from the uploaded image

**Form Editor View** (when editing/creating):
- Form name and description fields at top
- Sections rendered as collapsible cards with drag handles
- "+ Add Section" button
- Each section has:
  - Editable title and description
  - List of checklist items
  - "+ Add Item" button
- Each checklist item row shows:
  - Item name (editable inline)
  - Response type selector (✓/✗/N/A, Green/Yellow/Red, text, number)
  - Required toggle
  - Notes toggle (allow notes per line)
  - Photos toggle (allow photo attachments)
  - Videos toggle
  - Delete button
- Save / Cancel buttons
- "Preview" mode showing the form as it would appear to inspectors

### Default Template Data (from uploaded image)

Pre-built "Septic Tank Inspection Checklist" with:

**Section 1 — Inspection Preparation** (5 items, checkbox response):
- Inspector wearing rubber gloves and eye protection
- Inspector has tools and materials necessary
- Safety rules reviewed
- If necessary, inspect with another person for safety
- Avoid touching face during inspection

**Section 2 — Septic Tank Checklist** (16 items, ✓/✗/N/A response):
- Wastewater directed into sewage treatment system
- Water not backing up and drains flow freely
- Risers watertight and without leaks
- Risers no visible damage
- Tank odor levels acceptable
- Liquid level above outlet pipe
- Healthy scum layer in tank
- Scum layer no more than 6 inches depth
- Sludge layer no more than 12 inches depth
- Signs of overflow
- Scum layer below inlet
- Baffles above scum layer
- Clean outlet baffle filter
- Diverter box above ground level
- Diverter in place with lid
- Ground around system — surface sewage

**Section 3 — Measurements** (2 items, number response with units):
- Scum Layer Thickness
- Sludge Layer Thickness

**Section 4 — Notes** (1 item, text/notes):
- General inspection notes

## Files

| File | Action |
|---|---|
| `src/components/septic/settings/InspectionFormBuilderTab.tsx` | **Create** — form list + editor with full CRUD |
| `src/components/septic/settings/InspectionFormEditor.tsx` | **Create** — section/item editor with inline editing |
| `src/components/septic/settings/InspectionFormPreview.tsx` | **Create** — read-only preview of the form |
| `src/pages/septic/SepticSettings.tsx` | **Edit** — add "Inspection Forms" tab |
| `src/integrations/supabase/types.ts` | **Edit** — add new columns |
| Migration SQL | **Create** — add columns to `septic_inspection_template_items` |

## Technical Details

- All CRUD operations use `supabase` client against `septic_inspection_templates`, `septic_inspection_template_sections`, `septic_inspection_template_items`
- Sections and items use `display_order` for ordering
- Save operation: upsert template → delete removed sections/items → upsert remaining sections → upsert items
- The "Load Default Checklist" inserts the full BC checklist as a new template in one transaction
- Form names are user-defined — users can create as many forms as they need

