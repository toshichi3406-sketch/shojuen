-- Add shipping certainty stage so estimated, quoted, and actual freight do not get mixed.

alter table public.shipping_rates
  add column if not exists rate_stage text
    check (rate_stage is null or rate_stage in ('estimate','quoted','actual')),
  add column if not exists shipment_date date,
  add column if not exists actual_weight_kg numeric
    check (actual_weight_kg is null or actual_weight_kg >= 0),
  add column if not exists customer_id text references public.customers(id) on delete set null;

create index if not exists shipping_rates_stage_idx
  on public.shipping_rates(rate_stage);

comment on column public.shipping_rates.rate_stage is
  'estimate=概算, quoted=顧客へ提示した送料, actual=発送後に確定した実績送料';

comment on column public.shipping_rates.actual_weight_kg is
  'Actual packed/shipped weight. Mainly used for actual freight records.';

comment on column public.shipping_rates.shipment_date is
  'Shipment date when the freight record is an actual shipment.';
