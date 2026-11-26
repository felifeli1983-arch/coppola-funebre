-- The admins allowlist was readable only via the is_admin() SECURITY DEFINER
-- function; the table itself had no GRANT to `authenticated`, so the admin UI
-- (getAdmins) and allowlist management were blocked. Grant table privileges and
-- add a manage policy so logged-in admins can view and revoke other admins.
-- (Already applied to the hosted project; kept here for reproducibility.)

grant select, insert, update, delete on public.admins to authenticated;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='admins' and policyname='admin manage admins'
  ) then
    create policy "admin manage admins" on public.admins
      for all to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
