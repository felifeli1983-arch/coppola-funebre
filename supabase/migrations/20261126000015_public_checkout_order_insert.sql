-- Allow the public storefront checkout to create orders without an admin
-- session. INSERT only — no SELECT/UPDATE/DELETE for anon, so order data stays
-- private and cannot be tampered with after creation. Prices are validated
-- server-side in /api/checkout; payment confirmation + stock decrement happen
-- in the Stripe webhook using the service role.
-- (Already applied to the hosted project; kept here for reproducibility.)

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ordini' and policyname='public create ordini') then
    create policy "public create ordini" on public.ordini
      for insert to anon, authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ordini_righe' and policyname='public create ordini_righe') then
    create policy "public create ordini_righe" on public.ordini_righe
      for insert to anon, authenticated with check (true);
  end if;
end $$;

grant insert on public.ordini to anon, authenticated;
grant insert on public.ordini_righe to anon, authenticated;
