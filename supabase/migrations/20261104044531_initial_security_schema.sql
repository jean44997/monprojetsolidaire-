create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 100)
);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(left(new.raw_user_meta_data ->> 'display_name', 100), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function public.create_profile_for_user();

create table if not exists public.fundraisers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null,
  description text not null,
  category text not null,
  goal bigint not null,
  minimum bigint not null default 0,
  free_amount boolean not null default false,
  deadline date,
  visibility text not null default 'Publique',
  beneficiary text not null default 'Moi-même',
  beneficiary_name text not null default '',
  cover text not null default '',
  organizer text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint fundraisers_title_length check (char_length(title) between 3 and 90),
  constraint fundraisers_description_length check (char_length(description) between 3 and 5000),
  constraint fundraisers_goal_positive check (goal > 0),
  constraint fundraisers_minimum_valid check ((free_amount and minimum = 0) or (not free_amount and minimum > 0)),
  constraint fundraisers_visibility_valid check (visibility in ('Publique', 'Privée')),
  constraint fundraisers_status_valid check (status in ('active', 'closed')),
  constraint fundraisers_slug_safe check (slug ~ '^[a-z0-9-]{3,80}$')
);

create index if not exists fundraisers_owner_created_idx on public.fundraisers(owner_id, created_at desc) where deleted_at is null;
create index if not exists fundraisers_public_created_idx on public.fundraisers(created_at desc) where visibility = 'Publique' and deleted_at is null;

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers(id) on delete restrict,
  amount bigint not null check (amount > 0),
  currency text not null default 'XOF' check (currency = 'XOF'),
  contributor_user_id uuid references auth.users(id) on delete set null,
  public_name text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  payment_provider text,
  provider_reference text unique,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint contributions_public_name_length check (char_length(public_name) <= 100)
);

create index if not exists contributions_fundraiser_status_idx on public.contributions(fundraiser_id, status, created_at desc);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  amount bigint not null check (amount > 0),
  destination text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint withdrawals_destination_length check (char_length(destination) between 5 and 160)
);

create index if not exists withdrawals_fundraiser_status_idx on public.withdrawals(fundraiser_id, status, created_at desc);
create index if not exists withdrawals_owner_created_idx on public.withdrawals(owner_id, created_at desc);

create table if not exists public.withdrawal_intents (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null check (amount > 0),
  destination text not null check (char_length(destination) between 5 and 160),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  consumed_at timestamptz,
  withdrawal_id uuid references public.withdrawals(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.fundraisers enable row level security;
alter table public.contributions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.withdrawal_intents enable row level security;

create policy "profile owners can read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profile owners can update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "public fundraisers and owners can read" on public.fundraisers
  for select to anon, authenticated
  using (deleted_at is null and (visibility = 'Publique' or owner_id = (select auth.uid())));
create policy "authenticated owners can create fundraisers" on public.fundraisers
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'active' and deleted_at is null);
create policy "owners can update active fundraisers" on public.fundraisers
  for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'active' and deleted_at is null)
  with check (owner_id = (select auth.uid()) and deleted_at is null);
create policy "owners can delete only closed fundraisers without money records" on public.fundraisers
  for delete to authenticated
  using (owner_id = (select auth.uid()) and status = 'closed'
    and not exists (select 1 from public.contributions c where c.fundraiser_id = id)
    and not exists (select 1 from public.withdrawals w where w.fundraiser_id = id));

create policy "organizers can read fundraiser contributions" on public.contributions
  for select to authenticated using (
    exists (select 1 from public.fundraisers f where f.id = fundraiser_id and f.owner_id = (select auth.uid()))
  );
create policy "organizers can read fundraiser withdrawals" on public.withdrawals
  for select to authenticated using (owner_id = (select auth.uid()));

revoke all on public.profiles, public.fundraisers, public.contributions, public.withdrawals, public.withdrawal_intents from anon, authenticated;
grant select on public.profiles, public.fundraisers to authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.fundraisers to authenticated;
grant select on public.fundraisers to anon;
grant select on public.contributions, public.withdrawals to authenticated;

create or replace function public.enforce_fundraiser_owner_update()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.owner_id <> old.owner_id then raise exception 'OWNER_CANNOT_CHANGE'; end if;
  if old.status = 'closed' then raise exception 'FUNDRAISER_CLOSED'; end if;
  if new.status not in ('active', 'closed') then raise exception 'INVALID_STATUS'; end if;
  if new.goal < coalesce((select sum(c.amount) from public.contributions c where c.fundraiser_id = old.id and c.status = 'confirmed'), 0) then
    raise exception 'GOAL_BELOW_CONFIRMED_CONTRIBUTIONS';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_fundraiser_owner_update_trigger on public.fundraisers;
create trigger enforce_fundraiser_owner_update_trigger before update on public.fundraisers
for each row execute function public.enforce_fundraiser_owner_update();

create or replace view public.public_fundraiser_catalog with (security_invoker = false) as
select f.id, f.slug, f.title, f.description, f.category, f.goal, f.minimum,
       f.free_amount, f.deadline, f.visibility, f.beneficiary, f.beneficiary_name,
       f.cover, f.organizer, f.status, f.created_at,
       coalesce(sum(c.amount) filter (where c.status = 'confirmed'), 0)::bigint as collected_total,
       count(c.id) filter (where c.status = 'confirmed')::integer as contribution_count
from public.fundraisers f
left join public.contributions c on c.fundraiser_id = f.id
where f.visibility = 'Publique' and f.deleted_at is null
group by f.id;

create or replace view public.public_contribution_feed with (security_invoker = false) as
select c.id, c.fundraiser_id, c.amount,
       coalesce(nullif(c.public_name, ''), 'Contributeur anonyme') as public_name,
       c.created_at
from public.contributions c
join public.fundraisers f on f.id = c.fundraiser_id
where f.visibility = 'Publique' and f.deleted_at is null and c.status = 'confirmed';

grant select on public.public_fundraiser_catalog, public.public_contribution_feed to anon, authenticated;

create or replace function public.prepare_withdrawal(p_fundraiser_id uuid, p_amount bigint, p_destination text)
returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_available bigint;
  v_reserved bigint;
  v_intent_id uuid;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_amount is null or p_amount <= 0 or p_destination is null or char_length(trim(p_destination)) not between 5 and 160 then
    raise exception 'INVALID_WITHDRAWAL';
  end if;
  select owner_id into v_owner from public.fundraisers where id = p_fundraiser_id and deleted_at is null for update;
  if not found or v_owner <> v_user_id then raise exception 'FUNDRAISER_NOT_FOUND'; end if;
  select coalesce(sum(amount), 0)::bigint into v_available from public.contributions
    where fundraiser_id = p_fundraiser_id and status = 'confirmed';
  select coalesce(sum(amount), 0)::bigint into v_reserved from public.withdrawals
    where fundraiser_id = p_fundraiser_id and status in ('pending', 'processing', 'paid');
  if p_amount > v_available - v_reserved then raise exception 'INSUFFICIENT_AVAILABLE_BALANCE'; end if;
  delete from public.withdrawal_intents where owner_id = v_user_id and expires_at < now();
  if (select count(*) from public.withdrawal_intents where owner_id = v_user_id and consumed_at is null and expires_at > now()) >= 3 then
    raise exception 'TOO_MANY_WITHDRAWAL_ATTEMPTS';
  end if;
  insert into public.withdrawal_intents(fundraiser_id, owner_id, amount, destination)
    values (p_fundraiser_id, v_user_id, p_amount, trim(p_destination)) returning id into v_intent_id;
  return v_intent_id;
end;
$$;

create or replace function public.confirm_withdrawal(p_intent_id uuid)
returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  v_user_id uuid := auth.uid();
  v_intent public.withdrawal_intents%rowtype;
  v_fundraiser_owner uuid;
  v_available bigint;
  v_reserved bigint;
  v_magiclink_at numeric;
  v_withdrawal_id uuid;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  select max((m->>'timestamp')::numeric) into v_magiclink_at
  from jsonb_array_elements(coalesce(auth.jwt()->'amr', '[]'::jsonb)) as m
  where m->>'method' in ('magiclink', 'otp');
  if v_magiclink_at is null or v_magiclink_at < extract(epoch from now() - interval '10 minutes') then
    raise exception 'EMAIL_VERIFICATION_REQUIRED';
  end if;
  select * into v_intent from public.withdrawal_intents where id = p_intent_id and owner_id = v_user_id for update;
  if not found then raise exception 'WITHDRAWAL_INTENT_NOT_FOUND'; end if;
  if v_intent.consumed_at is not null then return v_intent.withdrawal_id; end if;
  if v_intent.expires_at < now() then raise exception 'WITHDRAWAL_INTENT_EXPIRED'; end if;
  select owner_id into v_fundraiser_owner from public.fundraisers
    where id = v_intent.fundraiser_id and deleted_at is null for update;
  if not found or v_fundraiser_owner <> v_user_id then raise exception 'FUNDRAISER_NOT_FOUND'; end if;
  select coalesce(sum(amount), 0)::bigint into v_available from public.contributions
    where fundraiser_id = v_intent.fundraiser_id and status = 'confirmed';
  select coalesce(sum(amount), 0)::bigint into v_reserved from public.withdrawals
    where fundraiser_id = v_intent.fundraiser_id and status in ('pending', 'processing', 'paid');
  if v_intent.amount > v_available - v_reserved then raise exception 'INSUFFICIENT_AVAILABLE_BALANCE'; end if;
  insert into public.withdrawals(fundraiser_id, owner_id, amount, destination)
    values (v_intent.fundraiser_id, v_user_id, v_intent.amount, v_intent.destination) returning id into v_withdrawal_id;
  update public.withdrawal_intents set consumed_at = now(), withdrawal_id = v_withdrawal_id where id = v_intent.id;
  return v_withdrawal_id;
end;
$$;

revoke all on function public.prepare_withdrawal(uuid, bigint, text) from public, anon;
revoke all on function public.confirm_withdrawal(uuid) from public, anon;
grant execute on function public.prepare_withdrawal(uuid, bigint, text) to authenticated;
grant execute on function public.confirm_withdrawal(uuid) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('fundraiser-covers', 'fundraiser-covers', false, 1258291, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = false, file_size_limit = 1258291,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

create policy "owners and public campaigns can read cover files" on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'fundraiser-covers' and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (select 1 from public.fundraisers f where f.cover = name and f.visibility = 'Publique' and f.deleted_at is null)
    )
  );
create policy "owners upload fundraiser cover files" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'fundraiser-covers' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "owners update fundraiser cover files" on storage.objects
  for update to authenticated using (
    bucket_id = 'fundraiser-covers' and (storage.foldername(name))[1] = (select auth.uid())::text
  ) with check (
    bucket_id = 'fundraiser-covers' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "owners delete fundraiser cover files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'fundraiser-covers' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
