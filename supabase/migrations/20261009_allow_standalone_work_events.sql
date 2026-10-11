-- Allow historical WORKBOARD events to exist before a work card is created.
-- Safe migration: existing event links remain untouched.

alter table public.work_events
  alter column work_item_id drop not null;

alter table public.work_events
  add column if not exists counterparty_name text,
  add column if not exists counterparty_email text,
  add column if not exists direction text,
  add column if not exists source text,
  add column if not exists source_candidate_id uuid references public.ai_import_candidates(id);

create unique index if not exists work_events_source_candidate_unique
  on public.work_events(source_candidate_id)
  where source_candidate_id is not null;

comment on column public.work_events.work_item_id is
  'Optional during historical import. Can be linked to a work item later.';
comment on column public.work_events.source_candidate_id is
  'AI import candidate that produced this event; prevents duplicate promotion.';
