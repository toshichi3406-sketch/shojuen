-- Keep original activity history append-only; store its editable case link separately.
begin;
create table if not exists public.work_event_sales_links (
  event_id uuid primary key references public.work_events(id) on delete cascade,
  sales_case_id uuid references public.sales_cases(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists work_event_sales_links_case_idx
  on public.work_event_sales_links(sales_case_id);
alter table public.work_event_sales_links enable row level security;
drop policy if exists "event sales links select" on public.work_event_sales_links;
drop policy if exists "event sales links insert" on public.work_event_sales_links;
drop policy if exists "event sales links update" on public.work_event_sales_links;
create policy "event sales links select" on public.work_event_sales_links
  for select to authenticated using (public.is_app_user());
create policy "event sales links insert" on public.work_event_sales_links
  for insert to authenticated with check (public.is_app_user());
create policy "event sales links update" on public.work_event_sales_links
  for update to authenticated using (public.is_app_user()) with check (public.is_app_user());
grant select, insert, update on public.work_event_sales_links to authenticated;
comment on table public.work_event_sales_links is
  'Editable case association only. Original activity dates, notes and sources remain append-only. A null case explicitly removes an association.';
commit;
