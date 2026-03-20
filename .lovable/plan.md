

# Nutritionix API Integration & Barcode Scanning for Supplements

## Overview

Add Nutritionix API as a premium data source for supplement nutrition facts, and add barcode scanning so trainers can scan product bottles to auto-lookup and import supplement data. Nutritionix has a verified database of branded supplements with full nutrition breakdowns.

## Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Frontend   │────▶│  Edge Function   │────▶│  Nutritionix  │
│  Barcode /  │     │  nutritionix-    │     │  API v2       │
│  Search     │     │  lookup          │     │               │
└─────────────┘     └──────────────────┘     └───────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ pt_supplements│ (auto-populate nutrition_facts)
                    └──────────────┘
```

## Secrets Required

- **NUTRITIONIX_APP_ID** — Nutritionix application ID (free tier: 200 calls/day)
- **NUTRITIONIX_API_KEY** — Nutritionix API key

User will need to sign up at https://developer.nutritionix.com/ to get these credentials.

## Edge Function: `nutritionix-lookup`

Single edge function with two modes:
- **Search by name**: `POST { action: "search", query: "doterra microplex" }` → calls Nutritionix `/v2/search/instant`
- **Lookup by barcode**: `POST { action: "barcode", upc: "60202813" }` → calls Nutritionix `/v2/search/item?upc=...`

Returns normalized nutrition data matching our `nutrition_facts` JSONB schema so it can be directly saved to `pt_supplements`.

## Barcode Scanning

Use the browser's native `BarcodeDetector` API (supported on Chrome/Edge/Android) with a fallback to manual UPC entry. Reuse the existing `useBarcodeScanner` hook pattern but add actual barcode detection via `BarcodeDetector`.

Flow:
1. Trainer taps "Scan Barcode" button on the Search tab
2. Camera opens, `BarcodeDetector` reads the UPC
3. UPC is sent to the `nutritionix-lookup` edge function
4. Results display with full nutrition facts
5. Trainer clicks "Import" to save to catalog with nutrition_facts pre-populated

## UI Changes

### Search Products Tab — Enhanced
Add two sub-sections at the top:
- **Nutritionix Search**: Text search with richer results showing full nutrition data
- **Barcode Scanner**: Camera button that opens scanner, plus manual UPC entry field
- Keep existing Open Food Facts search below as a fallback

### Import Flow Enhancement
When importing from Nutritionix, auto-populate:
- `name`, `brand_id` (match or create brand), `nutrition_facts` JSONB, `serving_size`, `category`, `image_url`, `barcode`

## New Components

| Component | Purpose |
|-----------|---------|
| `NutritionixSearch.tsx` | Search + barcode scan UI calling the edge function |
| `BarcodeScannerDialog.tsx` | Camera dialog with BarcodeDetector + manual entry fallback |

Both in `src/components/personal-trainer/supplements/`.

## Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/nutritionix-lookup/index.ts` | New edge function |
| `src/components/personal-trainer/supplements/NutritionixSearch.tsx` | New — search + results with nutrition preview |
| `src/components/personal-trainer/supplements/BarcodeScannerDialog.tsx` | New — camera scanner dialog |
| `src/pages/personal-trainer/PersonalTrainerSupplements.tsx` | Replace Search tab content with NutritionixSearch + fallback to Open Food Facts |

## Nutritionix → nutrition_facts Mapping

The edge function normalizes Nutritionix response fields to our JSONB schema:

| Nutritionix field | Our key | Example |
|---|---|---|
| `nf_vitamin_a_dv` | `vitamin_a` | `{ amount: "900mcg", dv: 100 }` |
| `nf_vitamin_c` | `vitamin_c` | `{ amount: "60mg", dv: 100 }` |
| `nf_calcium` | `calcium` | `{ amount: "200mg", dv: 15 }` |
| `nf_iron` | `iron` | `{ amount: "18mg", dv: 100 }` |
| etc. | | |

This ensures imported products render correctly in the existing `NutritionFactsPanel`.

