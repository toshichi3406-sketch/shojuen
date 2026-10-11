-- Separate shipping/freight reference rates from product/customer prices.
-- Shipping is logistics data, not a customer product price.

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  origin text,
  destination text not null,
  carrier text,
  service text,
  weight_from_kg numeric,
  weight_to_kg numeric,
  size_class text,
  price numeric not null,
  currency text not null default 'JPY',
  transit_time text,
  terms text,
  source text,
  verified_at timestamptz,
  note text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipping_rates enable row level security;

drop policy if exists shipping_rates_select on public.shipping_rates;
create policy shipping_rates_select
  on public.shipping_rates
  for select
  to authenticated
  using (public.is_app_user());

drop policy if exists shipping_rates_insert on public.shipping_rates;
create policy shipping_rates_insert
  on public.shipping_rates
  for insert
  to authenticated
  with check (public.is_app_admin());

drop policy if exists shipping_rates_update on public.shipping_rates;
create policy shipping_rates_update
  on public.shipping_rates
  for update
  to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

grant select, insert, update on public.shipping_rates to authenticated;
revoke delete on public.shipping_rates from authenticated;

create index if not exists shipping_rates_destination_idx
  on public.shipping_rates(destination);

create index if not exists shipping_rates_carrier_service_idx
  on public.shipping_rates(carrier, service);

comment on table public.shipping_rates is
  'Verified logistics/freight reference rates. Keep separate from product and customer prices. AI may propose rates but authoritative rows require owner/admin approval.';
