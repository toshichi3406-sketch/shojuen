-- SHOJUEN WORKBOARD shared backend schema
-- Run in Supabase SQL editor after creating the project.
-- All application tables use RLS. Access is limited to authenticated users
-- explicitly present in app_users.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member','ai')),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  producer text,
  origin text,
  use_case text,
  color_note text,
  umami_note text,
  bitterness_note text,
  aroma_note text,
  cost text,
  standard_wholesale_price text,
  moq text,
  supply_status text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  name text not null,
  country text,
  category text,
  contact_name text,
  email text,
  phone text,
  instagram text,
  linkedin text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_prices (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null references public.customers(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  price numeric,
  currency text not null default 'JPY',
  unit text not null default 'kg',
  moq text,
  shipping_terms text,
  payment_terms text,
  effective_from date,
  effective_to date,
  is_current boolean not null default true,
  ai_locked boolean not null default true,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create unique index if not exists customer_prices_one_current
  on public.customer_prices(customer_id, product_id)
  where is_current = true;

create table if not exists public.work_items (
  id text primary key,
  title text not null,
  status text not null check (status in (
    'todo','prep','doing','external_wait','internal_wait','decision','hold','done'
  )),
  customer_id text references public.customers(id) on delete set null,
  work_type text,
  assignee text,
  priority text check (priority in ('低','中','高','緊急')),
  due_date date,
  next_action text,
  country text,
  origin_type text check (origin_type in ('Outbound','Inbound','Referral','Existing')),
  channel text,
  memo text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_item_products (
  work_item_id text not null references public.work_items(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  relation_type text not null default 'related' check (relation_type in ('related','proposed','sampled','won')),
  primary key (work_item_id, product_id, relation_type)
);

create table if not exists public.work_events (
  id uuid primary key default gen_random_uuid(),
  work_item_id text not null references public.work_items(id) on delete cascade,
  event_type text not null,
  event_date timestamptz not null default now(),
  channel text,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  title text not null,
  storage_path text not null,
  mime_type text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.is_app_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_users au where au.user_id = auth.uid()
  );
$$;

alter table public.app_users enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.customer_prices enable row level security;
alter table public.work_items enable row level security;
alter table public.work_item_products enable row level security;
alter table public.work_events enable row level security;
alter table public.product_documents enable row level security;

drop policy if exists "app users read app_users" on public.app_users;
create policy "app users read app_users" on public.app_users
for select using (public.is_app_user());

drop policy if exists "app users manage products" on public.products;
create policy "app users manage products" on public.products
for all using (public.is_app_user()) with check (public.is_app_user());

drop policy if exists "app users manage customers" on public.customers;
create policy "app users manage customers" on public.customers
for all using (public.is_app_user()) with check (public.is_app_user());

drop policy if exists "app users manage customer_prices" on public.customer_prices;
create policy "app users manage customer_prices" on public.customer_prices
for all using (public.is_app_user()) with check (public.is_app_user());

drop policy if exists "app users manage work_items" on public.work_items;
create policy "app users manage work_items" on public.work_items
for all using (public.is_app_user()) with check (public.is_app_user());

drop policy if exists "app users manage work_item_products" on public.work_item_products;
create policy "app users manage work_item_products" on public.work_item_products
for all using (public.is_app_user()) with check (public.is_app_user());

drop policy if exists "app users manage work_events" on public.work_events;
create policy "app users manage work_events" on public.work_events
for all using (public.is_app_user()) with check (public.is_app_user());

drop policy if exists "app users manage product_documents" on public.product_documents;
create policy "app users manage product_documents" on public.product_documents
for all using (public.is_app_user()) with check (public.is_app_user());

-- Private storage bucket for certificates/spec sheets.
insert into storage.buckets (id, name, public)
values ('workboard-private', 'workboard-private', false)
on conflict (id) do update set public = false;

drop policy if exists "app users read workboard files" on storage.objects;
create policy "app users read workboard files" on storage.objects
for select using (
  bucket_id = 'workboard-private' and public.is_app_user()
);

drop policy if exists "app users upload workboard files" on storage.objects;
create policy "app users upload workboard files" on storage.objects
for insert with check (
  bucket_id = 'workboard-private' and public.is_app_user()
);

drop policy if exists "app users update workboard files" on storage.objects;
create policy "app users update workboard files" on storage.objects
for update using (
  bucket_id = 'workboard-private' and public.is_app_user()
) with check (
  bucket_id = 'workboard-private' and public.is_app_user()
);

drop policy if exists "app users delete workboard files" on storage.objects;
create policy "app users delete workboard files" on storage.objects
for delete using (
  bucket_id = 'workboard-private' and public.is_app_user()
);

-- Security rule for AI-facing integrations:
-- Never let an AI infer commercial terms from historical messages.
-- Only rows in customer_prices where is_current=true and ai_locked=true
-- are authoritative commercial terms.
