## Welding Sales Rep Workspace

Replace the thin "Sales Pipeline" page at `/welding/sales` with a full-featured sales-rep workspace built around the data the rep actually manages: clients, inbound requests, follow-ups, quotes, deposits, and time spent.

### Layout

Tabbed page inside `WeldingAdminLayout` with a KPI strip on top and 6 tabs.

```text
┌────────────────────────────────────────────────────────────┐
│ KPIs:  Open Leads | Follow-ups Today | Quotes Sent | Won $ │
│        Deposits Held | Time Logged (week)                  │
├────────────────────────────────────────────────────────────┤
│ [Pipeline] [Clients] [Requests] [Quotes] [Follow-ups]      │
│ [Deposits] [Time]                                          │
└────────────────────────────────────────────────────────────┘
```

### Tabs

1. **Pipeline (Kanban)** — drag activities across columns: Open → Contacted → Quoted → Won / Lost. Cards show client, value, next follow-up, category tag. Click to edit (existing dialog, expanded).
2. **Clients** — searchable list of `welding_customers` joined with rollups (open quotes, total billed, deposit on file, last contact). Categorize via a new `category` and `tags[]` column (Lead / Active / VIP / Cold + freeform tags). Click row → drawer with full history (interactions, quotes, invoices, deposits, time).
3. **Requests** — inbound items from `welding_contact_messages` + manually-added activities of type `inquiry`. Convert a request → client and/or → quote in one click.
4. **Quotes** — list of `welding_quotes` filtered to current sales rep (`created_by = auth.uid()` when present). Status filter, send/follow-up buttons, conversion-to-invoice indicator.
5. **Follow-ups** — agenda view (Overdue / Today / This week / Later) sourced from `welding_sales_activities.follow_up_date`. Mark complete (sets status), reschedule, snooze.
6. **Deposits** — list of recorded deposits with client, amount, date, linked quote/invoice, status (Held / Applied / Refunded). New table required.
7. **Time** — per-client time entries (visit, call, quoting, admin) with date, minutes, billable flag. Weekly summary by client and category. New table required.

### Database changes (migration)

Add categorization + new tables. All RLS scoped via `shop_id = public.get_current_user_shop_id()` (per Core rules), idempotent `IF NOT EXISTS` / `DO` blocks.

```sql
-- Categorize clients
ALTER TABLE welding_customers
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_rep uuid;

-- Sales activity enrichments
ALTER TABLE welding_sales_activities
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS estimated_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pipeline_order int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Deposits
CREATE TABLE IF NOT EXISTS welding_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL,
  customer_id uuid REFERENCES welding_customers(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES welding_quotes(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES welding_invoices(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  payment_method text,
  received_date date DEFAULT now(),
  status text DEFAULT 'held',  -- held | applied | refunded
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time tracking
CREATE TABLE IF NOT EXISTS welding_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL,
  customer_id uuid REFERENCES welding_customers(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES welding_quotes(id) ON DELETE SET NULL,
  user_id uuid,
  category text DEFAULT 'general', -- visit | call | quoting | admin | travel
  entry_date date DEFAULT now(),
  minutes int NOT NULL,
  billable boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

RLS enabled with shop-scoped policies for select/insert/update/delete on both new tables.

### Files

- **Edit** `src/pages/welding/WeldingAdminSales.tsx` — convert to tabbed shell + KPI strip.
- **New** `src/components/welding/sales/`
  - `SalesKpiStrip.tsx`
  - `PipelineBoard.tsx` (kanban)
  - `ClientsTab.tsx` + `ClientDrawer.tsx`
  - `RequestsTab.tsx`
  - `QuotesTab.tsx`
  - `FollowUpsTab.tsx`
  - `DepositsTab.tsx` + `DepositDialog.tsx`
  - `TimeTab.tsx` + `TimeEntryDialog.tsx`
  - `ActivityDialog.tsx` (extracted/expanded from current inline form)
- **New** `src/hooks/welding/useSalesData.ts` — react-query hooks for each dataset.
- **New migration** `supabase/migrations/<ts>_welding_sales_workspace.sql`.

### Behaviour rules

- All data live from Supabase, scoped by `shopId` via existing `useShopId` hook (no mock data).
- Empty states with CTA per tab; loading skeletons; toast on save/error.
- Mobile: tabs collapse into a horizontal scroll bar; kanban becomes vertical stacked columns; cards are tap-friendly (≥44px hit area).
- Follow-up overdue cards keep the existing amber border treatment.
- Pipeline drag uses `@dnd-kit/core` (already in project) — fallback to status `Select` on touch.
- Deposit "Apply to invoice" updates `welding_invoices.amount_paid` semantics already present (and inserts a `welding_payments` row).
- Time entries roll up weekly per client; billable totals feed a future invoice line (out of scope here, just stored).

### Out of scope

- Email/SMS sending to clients (uses existing messages module).
- Commission calculations.
- Calendar sync (uses existing welding calendar page).
