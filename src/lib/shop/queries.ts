import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Categoria, Prodotto } from './types';

// Public read queries for the storefront. Each returns an empty result when
// Supabase isn't configured yet, so pages render a graceful empty state.

export async function getActiveCategorie(): Promise<Categoria[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categorie')
    .select('*')
    .eq('attivo', true)
    .order('ordine', { ascending: true });
  if (error) return [];
  return (data ?? []) as Categoria[];
}

export async function getActiveProdotti(categoriaSlug?: string): Promise<Prodotto[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  let query = supabase
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*)')
    .eq('attivo', true)
    .order('ordine', { ascending: true });

  if (categoriaSlug) {
    // Match the category itself plus its subcategories (so selecting a top
    // group also shows products filed under its subgroups).
    const { data: cat } = await supabase
      .from('categorie')
      .select('id')
      .eq('slug', categoriaSlug)
      .maybeSingle();
    if (cat?.id) {
      const { data: children } = await supabase
        .from('categorie')
        .select('id')
        .eq('parent_id', cat.id);
      const ids = [cat.id, ...(children ?? []).map((c) => c.id)];
      query = query.in('categoria_id', ids);
    }
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Prodotto[];
}

/** Product with its (optional) category, for cards and breadcrumbs. */
export type ProdottoConCategoria = Prodotto & {
  categoria?: { id: string; nome: string; slug: string; parent_id: string | null } | null;
};

const CARD_SELECT = '*, immagini:prodotti_immagini(*), categoria:categorie(id, nome, slug, parent_id)';

/** Images sorted by their `ordine` (cover first). */
export function sortImmagini<T extends Prodotto>(p: T): T {
  if (p.immagini?.length) p.immagini = [...p.immagini].sort((a, b) => (a.ordine ?? 0) - (b.ordine ?? 0));
  return p;
}

export type SortKey = 'ordine' | 'prezzo-asc' | 'prezzo-desc' | 'nome' | 'recenti';
export const PER_PAGE = 24;

export async function searchProdotti(opts: {
  cat?: string;
  q?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}): Promise<{ items: ProdottoConCategoria[]; total: number }> {
  if (!isSupabaseConfigured()) return { items: [], total: 0 };
  const supabase = createClient();
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? PER_PAGE;

  let query = supabase
    .from('prodotti')
    .select(CARD_SELECT, { count: 'exact' })
    .eq('attivo', true);

  if (opts.cat) {
    const { data: cat } = await supabase
      .from('categorie')
      .select('id')
      .eq('slug', opts.cat)
      .maybeSingle();
    if (cat?.id) {
      const { data: children } = await supabase
        .from('categorie')
        .select('id')
        .eq('parent_id', cat.id);
      query = query.in('categoria_id', [cat.id, ...(children ?? []).map((c) => c.id)]);
    } else {
      return { items: [], total: 0 };
    }
  }

  if (opts.q && opts.q.trim()) {
    query = query.ilike('titolo', `%${opts.q.trim()}%`);
  }

  switch (opts.sort) {
    case 'prezzo-asc': query = query.order('prezzo_cent', { ascending: true }); break;
    case 'prezzo-desc': query = query.order('prezzo_cent', { ascending: false }); break;
    case 'nome': query = query.order('titolo', { ascending: true }); break;
    case 'recenti': query = query.order('created_at', { ascending: false }); break;
    default: query = query.order('ordine', { ascending: true });
  }

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;
  if (error) return { items: [], total: 0 };
  return { items: ((data ?? []) as ProdottoConCategoria[]).map(sortImmagini), total: count ?? 0 };
}

export async function getProdottoBySlug(slug: string): Promise<ProdottoConCategoria | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prodotti')
    .select(CARD_SELECT)
    .eq('slug', slug)
    .eq('attivo', true)
    .maybeSingle();
  if (error || !data) return null;
  return sortImmagini(data as ProdottoConCategoria);
}

/** Other active products from the same category (topped up with any others). */
export async function getRelatedProdotti(p: Prodotto, limit = 4): Promise<ProdottoConCategoria[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const out: ProdottoConCategoria[] = [];
  if (p.categoria_id) {
    const { data } = await supabase
      .from('prodotti')
      .select(CARD_SELECT)
      .eq('attivo', true)
      .eq('categoria_id', p.categoria_id)
      .neq('id', p.id)
      .order('ordine', { ascending: true })
      .limit(limit);
    out.push(...((data ?? []) as ProdottoConCategoria[]));
  }
  if (out.length < limit) {
    const exclude = [p.id, ...out.map((x) => x.id)];
    const { data } = await supabase
      .from('prodotti')
      .select(CARD_SELECT)
      .eq('attivo', true)
      .not('id', 'in', `(${exclude.join(',')})`)
      .order('ordine', { ascending: true })
      .limit(limit - out.length);
    out.push(...((data ?? []) as ProdottoConCategoria[]));
  }
  return out.map(sortImmagini);
}
