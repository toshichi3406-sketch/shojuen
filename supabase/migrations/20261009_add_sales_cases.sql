-- SHOJUEN WORKBOARD: sales case foundation
-- Separates long-lived sales opportunities from individual work items.
-- Safe additive migration: existing work items/events keep working without a case link.

begin;

create table if not exists public.sales_cases (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null references public.customers(id) on delete restrict,
  title text not null,
  theme text not null,
  case_type text not null default 'new_business'
    check (case_type in ('new_business','existing_followup')),
  stage text not null default 'uncontacted'
    check (stage in (
      'uncontacted',
      'initial_sent',
      'replied',
      'qualifying',
      'quoted',
      'sample_requested',
      'sample_sent',
      'considering',
      'won',
      'lost',
      'hold'
    )),
  heat text not null default 'B'
    check (heat in ('A','B','C')),
  next_follow_up_date date,
  next_action text,
  assignee text not null,
  last_contact_at timestamptz,
  close_reason text,
  close_note text,
  won_at timestamptz,
  closed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_case_products (
  sales_case_id uuid not null references public.sales_cases(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (sales_case_id, product_id)
);

alter table public.work_items
  add column if not exists sales_case_id uuid
    references public.sales_cases(id) on delete set null;

alter table public.work_events
  add column if not exists sales_case_id uuid
    references public.sales_cases(id) on delete set null;

create index if not exists sales_cases_customer_idx
  on public.sales_cases(customer_id);

create index if not exists sales_cases_stage_idx
  on public.sales_cases(stage);

create index if not exists sales_cases_heat_followup_idx
  on public.sales_cases(heat, next_follow_up_date);

create index if not exists sales_cases_assignee_idx
  on public.sales_cases(assignee);

create index if not exists sales_case_products_product_idx
  on public.sales_case_products(product_id);

create index if not exists work_items_sales_case_idx
  on public.work_items(sales_case_id);

create index if not exists work_events_sales_case_idx
  on public.work_events(sales_case_id);

alter table public.sales_cases enable row level security;
alter table public.sales_case_products enable row level security;

drop policy if exists "sales cases select" on public.sales_cases;
drop policy if exists "sales cases insert" on public.sales_cases;
drop policy if exists "sales cases update" on public.sales_cases;
drop policy if exists "sales cases delete admin" on public.sales_cases;

create policy "sales cases select"
on public.sales_cases
for select
to authenticated
using (public.is_app_user());

create policy "sales cases insert"
on public.sales_cases
for insert
to authenticated
with check (public.is_app_user());

create policy "sales cases update"
on public.sales_cases
for update
to authenticated
using (public.is_app_user())
with check (public.is_app_user());

create policy "sales cases delete admin"
on public.sales_cases
for delete
to authenticated
using (public.is_app_admin());

drop policy if exists "sales case products select" on public.sales_case_products;
drop policy if exists "sales case products insert" on public.sales_case_products;
drop policy if exists "sales case products delete" on public.sales_case_products;

create policy "sales case products select"
on public.sales_case_products
for select
to authenticated
using (public.is_app_user());

create policy "sales case products insert"
on public.sales_case_products
for insert
to authenticated
with check (public.is_app_user());

create policy "sales case products delete"
on public.sales_case_products
for delete
to authenticated
using (public.is_app_user());

grant select, insert, update on public.sales_cases to authenticated;
grant delete on public.sales_cases to authenticated;
grant select, insert, delete on public.sales_case_products to authenticated;

comment on table public.sales_cases is
  'Long-lived sales opportunities. One customer can have multiple cases by proposal theme.';

comment on table public.sales_case_products is
  'Products proposed in a sales case. No single primary product is required.';

comment on column public.work_items.sales_case_id is
  'Optional parent sales case for this operational task.';

comment on column public.work_events.sales_case_id is
  'Optional parent sales case for this activity/event.';

commit;
