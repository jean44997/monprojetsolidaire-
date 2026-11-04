-- Public campaign and contribution views should enforce the caller's grants and RLS.
alter view public.public_fundraiser_catalog set (security_invoker = true);
alter view public.public_contribution_feed set (security_invoker = true);

-- The anonymous contribution feed is intentionally public, but only for confirmed
-- gifts attached to a currently public, non-deleted fundraiser. Limit the anon
-- role to exactly the columns used by the public view.
drop policy if exists "public can read confirmed contributions for public fundraisers"
  on public.contributions;
create policy "public can read confirmed contributions for public fundraisers"
  on public.contributions
  for select
  to anon, authenticated
  using (
    status = 'confirmed'
    and exists (
      select 1
      from public.fundraisers f
      where f.id = contributions.fundraiser_id
        and f.visibility = 'Publique'
        and f.deleted_at is null
    )
  );

grant select (id, fundraiser_id, amount, public_name, created_at, status)
  on public.contributions to anon;

-- The profile bootstrap function is only called by the auth.users trigger.
-- It must not be callable directly through the public RPC surface.
revoke all on function public.create_profile_for_user()
  from public, anon, authenticated;
