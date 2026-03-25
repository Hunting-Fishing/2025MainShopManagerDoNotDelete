

# Add Inspection & Activity Tracking to Septic Service Order Detail

## What We're Building

Transform the current single-view `SepticOrderDetail.tsx` into a **tabbed layout** with:
1. **Overview** tab — current content (customer, schedule, service details, financial, notes)
2. **Activity Log** tab — tracks every status change (pending → arrived → in_progress → completed) with timestamps and employee name
3. **Inspection** tab — digital inspection form tied to the service order, with system condition documentation, maintenance items, parts requests, customer remarks, and photo/video uploads
4. **Time & Materials** tab — arrival time, departure time, items/materials used, labor time for billing

## Database Changes

### Migration 1: `septic_order_status_log`

Tracks every status transition on a service order.

```sql
CREATE TABLE public.septic_order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  service_order_id UUID NOT NULL REFERENCES public.septic_service_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  changed_by_name TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
```

### Migration 2: `septic_order_time_entries`

Records arrival, departure, and labor time per visit.

```sql
CREATE TABLE public.septic_order_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  service_order_id UUID NOT NULL REFERENCES public.septic_service_orders(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.septic_employees(id),
  employee_name TEXT,
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  duration_minutes NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Migration 3: `septic_order_materials`

Tracks materials/parts used for billing.

```sql
CREATE TABLE public.septic_order_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  service_order_id UUID NOT NULL REFERENCES public.septic_service_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Migration 4: Extend `septic_inspections`

Add columns to support richer on-site inspection data linked to orders:

```sql
ALTER TABLE public.septic_inspections
  ADD COLUMN IF NOT EXISTS maintenance_items JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS parts_requested JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS work_performed TEXT,
  ADD COLUMN IF NOT EXISTS customer_remarks TEXT,
  ADD COLUMN IF NOT EXISTS inspection_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.septic_inspection_templates(id),
  ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS departed_at TIMESTAMPTZ;
```

All tables get RLS policies scoped to shop_id via profiles.

## Frontend Changes

### 1. Refactor `SepticOrderDetail.tsx` to tabbed layout

Convert the page to use `Tabs` with 4 tabs: Overview, Activity, Inspection, Time & Materials.

- **Overview** — existing cards (customer, schedule, service, financial, notes) moved into this tab
- **Activity** — new tab content component
- **Inspection** — new tab content component
- **Time & Materials** — new tab content component

### 2. New component: `SepticOrderActivityTab.tsx`

- Fetches `septic_order_status_log` for the order
- Displays a vertical timeline of status changes with timestamps, employee name, and notes
- Auto-logs status changes when the order status is updated from this page or from routes

### 3. New component: `SepticOrderInspectionTab.tsx`

- If a `septic_inspections` record exists for this `service_order_id`, display it
- If not, show a "Start Inspection" button that creates one
- Sections:
  - **Template selector** — pick from published `septic_inspection_templates` to load a form structure
  - **System Condition** — overall, tank, drain field, baffle, effluent filter (using existing columns)
  - **Maintenance Items** — add/remove list of items needing attention (stored in JSONB)
  - **Parts & Equipment Requests** — add/remove requested parts (stored in JSONB)
  - **Work Performed** — text area for what was done
  - **Customer Remarks** — text area for customer notes/concerns
  - **Photos** — upload/view inspection photos
  - **Notes** — general inspector notes

### 4. New component: `SepticOrderTimeMaterialsTab.tsx`

- **Time tracking**: Add arrival/departure entries per visit (employee, arrived_at, departed_at, auto-calculated duration)
- **Materials used**: Add line items (name, quantity, unit cost, total) for billing
- Summary totals at the bottom

### 5. Update route status changes to log to `septic_order_status_log`

In `SepticRoutes.tsx`, when `updateStopStatus` fires, also insert a record into `septic_order_status_log` with the previous/new status and current user info.

## Files to Create/Modify

| File | Action |
|---|---|
| Migration SQL | Create 3 new tables + alter `septic_inspections` |
| `src/pages/septic/SepticOrderDetail.tsx` | Refactor to tabbed layout |
| `src/components/septic/orders/SepticOrderOverviewTab.tsx` | Extract existing overview content |
| `src/components/septic/orders/SepticOrderActivityTab.tsx` | New — status change timeline |
| `src/components/septic/orders/SepticOrderInspectionTab.tsx` | New — digital inspection form |
| `src/components/septic/orders/SepticOrderTimeMaterialsTab.tsx` | New — time + materials tracking |
| `src/pages/septic/SepticRoutes.tsx` | Add status log insert on stop status change |
| `src/integrations/supabase/types.ts` | Update with new table types |

