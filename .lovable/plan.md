

# Enhanced Body Metrics Page — BMI, Health Integrations & Info Guide

## Overview

Transform the Body Metrics page from a basic measurement log into a comprehensive health tracking hub with automatic BMI calculation, richer metric types, an info guide tooltip, and a foundation for wearable/device integrations (Apple Health, Google Fit, Fitbit, smart scales).

## Database Changes

### Alter `pt_body_metrics` — add new columns

| Column | Type | Notes |
|--------|------|-------|
| bmi | numeric | Auto-calculated from weight + client height |
| resting_heart_rate | int | BPM |
| blood_pressure_systolic | int | mmHg |
| blood_pressure_diastolic | int | mmHg |
| muscle_mass_kg | numeric | From smart scales |
| bone_mass_kg | numeric | From smart scales |
| water_percent | numeric | Body water % |
| visceral_fat | numeric | Visceral fat rating |
| bmr_calories | int | Basal metabolic rate |
| source | text DEFAULT 'manual' | `manual`, `apple_health`, `google_fit`, `fitbit`, `smart_scale` |

### New table: `pt_health_integrations`

Track connected health devices per client.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| client_id | uuid FK → pt_clients | |
| shop_id | uuid FK → shops | |
| provider | text | `apple_health`, `google_fit`, `fitbit`, `smart_scale` |
| is_connected | boolean DEFAULT false | |
| last_synced_at | timestamptz | |
| access_token_encrypted | text | For future OAuth |
| created_at | timestamptz | |

## Page Enhancements

### 1. Info Icon + Tooltip
Add an `Info` icon next to the "Body Metrics" title that opens a popover explaining:
- What body metrics are tracked and why
- BMI scale reference (Underweight < 18.5, Normal 18.5–24.9, Overweight 25–29.9, Obese 30+)
- How measurements should be taken for accuracy
- Which devices can sync data

### 2. BMI Auto-Calculation & Display
- When recording metrics, if the client has `height_cm` on their profile and a weight is entered, auto-calculate BMI: `weight_kg / (height_m²)`
- Display BMI with a color-coded badge (green/yellow/orange/red) based on WHO categories
- Show BMI prominently on each metric card alongside weight

### 3. Enhanced Record Dialog
Add new fields to the recording form in organized sections:
- **Body Composition**: Weight, Body Fat %, Muscle Mass, Bone Mass, Water %, Visceral Fat
- **Measurements**: Chest, Waist, Hips, Arm, Thigh (existing)
- **Vitals**: Resting Heart Rate, Blood Pressure (systolic/diastolic), BMR
- **Source**: Dropdown showing where the data came from (Manual, Apple Health, Google Fit, Fitbit, Smart Scale)

### 4. Metric Cards Enhancement
- Show BMI badge with color coding on each card
- Display additional metrics (heart rate, muscle mass) when recorded
- Add trend arrows comparing to previous recording (up/down with color: green for good trends, red for concerning)

### 5. Health Device Integration Section
Add a "Connected Devices" card at the top of the page showing:
- Apple Health, Google Fit, Fitbit, Smart Scale tiles
- Each shows connected/disconnected status with a toggle
- "Coming Soon" overlay for now — the UI is built but OAuth flows are stubbed
- When "connected", show last sync timestamp
- Sync button to pull latest data (stubbed with toast for now)

### 6. BMI Index Reference Card
A persistent card or collapsible section showing:
- Visual BMI scale bar (color gradient from blue to red)
- WHO categories with ranges
- Client's current BMI position marked on the scale (when a client is selected)

## Components to Create

| Component | Purpose |
|-----------|---------|
| `BodyMetricsInfoPopover.tsx` | Info icon popover with metric explanations and BMI scale |
| `BMIBadge.tsx` | Color-coded BMI display badge with category label |
| `BMIScaleCard.tsx` | Visual BMI reference scale with client's position |
| `HealthDeviceCard.tsx` | Connected device tile (Apple Health, Google Fit, Fitbit, Smart Scale) |
| `EnhancedMetricCard.tsx` | Richer metric display card with BMI, trends, vitals |

All in `src/components/personal-trainer/metrics/`.

## Files to Create/Edit

| File | Change |
|------|--------|
| Migration SQL | Add new columns to `pt_body_metrics`, create `pt_health_integrations` |
| `PersonalTrainerMetrics.tsx` | Add info popover, BMI calculation, enhanced form fields, device integration section, BMI scale card |
| `src/components/personal-trainer/metrics/BodyMetricsInfoPopover.tsx` | New |
| `src/components/personal-trainer/metrics/BMIBadge.tsx` | New |
| `src/components/personal-trainer/metrics/BMIScaleCard.tsx` | New |
| `src/components/personal-trainer/metrics/HealthDeviceCard.tsx` | New |
| `src/components/personal-trainer/metrics/EnhancedMetricCard.tsx` | New |

## BMI Calculation Logic

```text
BMI = weight_kg / (height_cm / 100)²

Categories:
  < 18.5     → Underweight (blue badge)
  18.5–24.9  → Normal (green badge)
  25.0–29.9  → Overweight (yellow badge)
  30.0+      → Obese (red badge)
```

Height is pulled from `pt_clients.height_cm` for the selected client. If no height is on file, BMI shows "Height required" with a link to update the client profile.

## Health Integration Strategy

The UI for all four integrations is built now. The actual OAuth/API connections are stubbed with "Coming Soon" status and informational text. This establishes the platform foundation so that when edge functions for each provider are built later, the UI is ready to connect.

