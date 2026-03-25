

# Add Assets Tab to Septic Settings

## What We're Building

A new "Assets" tab in Septic Settings where management can register and manage all company equipment (vehicles, forklifts, skidsteers, boom trucks, telehandlers, compactors, etc.) with photos, serial numbers, purchase details, manuals, and assignment capability.

## Database Changes

### Migration: Extend `septic_equipment` table

Add missing columns to the existing `septic_equipment` table:

```sql
ALTER TABLE public.septic_equipment
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS manual_urls JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
  ADD COLUMN IF NOT EXISTS warranty_status TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS vin_number TEXT,
  ADD COLUMN IF NOT EXISTS plate_number TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS assigned_employee_id UUID REFERENCES public.septic_employees(id),
  ADD COLUMN IF NOT EXISTS current_hours NUMERIC,
  ADD COLUMN IF NOT EXISTS current_mileage NUMERIC;
```

This keeps the septic-scoped architecture while adding the rich fields needed for full asset management (photos, manuals, warranty, assignment to employees).

## Frontend Changes

### 1. New component: `SepticAssetsTab.tsx`

Location: `src/components/septic/settings/SepticAssetsTab.tsx`

Features:
- **Equipment list** — table/card grid showing all `septic_equipment` records for the shop, with status badges, photos, and type labels
- **Add Equipment dialog** — form with fields: name, type (dropdown: Vehicle, Forklift, Skidsteer, Boom Truck, Telehandler, Compactor, Pump, Camera, Other), serial number, manufacturer, model, year, VIN, plate number, purchase date, purchase price, warranty expiry, notes
- **Photo upload** — profile image + additional photos using Supabase Storage (reuse existing `septic-files` or create `septic-equipment-photos` bucket)
- **Manual links** — ability to attach PDF/URL links to manuals
- **Edit/Delete** — inline edit and delete actions per equipment item
- **Status management** — available, in_use, maintenance, retired
- **Employee assignment** — dropdown to assign equipment to a `septic_employee`, linking to driver/staff pages

### 2. Update `SepticSettings.tsx`

- Add "Assets" tab trigger (with `Wrench` or `HardHat` icon) to the TabsList
- Add `TabsContent value="assets"` rendering the new `SepticAssetsTab` component
- Support `?tab=assets` URL param

### 3. Update `SepticDrivers.tsx` and `SepticStaff` (future linkage)

The `assigned_employee_id` column enables the Drivers page and Employee detail to show which equipment is assigned to each person. This linkage is set up in the schema now; UI display on driver/employee pages can be added as a follow-up.

## Files to Create/Modify

| File | Change |
|---|---|
| Migration SQL | Add columns to `septic_equipment` |
| `src/components/septic/settings/SepticAssetsTab.tsx` | New component — full CRUD for equipment assets |
| `src/pages/septic/SepticSettings.tsx` | Add "Assets" tab trigger + content |

## Equipment Types Supported

Vehicle, Forklift, Skidsteer, Boom Truck, Telehandler, Compactor, Pump, Jetter, Camera, Locator, Hose, Trailer, Generator, Other

