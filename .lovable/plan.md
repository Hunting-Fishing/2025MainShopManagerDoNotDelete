# Region-Aware Automotive Module — Phase 1: Asia / Philippines

Today `AutomotiveRecalls.tsx` and the vehicle catalog (`src/data/manufacturers/automotive.ts`) are hardcoded to a US/NHTSA worldview with sample data. We'll introduce a region dimension (Asia / Europe / North America) with **Asia → Philippines** as the active region, and wire recalls, TSBs, OBD2 references, and the vehicle picker to it. Phase 1 ships PH end-to-end; Europe and North America become selectable shells with the same schema, ready to backfill later.

## OBD2 — quick answer (documented in the UI)

- **Generic codes** (P0xxx, B0xxx, C0xxx, U0xxx per SAE J2012 / ISO 15031-6) are **globally identical**. A PH-spec Toyota Vios and a US Camry both throw `P0420` for the same catalyst-efficiency fault.
- **Manufacturer-specific codes** (P1xxx, P3xxx, B1/B2, C1/C2, U1/U2) **vary by OEM and sometimes by market** (different ECU calibrations for JDM/ASEAN vs. EU vs. NA emissions packages).
- **OBD2 mandate dates differ**: US 1996, EU (EOBD petrol) 2001 / diesel 2004, PH effectively post-2008 on most modern ICE vehicles (no nationwide legal mandate equivalent to OBD-II; presence is OEM-driven).
- **Readiness monitors / PIDs / emissions modes** can differ by regional emissions standard (Euro 4/5 vs. Tier-2/3 vs. PH Euro 4 since 2016).

UI consequence: show generic codes globally; tag mfr-specific codes with `applicable_regions[]` and filter by the active region; show a region note on the DTC detail.

## Region model

Add a single source of truth used across the Automotive module:

```ts
// src/lib/regions/automotive.ts
export type AutomotiveRegion = 'asia-ph' | 'asia' | 'europe' | 'north-america';
export const REGION_META: Record<AutomotiveRegion, { label; country; agencies; emissions; obdMandate }>;
```

**Per-user preference** (chosen): store on `profiles.automotive_region` with default `'asia-ph'`. Read via a `useAutomotiveRegion()` hook with React Query + Supabase, expose a region switcher in the Automotive header (flag + label, persists on change).

## Scope of changes

### 1. Region selector + persistence
- Migration: add `automotive_region text default 'asia-ph'` to `profiles` (no RLS change — column on existing row).
- `src/lib/regions/automotive.ts` — region constants, labels, agency metadata.
- `src/hooks/useAutomotiveRegion.ts` — read/update preference.
- `src/components/automotive/RegionSwitcher.tsx` — compact dropdown shown in `AutomotiveDashboard` header and on each sub-page header strip.

### 2. Recalls & TSBs (`AutomotiveRecalls.tsx`)
Replace the two `SAMPLE_*` arrays with a region-routed data layer:

- New tables (migration):
  - `auto_recalls` (region, source_agency, source_id, title, affected_makes[], affected_models[], year_from, year_to, issued_at, remedy, source_url, raw jsonb)
  - `auto_tsbs` (region, manufacturer, bulletin_no, title, affected_makes[], affected_models[], year_from, year_to, issued_at, severity, source_url, raw jsonb)
  - Public read (`anon` + `authenticated`); writes service-role only (sync jobs).
- Edge function `sync-auto-recalls` with region-specific adapters:
  - `asia-ph`: scrape DTI-FTEB consumer recall list + Toyota Motor Philippines / Mitsubishi Motors PH / Honda Cars PH / Isuzu PH / Suzuki PH safety-recall pages via the existing Firecrawl connector (per Firecrawl skill); cache raw JSON.
  - `europe`: RAPEX/Safety Gate adapter stub.
  - `north-america`: NHTSA public JSON API (`api.nhtsa.gov`) — already free/keyless.
  - All adapters normalise into the `auto_recalls`/`auto_tsbs` shape and upsert by `(region, source_id)`.
- UI filters list by active region; adds an "Agency" badge (DTI / NHTSA / RAPEX). VIN search hits a region-aware decoder route (NHTSA vPIC for NA; PH-market VIN lookup falls back to vPIC since most ASEAN VINs decode there for make/model/year).

### 3. OBD2 / Diagnostics (`AutomotiveDiagnostics.tsx`)
- New table `auto_dtc_codes` (code, code_type `'generic'|'manufacturer'`, manufacturer nullable, applicable_regions text[], description, symptoms, common_causes, severity).
- Seed generic SAE J2012 codes once (region-agnostic, applicable_regions = all).
- Manufacturer-specific seeds gated by region; PH seed prioritises Toyota/Mitsubishi/Honda/Isuzu/Suzuki/Hyundai/Ford ASEAN calibrations.
- UI shows a region pill on each result and a banner explaining generic vs. mfr-specific behaviour.

### 4. Vehicle catalog (`src/data/manufacturers/automotive.ts` + VIN handling)
- Add `regions: AutomotiveRegion[]` to each `Manufacturer`. Tag PH-relevant makes (Toyota, Mitsubishi, Honda, Isuzu, Suzuki, Hyundai, Nissan, Ford, Kia, Mazda, Chevrolet, Foton, MG, Geely, Chery, BYD, Hino) with `'asia-ph'`.
- Vehicle pickers (`CustomerVehicleFields`, work-order intake, etc.) filter by active region by default with a "Show all regions" toggle.
- VIN decode service: keep NHTSA vPIC as the universal backend (works for most ASEAN imports). Add a `market` field stored alongside decoded vehicles so PH-market trims (e.g., Vios XLE, Mirage G4 GLX) can be hand-edited without overwriting the decode.

## Out of scope (Phase 2+)
- Full Europe + NA recall/TSB live syncs (adapters scaffolded but only PH and NHTSA wired).
- LTO registration lookup integration (no public API; would need agency partnership).
- Per-region pricing/units (km vs mi, PHP vs USD) — separate pass.

## Technical notes

```text
profiles.automotive_region (text)
                │
                ▼
useAutomotiveRegion() ──► RegionSwitcher
                │
   ┌────────────┼─────────────┬────────────────┐
   ▼            ▼             ▼                ▼
Recalls UI   TSB UI       DTC lookup      Vehicle picker
   │            │             │                │
   ▼            ▼             ▼                ▼
auto_recalls auto_tsbs   auto_dtc_codes   manufacturers[].regions
   ▲            ▲             ▲
   └── sync-auto-recalls edge fn (per-region adapters: PH scrape, NHTSA API, RAPEX stub)
```

Data sources to be confirmed before edge-function build:
- PH recalls: DTI-FTEB Consumer Product Recall list, plus OEM PH safety-recall pages (Toyota/Mitsubishi/Honda/Isuzu/Suzuki). All public HTML — Firecrawl scrape, daily cron.
- PH TSBs: no public registry; seed manually + accept staff submissions via an admin form (production-first, no mock data — entries are real shop knowledge).
- NHTSA: `https://api.nhtsa.gov/recalls/recallsByVehicle` and `vehicles/GetAllMakes` (free, no key).
- DTC seed: SAE J2012 generic list (public spec) + OEM code packs.

Region constants and tables ship as the foundation; Phase 1 fully wires PH, leaves Europe/NA as live-empty regions with the sync adapters scaffolded.
