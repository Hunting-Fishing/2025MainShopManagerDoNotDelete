

# Upgrade Septic Add Customer Form

## Overview

Replace the basic single-dialog "Add Customer" form with a multi-tab dialog featuring address autocomplete powered by the existing Mapbox geocoding edge function, a mini map preview, and septic-specific fields.

## What Changes

### 1. New Component: `SepticAddCustomerDialog.tsx`

A multi-tab dialog replacing the inline form in `SepticCustomers.tsx`:

**Tab 1 — Contact Info**
- First Name, Last Name (grid)
- Email, Phone
- Notes (textarea)

**Tab 2 — Property & Location**
- Address input with live autocomplete dropdown (calls `mapbox-geocode` edge function via `useGeocode` hook as user types, debounced 400ms)
- When user selects a suggestion, auto-fill: address, city, state, zip_code fields
- City, State, Zip Code shown as read-only or editable fields below address
- Mini map preview (reuse `MiniMapPreview` component) showing the selected location with draggable pin
- Coordinates stored in form state (latitude/longitude) for future use

**Tab 3 — Septic Info** (optional fields, saved as notes or future columns)
- Property type dropdown (Residential, Commercial, Municipal)
- Number of bedrooms (for system sizing context)
- Approximate property size
- Known system type (Conventional, Mound, Aerobic, etc.)
- Last pump date (date picker)
- Access notes (e.g., "gate code 1234", "key under mat")

### 2. Address Autocomplete Behavior

- Uses the existing `useGeocode()` hook which calls `mapbox-geocode` edge function
- Debounce input by 400ms using existing `useDebounce` hook
- Show dropdown list of up to 5 suggestions below the address input
- Each suggestion shows the full `placeName`
- On selection: populate address, city, state, zip_code from the geocoding `context` object
- On selection: update MiniMapPreview coordinates
- User can ignore suggestions and type freely

### 3. Database Migration

Add columns to `septic_customers`:
- `latitude DOUBLE PRECISION`
- `longitude DOUBLE PRECISION`  
- `property_type TEXT` (residential/commercial/municipal)
- `bedrooms INTEGER`
- `property_size TEXT`
- `system_type TEXT`
- `last_pump_date DATE`
- `access_notes TEXT`

### 4. Files to Edit

| File | Change |
|---|---|
| `src/components/septic/SepticAddCustomerDialog.tsx` | **New** — full multi-tab dialog with autocomplete + map |
| `src/pages/septic/SepticCustomers.tsx` | Replace inline dialog with new component |
| Migration SQL | Add new columns to `septic_customers` |

### 5. Technical Details

- Address autocomplete calls `useGeocode().mutateAsync({ address })` on debounced input
- `MiniMapPreview` receives lat/lng from geocoding result; pin is draggable to fine-tune
- Tabs implemented with shadcn `Tabs` component
- Form state includes all fields; only required fields are first_name + last_name
- The dialog is wider (`max-w-2xl`) to accommodate the map and tabs layout
- Existing `septic_customers` columns (city, state, zip_code, notes) are already in the schema but unused in the current form — this plan puts them to use

