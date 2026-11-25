import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Categoria, Prodotto, Ordine, Cliente } from './types';

// Admin reads — run under the logged-in admin session, which the `is_admin()`
// RLS policy grants full access to (including inactive rows).

export async function getAllCategorie(): Promise<Categoria[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('categorie')
    .select('*')
    .order('ordine', { ascending: true })
    .order('nome', { ascending: true });
  return (data ?? []) as Categoria[];
}

export type ProdottoAdmin = Prodotto & { categoria?: { nome: string } | null };

export async function getAllProdotti(): Promise<ProdottoAdmin[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*), categoria:categorie(nome)')
    .order('created_at', { ascending: false });
  return (data ?? []) as ProdottoAdmin[];
}

export async function getProdottoById(id: string): Promise<Prodotto | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from('prodotti')
    .select('*, immagini:prodotti_immagini(*)')
    .eq('id', id)
    .maybeSingle();
  return (data as Prodotto) ?? null;
}

export async function getOrdini(stato?: string): Promise<Ordine[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  let q = supabase.from('ordini').select('*').order('created_at', { ascending: false });
  if (stato) q = q.eq('stato', stato);
  const { data } = await q;
  return (data ?? []) as Ordine[];
}

export async function getClienti(): Promise<Cliente[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('clienti')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as Cliente[];
}
