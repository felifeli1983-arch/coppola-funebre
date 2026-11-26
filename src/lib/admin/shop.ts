import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Categoria, Indirizzo, Ordine, Prodotto, ProdottoImmagine, RigaOrdine } from '@/lib/shop/types';

// Admin reads for the shop back-office. They run under the logged-in admin
// session, which the is_admin() RLS policies grant full access to.

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrdineRow = Ordine & { articoli: number; cliente_nome: string | null };

export async function getOrdiniAdmin(): Promise<OrdineRow[]> {
  const s = createClient();
  const { data } = await s
    .from('ordini')
    .select('*, righe:ordini_righe(quantita), cliente:clienti(nome)')
    .order('created_at', { ascending: false })
    .order('numero', { ascending: false });
  return (data ?? []).map((o) => {
    const { righe, cliente, ...rest } = o as Ordine & {
      righe: { quantita: number }[] | null;
      cliente: { nome: string | null } | null;
    };
    const ind = (rest.indirizzo_spedizione ?? {}) as Indirizzo;
    return {
      ...(rest as Ordine),
      articoli: (righe ?? []).reduce((n, r) => n + (r.quantita ?? 0), 0),
      cliente_nome: ind.nome || cliente?.nome || null,
    };
  });
}

export type RigaDettaglio = RigaOrdine & { cover: string | null; slug: string | null };

export type OrdineDettaglio = {
  ordine: Ordine;
  righe: RigaDettaglio[];
  subtotale: number;
  cliente: { id: string; nome: string | null; email: string | null; telefono: string | null } | null;
};

export async function getOrdineDettaglio(id: string): Promise<OrdineDettaglio | null> {
  const s = createClient();
  const { data: ordine } = await s.from('ordini').select('*').eq('id', id).maybeSingle();
  if (!ordine) return null;
  const o = ordine as Ordine;

  const [{ data: righe }, clienteRes] = await Promise.all([
    s.from('ordini_righe').select('*').eq('ordine_id', id),
    o.cliente_id
      ? s.from('clienti').select('id, nome, email, telefono').eq('id', o.cliente_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows = (righe ?? []) as RigaOrdine[];
  const prodIds = rows.map((r) => r.prodotto_id).filter(Boolean) as string[];
  const covers = new Map<string, string>();
  const slugs = new Map<string, string>();
  if (prodIds.length) {
    const [{ data: imgs }, { data: prods }] = await Promise.all([
      s.from('prodotti_immagini').select('prodotto_id, storage_path, ordine').in('prodotto_id', prodIds).order('ordine'),
      s.from('prodotti').select('id, slug').in('id', prodIds),
    ]);
    for (const im of imgs ?? []) if (!covers.has(im.prodotto_id)) covers.set(im.prodotto_id, im.storage_path);
    for (const p of prods ?? []) slugs.set(p.id, p.slug);
  }

  return {
    ordine: o,
    righe: rows.map((r) => ({
      ...r,
      cover: r.prodotto_id ? covers.get(r.prodotto_id) ?? null : null,
      slug: r.prodotto_id ? slugs.get(r.prodotto_id) ?? null : null,
    })),
    subtotale: rows.reduce((n, r) => n + r.prezzo_cent * r.quantita, 0),
    cliente: (clienteRes.data as OrdineDettaglio['cliente']) ?? null,
  };
}

// ── Products ────────────────────────────────────────────────────────────────

export type ProdottoRow = Prodotto & { categoria_nome: string | null; cover: string | null };

export async function getProdottiAdmin(): Promise<ProdottoRow[]> {
  const s = createClient();
  const { data } = await s
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*), categoria:categorie(nome)')
    // Tie-breakers keep the list stable (seeded rows share created_at).
    .order('created_at', { ascending: false })
    .order('titolo', { ascending: true })
    .order('id', { ascending: true });
  return (data ?? []).map((p) => {
    const { categoria, ...rest } = p as Prodotto & { categoria: { nome: string } | null };
    const imgs = [...(rest.immagini ?? [])].sort((a, b) => a.ordine - b.ordine);
    return {
      ...(rest as Prodotto),
      immagini: imgs,
      categoria_nome: categoria?.nome ?? null,
      cover: imgs[0]?.storage_path ?? null,
    };
  });
}

export async function getProdottoAdmin(id: string): Promise<Prodotto | null> {
  const s = createClient();
  const { data } = await s
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*)')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  const p = data as Prodotto;
  p.immagini = [...((p.immagini ?? []) as ProdottoImmagine[])].sort((a, b) => a.ordine - b.ordine);
  return p;
}

// ── Categories ──────────────────────────────────────────────────────────────

export type CategoriaRow = Categoria & { prodotti: number };

export async function getCategorieAdmin(): Promise<CategoriaRow[]> {
  const s = createClient();
  const [{ data: cats }, { data: prods }] = await Promise.all([
    s
      .from('categorie')
      .select('*')
      .order('ordine', { ascending: true })
      .order('nome', { ascending: true })
      .order('id', { ascending: true }),
    s.from('prodotti').select('categoria_id'),
  ]);
  const count = new Map<string, number>();
  for (const p of prods ?? []) if (p.categoria_id) count.set(p.categoria_id, (count.get(p.categoria_id) ?? 0) + 1);
  return ((cats ?? []) as Categoria[]).map((c) => ({ ...c, prodotti: count.get(c.id) ?? 0 }));
}
