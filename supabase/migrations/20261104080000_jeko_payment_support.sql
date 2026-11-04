alter table public.contributions
  add column if not exists payment_provider_request_id text;

create unique index if not exists contributions_provider_request_id_unique
  on public.contributions(payment_provider_request_id)
  where payment_provider_request_id is not null;

create table if not exists public.payment_request_limits (
  ip_hash text primary key check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count > 0)
);

alter table public.payment_request_limits enable row level security;
revoke all on public.payment_request_limits from public, anon, authenticated;
grant select, insert, update, delete on public.payment_request_limits to service_role;

create or replace function public.claim_payment_request(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt_count integer;
begin
  if p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'INVALID_RATE_LIMIT_KEY';
  end if;

  insert into public.payment_request_limits(ip_hash, window_started_at, attempt_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    window_started_at = case
      when public.payment_request_limits.window_started_at <= now() - interval '10 minutes' then now()
      else public.payment_request_limits.window_started_at
    end,
    attempt_count = case
      when public.payment_request_limits.window_started_at <= now() - interval '10 minutes' then 1
      else public.payment_request_limits.attempt_count + 1
    end
  returning attempt_count into v_attempt_count;

  return v_attempt_count <= 5;
end;
$$;

revoke all on function public.claim_payment_request(text) from public, anon, authenticated;
grant execute on function public.claim_payment_request(text) to service_role;
