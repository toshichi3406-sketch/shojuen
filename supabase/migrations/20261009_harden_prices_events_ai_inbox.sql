-- SHOJUEN WORKBOARD hardening + AI import inbox
-- 2026-10-09
-- Run once in Supabase SQL Editor.
-- Safe intent: preserve existing business data; price/event history becomes append-only.

begin;

-- 1) App-user lifecycle + roles.
alter table public.app_users
  add column if not exists is_active boolean not null default true;

alter table public.app_users
  drop constraint if exists app_users_role_check;

alter table public.app_users
  add constraint app_users_role_check
  check (role in ('owner','admin','member','ai'));

create or replace function public.is_app_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.app_users au
    where au.user_id = auth.uid()
      and au.is_active = true
  );
$$;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.app_users au
    where au.user_id = auth.uid()
      and au.is_active = true
      and au.role in ('owner','admin')
  );
$$;

-- 2) Price history is append-only.
-- Keep legacy columns for compatibility, but current price is derived from history.
drop index if exists public.customer_prices_one_current;

alter table public.customer_prices
  alter column effective_from set default current_date;

drop policy if exists "app users manage customer_prices" on public.customer_prices;
drop policy if exists "cp_select" on public.customer_prices;
drop policy if exists "cp_insert" on public.customer_prices;

create policy "cp_select"
on public.customer_prices
for select
to authenticated
using (public.is_app_user());

create policy "cp_insert"
on public.customer_prices
for insert
to authenticated
with check (
  public.is_app_admin()
  and ai_locked = true
);

-- No UPDATE / DELETE policy: historical commercial terms cannot be rewritten.

create or replace view public.customer_prices_current
with (security_invoker = true)
as
select distinct on (customer_id, product_id)
  id,
  customer_id,
  product_id,
  price,
  currency,
  unit,
  moq,
  shipping_terms,
  payment_terms,
  effective_from,
  effective_to,
  is_current,
  ai_locked,
  approved_by,
  approved_at,
  note,
  created_at
from public.customer_prices
order by
  customer_id,
  product_id,
  coalesce(effective_from, created_at::date) desc,
  created_at desc,
  id desc;

grant select on public.customer_prices_current to authenticated;

-- 3) Work history is append-only.
drop policy if exists "app users manage work_events" on public.work_events;
drop policy if exists "work_events_select" on public.work_events;
drop policy if exists "work_events_insert" on public.work_events;

create policy "work_events_select"
on public.work_events
for select
to authenticated
using (public.is_app_user());

create policy "work_events_insert"
on public.work_events
for insert
to authenticated
with check (public.is_app_user());

-- No UPDATE / DELETE policy.

-- 4) Make existing application policies explicitly authenticated.
drop policy if exists "app users read app_users" on public.app_users;
create policy "app users read app_users"
on public.app_users
for select
to authenticated
using (public.is_app_user());

drop policy if exists "app users manage products" on public.products;
create policy "app users manage products"
on public.products
for all
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

drop policy if exists "app users manage customers" on public.customers;
create policy "app users manage customers"
on public.customers
for all
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

drop policy if exists "app users manage work_items" on public.work_items;
create policy "app users manage work_items"
on public.work_items
for all
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

drop policy if exists "app users manage work_item_products" on public.work_item_products;
create policy "app users manage work_item_products"
on public.work_item_products
for all
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

drop policy if exists "app users manage product_documents" on public.product_documents;
create policy "app users manage product_documents"
on public.product_documents
for all
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

-- 5) AI import inbox.
create table if not exists public.ai_import_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('chatgpt','claude','manual','other')),
  source_session_id text,
  session_title text,
  source_timestamp timestamptz,
  summary text,
  raw_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending','reviewing','processed','rejected')),
  submitted_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_import_candidates (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.ai_import_batches(id) on delete cascade,
  candidate_type text not null
    check (candidate_type in (
      'new_work',
      'work_update',
      'work_event',
      'customer_update',
      'product_update',
      'price_candidate',
      'decision'
    )),
  target_id text,
  title text,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','needs_edit')),
  decision_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ai_import_batches enable row level security;
alter table public.ai_import_candidates enable row level security;

drop policy if exists "ai batches select" on public.ai_import_batches;
drop policy if exists "ai batches insert" on public.ai_import_batches;
drop policy if exists "ai batches update admin" on public.ai_import_batches;

create policy "ai batches select"
on public.ai_import_batches
for select
to authenticated
using (public.is_app_user());

create policy "ai batches insert"
on public.ai_import_batches
for insert
to authenticated
with check (public.is_app_user());

create policy "ai batches update admin"
on public.ai_import_batches
for update
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "ai candidates select" on public.ai_import_candidates;
drop policy if exists "ai candidates insert" on public.ai_import_candidates;
drop policy if exists "ai candidates update admin" on public.ai_import_candidates;

create policy "ai candidates select"
on public.ai_import_candidates
for select
to authenticated
using (public.is_app_user());

create policy "ai candidates insert"
on public.ai_import_candidates
for insert
to authenticated
with check (public.is_app_user());

create policy "ai candidates update admin"
on public.ai_import_candidates
for update
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

grant select on public.app_users to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert on public.customer_prices to authenticated;
revoke update, delete on public.customer_prices from authenticated;
grant select, insert, update, delete on public.work_items to authenticated;
grant select, insert, update, delete on public.work_item_products to authenticated;
grant select, insert on public.work_events to authenticated;
revoke update, delete on public.work_events from authenticated;
grant select, insert, update, delete on public.product_documents to authenticated;
grant select, insert, update on public.ai_import_batches to authenticated;
grant select, insert, update on public.ai_import_candidates to authenticated;

commit;
