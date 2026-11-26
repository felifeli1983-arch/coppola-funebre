-- Hiding a category (or its parent group) in the admin must also hide its
-- products from the public shop. Enforced in the public read policy so every
-- storefront query (list, search, product page, related, checkout) obeys it.
-- (Applied to the hosted project; kept for reproducibility.)

create or replace function public.categoria_visibile(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select c.attivo and coalesce(p.attivo, true)
       from public.categorie c
       left join public.categorie p on p.id = c.parent_id
      where c.id = cid),
    false)
$$;

drop policy if exists "read active prodotti" on public.prodotti;
create policy "read active prodotti" on public.prodotti
  for select
  using (attivo = true and (categoria_id is null or public.categoria_visibile(categoria_id)));
