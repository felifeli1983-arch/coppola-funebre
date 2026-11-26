-- Professional CRM + order→CRM automation + admin-user management without the
-- service-role key. (Applied to the hosted project; kept for reproducibility.)

-- ── 1. CRM fields on clienti ────────────────────────────────────────────────
alter table public.clienti alter column email drop not null; -- phone-only contacts

alter table public.clienti
  add column if not exists tipo text not null default 'privato',
  add column if not exists azienda text,
  add column if not exists codice_fiscale text,
  add column if not exists partita_iva text,
  add column if not exists stato text not null default 'nuovo',
  add column if not exists fonte text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists ultima_attivita_at timestamptz;

do $$ begin
  alter table public.clienti add constraint clienti_tipo_chk check (tipo in ('privato','azienda'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.clienti add constraint clienti_stato_chk
    check (stato in ('nuovo','contattato','preventivo','cliente','perso'));
exception when duplicate_object then null; end $$;

-- ON CONFLICT (email) below needs a unique constraint/index on email.
do $$ begin
  if not exists (
    select 1 from pg_index i
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
    where i.indrelid = 'public.clienti'::regclass and i.indisunique and a.attname = 'email'
      and i.indnatts = 1
  ) then
    alter table public.clienti add constraint clienti_email_key unique (email);
  end if;
end $$;

update public.clienti c set stato = 'cliente'
where stato = 'nuovo' and exists (select 1 from public.ordini o where lower(o.email) = lower(c.email));

drop trigger if exists clienti_set_updated_at on public.clienti;
create trigger clienti_set_updated_at before update on public.clienti
  for each row execute function public.set_updated_at();

create index if not exists clienti_stato_idx on public.clienti (stato);
create index if not exists clienti_created_idx on public.clienti (created_at desc);

-- ── 2. Activity timeline / reminders ────────────────────────────────────────
create table if not exists public.clienti_attivita (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clienti(id) on delete cascade,
  tipo text not null default 'nota'
    check (tipo in ('nota','chiamata','email','whatsapp','incontro','preventivo','ordine','sistema')),
  titolo text,
  testo text,
  scadenza timestamptz,
  completata boolean not null default false,
  ordine_id uuid references public.ordini(id) on delete set null,
  autore text default (auth.jwt() ->> 'email'),
  created_at timestamptz not null default now()
);
create index if not exists clienti_attivita_cliente_idx on public.clienti_attivita (cliente_id, created_at desc);
create index if not exists clienti_attivita_scadenza_idx on public.clienti_attivita (scadenza)
  where scadenza is not null and not completata;

alter table public.clienti_attivita enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='clienti_attivita'
                 and policyname='admin all clienti_attivita') then
    create policy "admin all clienti_attivita" on public.clienti_attivita
      for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
grant select, insert, update, delete on public.clienti_attivita to authenticated;

create or replace function public.clienti_tocca_ultima_attivita()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.clienti
     set ultima_attivita_at = greatest(coalesce(ultima_attivita_at, new.created_at), new.created_at)
   where id = new.cliente_id;
  return new;
end $$;
drop trigger if exists clienti_attivita_tocca on public.clienti_attivita;
create trigger clienti_attivita_tocca after insert on public.clienti_attivita
  for each row execute function public.clienti_tocca_ultima_attivita();

-- ── 3. Every order lands in the CRM (independent of payment / service role) ─
create or replace function public.ordine_collega_cliente()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  cid uuid;
  ind jsonb := coalesce(new.indirizzo_spedizione, '{}'::jsonb);
begin
  new.email := lower(trim(new.email));
  if new.email is null or new.email = '' then
    return new;
  end if;

  insert into public.clienti (email, nome, telefono, indirizzo, stato, fonte)
  values (
    new.email,
    nullif(trim(ind ->> 'nome'), ''),
    nullif(trim(ind ->> 'telefono'), ''),
    jsonb_build_object(
      'via', coalesce(ind ->> 'via', ''), 'citta', coalesce(ind ->> 'citta', ''),
      'cap', coalesce(ind ->> 'cap', ''), 'provincia', coalesce(ind ->> 'provincia', '')),
    'cliente', 'shop')
  on conflict (email) do update set
    nome      = coalesce(public.clienti.nome, excluded.nome),
    telefono  = coalesce(public.clienti.telefono, excluded.telefono),
    indirizzo = case
                  when coalesce(public.clienti.indirizzo ->> 'via', '') = '' then excluded.indirizzo
                  else public.clienti.indirizzo
                end,
    stato     = 'cliente',
    fonte     = coalesce(public.clienti.fonte, 'shop')
  returning id into cid;

  new.cliente_id := coalesce(new.cliente_id, cid);
  return new;
end $$;

drop trigger if exists ordini_collega_cliente on public.ordini;
create trigger ordini_collega_cliente before insert on public.ordini
  for each row execute function public.ordine_collega_cliente();

create or replace function public.ordine_stato_label(s text)
returns text language sql immutable set search_path = '' as $$
  select case s
    when 'in_attesa' then 'In attesa di pagamento'
    when 'pagato' then 'Pagato'
    when 'spedito' then 'Spedito'
    when 'consegnato' then 'Consegnato'
    when 'annullato' then 'Annullato'
    when 'rimborsato' then 'Rimborsato'
    else s end
$$;

create or replace function public.ordine_registra_attivita()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  totale text := replace(to_char(new.totale_cent / 100.0, 'FM999999990.00'), '.', ',') || ' €';
begin
  if new.cliente_id is null then
    return new;
  end if;
  if tg_op = 'INSERT' then
    insert into public.clienti_attivita (cliente_id, tipo, titolo, testo, ordine_id, autore)
    values (new.cliente_id, 'ordine', 'Ordine #' || new.numero || ' ricevuto',
            'Totale ' || totale || ' · ' || public.ordine_stato_label(new.stato), new.id, 'Sistema');
  elsif new.stato is distinct from old.stato then
    insert into public.clienti_attivita (cliente_id, tipo, titolo, testo, ordine_id, autore)
    values (new.cliente_id, 'sistema', 'Ordine #' || new.numero || ': ' || public.ordine_stato_label(new.stato),
            case when new.tracking is not null and new.stato = 'spedito'
                 then 'Tracking: ' || new.tracking end,
            new.id, coalesce(auth.jwt() ->> 'email', 'Sistema'));
  end if;
  return new;
end $$;

drop trigger if exists ordini_registra_attivita on public.ordini;
create trigger ordini_registra_attivita after insert or update of stato on public.ordini
  for each row execute function public.ordine_registra_attivita();

-- ── 4. Admin users managed from the panel (no service-role key needed) ─────
create or replace function public.admin_crea_utente(p_email text, p_password text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  uid uuid;
  e text := lower(trim(p_email));
begin
  if not public.is_admin() then
    raise exception 'Non autorizzato' using errcode = '42501';
  end if;
  if e is null or e !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Email non valida';
  end if;
  if length(coalesce(p_password, '')) < 8 then
    raise exception 'La password deve avere almeno 8 caratteri';
  end if;

  select id into uid from auth.users where lower(email) = e;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', e,
      extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', '', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text,
            jsonb_build_object('sub', uid::text, 'email', e, 'email_verified', true),
            'email', now(), now(), now());
  else
    if exists (select 1 from public.admins where user_id = uid) then
      raise exception 'Questo utente è già un amministratore';
    end if;
    update auth.users
       set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = uid;
  end if;

  insert into public.admins (user_id, email) values (uid, e) on conflict (user_id) do nothing;
  return uid;
end $$;

create or replace function public.admin_rimuovi_utente(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Non autorizzato' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Non puoi rimuovere il tuo stesso account';
  end if;
  if (select count(*) from public.admins) <= 1 then
    raise exception 'Deve restare almeno un amministratore';
  end if;
  delete from public.admins where user_id = p_user_id;
  delete from auth.users where id = p_user_id;
end $$;

revoke all on function public.admin_crea_utente(text, text) from public, anon;
revoke all on function public.admin_rimuovi_utente(uuid) from public, anon;
grant execute on function public.admin_crea_utente(text, text) to authenticated;
grant execute on function public.admin_rimuovi_utente(uuid) to authenticated;

-- Internal trigger helpers are not meant to be called directly.
revoke all on function public.ordine_collega_cliente() from public, anon, authenticated;
revoke all on function public.ordine_registra_attivita() from public, anon, authenticated;
revoke all on function public.clienti_tocca_ultima_attivita() from public, anon, authenticated;
