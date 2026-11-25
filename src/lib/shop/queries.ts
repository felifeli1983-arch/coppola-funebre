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
    const { data: cat } = await supabase
      .from('categorie')
      .select('id')
      .eq('slug', categoriaSlug)
      .maybeSingle();
    if (cat?.id) query = query.eq('categoria_id', cat.id);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Prodotto[];
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
