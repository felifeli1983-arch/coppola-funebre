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

export type SortKey = 'ordine' | 'prezzo-asc' | 'prezzo-desc' | 'nome' | 'recenti';
export const PER_PAGE = 24;

export async function searchProdotti(opts: {
  cat?: string;
  q?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}): Promise<{ items: Prodotto[]; total: number }> {
  if (!isSupabaseConfigured()) return { items: [], total: 0 };
  const supabase = createClient();
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? PER_PAGE;

  let query = supabase
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*)', { count: 'exact' })
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
  return { items: (data ?? []) as Prodotto[], total: count ?? 0 };
}

export async function getProdottoBySlug(slug: string): Promise<Prodotto | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*)')
    .eq('slug', slug)
    .eq('attivo', true)
    .maybeSingle();
  if (error) return null;
  return (data as Prodotto) ?? null;
}
