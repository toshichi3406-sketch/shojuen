-- Optional sales attribution. Existing cases remain unclassified.
begin;
alter table public.sales_cases
  add column if not exists origin_type text
    check (origin_type in ('Outbound', 'Inbound', 'Referral', 'Existing')),
  add column if not exists channel text
    check (channel in ('Email', 'Instagram DM', 'Threads', 'LinkedIn', 'Web', '電話', '展示会', '紹介', 'その他'));
comment on column public.sales_cases.origin_type is
  'Original source of the opportunity. NULL means unknown; do not infer from tasks.';
comment on column public.sales_cases.channel is
  'Original channel of the opportunity. Later contacts are recorded in work_events.';
notify pgrst, 'reload schema';
commit;
