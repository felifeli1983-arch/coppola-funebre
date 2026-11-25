-- Coppola shop — initial schema
-- Apply to the dedicated eredicoppola Supabase project (NOT any other account).

create extension if not exists "pgcrypto";

-- ── Categories (groups + subgroups via parent_id) ───────────────────
create table if not exists public.categorie (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  slug        text not null unique,
  parent_id   uuid references public.categorie(id) on delete cascade,
  descrizione text,
  ordine      int  not null default 0,
  attivo      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists idx_categorie_parent on public.categorie(parent_id);

-- ── Products ────────────────────────────────────────────────────────
create table if not exists public.prodotti (
  id           uuid primary key default gen_random_uuid(),
  titolo       text not null,
  slug         text not null unique,
  descrizione  text,
  prezzo_cent  int  not null default 0,           -- price in cents
  valuta       text not null default 'EUR',
  giacenza     int  not null default 0,           -- stock quantity
  attivo       boolean not null default true,     -- on/off toggle
  categoria_id uuid references public.categorie(id) on delete set null,
  ordine       int  not null default 0,
  peso_grammi  int,                               -- weight, for shipping (Packlink)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_prodotti_categoria on public.prodotti(categoria_id);
create index if not exists idx_prodotti_attivo on public.prodotti(attivo);

-- ── Product images (paths in Storage bucket "prodotti") ─────────────
create table if not exists public.prodotti_immagini (
  id          uuid primary key default gen_random_uuid(),
  prodotto_id uuid not null references public.prodotti(id) on delete cascade,
  storage_path text not null,
  alt         text,
  ordine      int  not null default 0
);
create index if not exists idx_immagini_prodotto on public.prodotti_immagini(prodotto_id);

-- ── Customers ───────────────────────────────────────────────────────
create table if not exists public.clienti (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  nome       text,
  telefono   text,
  indirizzo  jsonb,
  created_at timestamptz not null default now()
);

-- ── Orders ──────────────────────────────────────────────────────────
create table if not exists public.ordini (
  id                     uuid primary key default gen_random_uuid(),
  numero                 bigint generated always as identity,  -- human order number
  cliente_id             uuid references public.clienti(id) on delete set null,
  email                  text not null,
  stato                  text not null default 'in_attesa',
    -- in_attesa | pagato | spedito | consegnato | annullato | rimborsato
  totale_cent            int  not null default 0,
  valuta                 text not null default 'EUR',
  stripe_session_id      text,
  stripe_payment_intent  text,
  indirizzo_spedizione   jsonb,
  indirizzo_fatturazione jsonb,
  metodo_spedizione      text,
  costo_spedizione_cent  int  not null default 0,
  tracking               text,
  note                   text,
  created_at             timestamptz not null default now()
);
create index if not exists idx_ordini_stato on public.ordini(stato);
create index if not exists idx_ordini_created on public.ordini(created_at desc);

create table if not exists public.ordini_righe (
  id          uuid primary key default gen_random_uuid(),
  ordine_id   uuid not null references public.ordini(id) on delete cascade,
  prodotto_id uuid references public.prodotti(id) on delete set null,
  titolo      text not null,        -- snapshot at purchase time
  prezzo_cent int  not null,        -- snapshot
  quantita    int  not null default 1
);
create index if not exists idx_righe_ordine on public.ordini_righe(ordine_id);

-- ── updated_at trigger for prodotti ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_prodotti_updated on public.prodotti;
create trigger trg_prodotti_updated before update on public.prodotti
  for each row execute function public.set_updated_at();

-- ── Row-Level Security ──────────────────────────────────────────────
-- Public (anon) may READ only active catalog rows. All writes go through the
-- service-role key on the server (admin actions, Stripe webhook), which bypasses RLS.
alter table public.categorie        enable row level security;
alter table public.prodotti         enable row level security;
alter table public.prodotti_immagini enable row level security;
alter table public.clienti          enable row level security;
alter table public.ordini           enable row level security;
alter table public.ordini_righe     enable row level security;

drop policy if exists "read active categorie" on public.categorie;
create policy "read active categorie" on public.categorie
  for select using (attivo = true);

drop policy if exists "read active prodotti" on public.prodotti;
create policy "read active prodotti" on public.prodotti
  for select using (attivo = true);

drop policy if exists "read immagini of active prodotti" on public.prodotti_immagini;
create policy "read immagini of active prodotti" on public.prodotti_immagini
  for select using (
    exists (select 1 from public.prodotti p
            where p.id = prodotto_id and p.attivo = true)
  );

-- clienti / ordini / ordini_righe: no anon policy → readable/writable only via
-- the service-role key (admin + webhook). This keeps customer & order data private.

-- ── Storage bucket for product images (public read) ─────────────────
insert into storage.buckets (id, name, public)
values ('prodotti', 'prodotti', true)
on conflict (id) do nothing;
