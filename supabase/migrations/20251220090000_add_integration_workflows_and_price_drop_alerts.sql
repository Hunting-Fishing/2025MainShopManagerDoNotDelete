-- Add integration workflows and price drop alerts

create table if not exists public.integration_workflows (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  integration_id uuid not null references public.shop_integrations(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null,
  is_active boolean not null default true,
  last_run_at timestamptz,
  success_rate numeric(5, 2),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_workflow_runs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  workflow_id uuid not null references public.integration_workflows(id) on delete cascade,
  status text not null,
  duration_ms integer,
  records_synced integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists integration_workflows_integration_id_idx
  on public.integration_workflows (integration_id);
create index if not exists integration_workflows_shop_id_idx
  on public.integration_workflows (shop_id);
create index if not exists integration_workflow_runs_workflow_id_idx
  on public.integration_workflow_runs (workflow_id);
create index if not exists integration_workflow_runs_shop_id_idx
  on public.integration_workflow_runs (shop_id);
create index if not exists integration_workflow_runs_started_at_idx
  on public.integration_workflow_runs (started_at);

alter table public.integration_workflows enable row level security;
alter table public.integration_workflow_runs enable row level security;

create policy "integration_workflows_read" on public.integration_workflows
  for select
  using (shop_id = public.get_current_user_shop_id());

create policy "integration_workflows_write" on public.integration_workflows
  for insert
  with check (shop_id = public.get_current_user_shop_id());

create policy "integration_workflows_update" on public.integration_workflows
  for update
  using (shop_id = public.get_current_user_shop_id())
  with check (shop_id = public.get_current_user_shop_id());

create policy "integration_workflows_delete" on public.integration_workflows
  for delete
  using (shop_id = public.get_current_user_shop_id());

create policy "integration_workflow_runs_read" on public.integration_workflow_runs
  for select
  using (shop_id = public.get_current_user_shop_id());

create policy "integration_workflow_runs_write" on public.integration_workflow_runs
  for insert
  with check (shop_id = public.get_current_user_shop_id());

create policy "integration_workflow_runs_update" on public.integration_workflow_runs
  for update
  using (shop_id = public.get_current_user_shop_id())
  with check (shop_id = public.get_current_user_shop_id());

create policy "integration_workflow_runs_delete" on public.integration_workflow_runs
  for delete
  using (shop_id = public.get_current_user_shop_id());

create table if not exists public.price_drop_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  target_price numeric(10, 2) not null,
  current_price numeric(10, 2) not null,
  is_active boolean not null default true,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists price_drop_alerts_user_id_idx
  on public.price_drop_alerts (user_id);
create index if not exists price_drop_alerts_product_id_idx
  on public.price_drop_alerts (product_id);

alter table public.price_drop_alerts enable row level security;

create policy "price_drop_alerts_read" on public.price_drop_alerts
  for select
  using (user_id = auth.uid());

create policy "price_drop_alerts_write" on public.price_drop_alerts
  for insert
  with check (user_id = auth.uid());

create policy "price_drop_alerts_update" on public.price_drop_alerts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "price_drop_alerts_delete" on public.price_drop_alerts
  for delete
  using (user_id = auth.uid());
