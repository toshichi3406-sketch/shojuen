-- SHOJUEN WORKBOARD: order history foundation
-- Stores confirmed first/repeat orders separately from sales opportunities.
-- Additive only: no existing tables are removed or rewritten.

begin;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null references public.customers(id) on delete restrict,
  sales_case_id uuid references public.sales_cases(id) on delete set null,
  order_type text not null default 'repeat'
    check (order_type in ('first','repeat')),
  order_status text not null default 'confirmed'
    check (order_status in ('confirmed','shipped','completed','cancelled')),
  order_date date not null default current_date,
  currency text not null default 'JPY',
  shipping_amount numeric(14,2),
  total_amount numeric(14,2),
  external_order_ref text,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null default 'kg',
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_amount numeric(14,2) not null check (line_amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_date_idx
  on public.orders(customer_id, order_date desc);

create index if not exists orders_sales_case_idx
  on public.orders(sales_case_id);

create index if not exists orders_type_idx
  on public.orders(order_type);

create index if not exists orders_status_idx
  on public.orders(order_status);

create index if not exists order_items_order_idx
  on public.order_items(order_id);

create index if not exists order_items_product_idx
  on public.order_items(product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders select" on public.orders;
drop policy if exists "orders insert" on public.orders;
drop policy if exists "orders update" on public.orders;
drop policy if exists "orders delete admin" on public.orders;

create policy "orders select"
on public.orders
for select
to authenticated
using (public.is_app_user());

create policy "orders insert"
on public.orders
for insert
to authenticated
with check (public.is_app_user());

create policy "orders update"
on public.orders
for update
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

create policy "orders delete admin"
on public.orders
for delete
to authenticated
using (public.is_app_admin());

drop policy if exists "order items select" on public.order_items;
drop policy if exists "order items insert" on public.order_items;
drop policy if exists "order items update" on public.order_items;
drop policy if exists "order items delete" on public.order_items;

create policy "order items select"
on public.order_items
for select
to authenticated
using (public.is_app_user());

create policy "order items insert"
on public.order_items
for insert
to authenticated
with check (public.is_app_user());

create policy "order items update"
on public.order_items
for update
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

create policy "order items delete"
on public.order_items
for delete
to authenticated
using (public.is_app_user());

grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;

comment on table public.orders is
  'Confirmed first/repeat orders for customer history and KPI reporting.';

comment on table public.order_items is
  'Product-level quantity and unit-price snapshot for each order.';

comment on column public.orders.sales_case_id is
  'Optional sales case that produced or is associated with this order.';

commit;
