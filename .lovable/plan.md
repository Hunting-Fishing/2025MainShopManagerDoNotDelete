

# Enhance Nutrition Page: Hydration Tracker, Meal Photos, Weekly Reports & Client Comparison

## Overview

Four new features added to the existing Nutrition Intelligence page, accessible via new tabs and enhanced existing tabs.

## Database Changes

### New table: `nt_hydration_logs`
Tracks water intake entries per client per day.
- `id`, `client_id`, `shop_id`, `log_date`, `amount_ml`, `source` (water/tea/coffee/etc), `logged_at`, `created_at`
- RLS: shop isolation via `get_current_user_shop_id()`

### New column on `nt_food_logs`
- `photo_url TEXT` — stores path to uploaded meal photo in Supabase Storage

### New storage bucket: `meal-photos`
- Public bucket for meal images, RLS allowing authenticated users to upload/read

## UI Changes

### 1. Water / Hydration Tracker (new component: `HydrationTracker.tsx`)
Added to the **Dashboard** tab below Daily Targets:
- Visual water glass/bottle fill indicator showing current ml vs daily goal (from nutrition profile `hydration_goal_ml`)
- Quick-add buttons: +250ml, +500ml, +1L, custom amount
- Source selector (water, tea, coffee, juice, sports drink)
- Daily progress bar with percentage
- 7-day mini history bar chart

### 2. Meal Photo Logging (enhance existing Log Meal dialog + food log cards)
- Add camera/upload button to the Log Meal dialog
- Upload photo to `meal-photos` bucket, store URL in `nt_food_logs.photo_url`
- Show thumbnail on food log entries in the Dashboard Recent Entries list
- Click thumbnail to view full-size in a lightbox dialog

### 3. Weekly Nutrition Report (new component: `WeeklyReport.tsx`)
New **Reports** tab (6th tab) on the nutrition page:
- Auto-calculated weekly summary: avg daily calories, protein, carbs, fat, fiber
- Compliance score: % of days hitting targets
- Streak counter: consecutive days logging food
- Macro distribution pie chart (avg)
- Best/worst days highlighted
- Hydration weekly average
- All computed client-side from existing `nt_food_logs` data

### 4. Client Comparison Dashboard (new component: `ClientComparison.tsx`)
Visible when **no client is selected** (replaces the empty state):
- Table/grid of all active clients with their last 7 days averages
- Columns: Name, Avg Calories, Avg Protein, Compliance %, Last Logged, Hydration Avg
- Color-coded compliance badges (green >80%, yellow >50%, red <50%)
- Sort by any column
- Click a client row to select them

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/nutrition/HydrationTracker.tsx` | Water tracking UI with quick-add and history |
| `src/components/nutrition/WeeklyReport.tsx` | Weekly summary with charts and compliance |
| `src/components/nutrition/ClientComparison.tsx` | Multi-client overview dashboard |
| `src/components/nutrition/MealPhotoUpload.tsx` | Camera/upload component for meal photos |

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/personal-trainer/PersonalTrainerNutrition.tsx` | Add Reports tab, add HydrationTracker to Dashboard, add ClientComparison for no-client state, add photo to Log Meal dialog |
| `src/hooks/useNutrition.ts` | Add `useHydrationLogs`, `useLogHydration`, `useWeeklyReport`, `useClientNutritionSummary` hooks |

## Migration SQL

- Create `nt_hydration_logs` table with RLS
- Add `photo_url` column to `nt_food_logs`
- Create `meal-photos` storage bucket with policies

## Tab Layout (after changes)

```text
Dashboard | Food Search | Meal Plans | Goals | Profile | Reports
```

- Dashboard: Daily Targets + Hydration Tracker + AI Advice + Charts + Recent Logs (with photo thumbnails)
- Reports: Weekly Nutrition Report
- No client selected: Client Comparison Dashboard shown instead of tabs

