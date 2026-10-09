-- Product cost history and processing/packaging cost components.
-- Keep base purchase cost separate from additional work costs.

create table if not exists public.product_costs (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  cost_type text not null check (cost_type in (
    'base_purchase',
    'processing',
    'packaging',
    'labeling',
    'inspection',
    'domestic_freight',
    'other'
  )),
  label text not null,
  amount numeric not null check (amount >= 0),
  currency text not null default 'JPY',
  unit text not null default 'kg',
  quantity_basis numeric,
  effective_from date,
  effective_to date,
  supplier_or_vendor text,
  note text,
  ai_locked boolean not null default true,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.product_costs enable row level security;

drop policy if exists product_costs_select on public.product_costs;
drop policy if exists product_costs_insert on public.product_costs;

create policy product_costs_select
  on public.product_costs
  for select
  to authenticated
  using (public.is_app_user());

create policy product_costs_insert
  on public.product_costs
  for insert
  to authenticated
  with check (public.is_app_admin() and ai_locked = true);

grant select, insert on public.product_costs to authenticated;
revoke update, delete on public.product_costs from authenticated;

create index if not exists product_costs_product_idx
  on public.product_costs(product_id);

create index if not exists product_costs_effective_idx
  on public.product_costs(product_id, effective_from desc);

comment on table public.product_costs is
  'Append-only cost history. Base purchase cost and processing/packaging costs are stored separately; AI must not overwrite approved costs.';
