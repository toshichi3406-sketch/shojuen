-- Preserve original records, links, events, prices and private attachments.
begin;

alter table public.work_items add column if not exists deleted_at timestamptz;
alter table public.customers add column if not exists deleted_at timestamptz;
alter table public.products add column if not exists deleted_at timestamptz;
alter table public.sales_cases add column if not exists deleted_at timestamptz;
alter table public.orders add column if not exists deleted_at timestamptz;

create or replace function public.guard_workboard_trash()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin
  if TG_OP = 'DELETE' then
    raise exception '完全削除は無効です。ゴミ箱へ移動してください。';
  end if;
  if OLD.deleted_at is distinct from NEW.deleted_at then
    if not public.is_app_user() then
      raise exception 'ゴミ箱を操作する権限がありません。';
    end if;
    if TG_TABLE_NAME in ('sales_cases', 'orders') and not public.is_app_admin() then
      raise exception '営業案件・受注のゴミ箱操作は管理者のみ可能です。';
    end if;
  elsif OLD.deleted_at is not null then
    raise exception 'ゴミ箱内のデータは、復元してから編集してください。';
  end if;
  return NEW;
end;
$$;

do $$
declare target_table text;
begin
  foreach target_table in array array['work_items', 'customers', 'products', 'sales_cases', 'orders'] loop
    execute format('drop trigger if exists workboard_trash_guard on public.%I', target_table);
    execute format('create trigger workboard_trash_guard before update or delete on public.%I for each row execute function public.guard_workboard_trash()', target_table);
    execute format('create index if not exists %I on public.%I (deleted_at) where deleted_at is not null', target_table || '_trash_idx', target_table);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
commit;
