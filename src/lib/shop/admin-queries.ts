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

export type DashboardStats = {
  prodottiTot: number;
  prodottiAttivi: number;
  categorie: number;
  clienti: number;
  ordiniTot: number;
  ordiniInAttesa: number;
  fatturatoCent: number;
  recenti: Ordine[];
  esaurimento: { id: string; titolo: string; giacenza: number; slug: string }[];
};

export async function getDashboardStats(): Promise<DashboardStats | null> {
  if (!isSupabaseConfigured()) return null;
  const s = createClient();
  const head = { count: 'exact' as const, head: true };

  const [pTot, pAtt, cat, cli, oTot, oAtt] = await Promise.all([
    s.from('prodotti').select('*', head),
    s.from('prodotti').select('*', head).eq('attivo', true),
    s.from('categorie').select('*', head),
    s.from('clienti').select('*', head),
    s.from('ordini').select('*', head),
    s.from('ordini').select('*', head).eq('stato', 'in_attesa'),
  ]);

  const [{ data: pagati }, { data: recenti }, { data: low }] = await Promise.all([
    s.from('ordini').select('totale_cent').eq('stato', 'pagato'),
    s.from('ordini').select('*').order('created_at', { ascending: false }).limit(5),
    s
      .from('prodotti')
      .select('id, titolo, giacenza, slug')
      .eq('attivo', true)
      .lte('giacenza', 3)
      .order('giacenza', { ascending: true })
      .limit(5),
  ]);

  return {
    prodottiTot: pTot.count ?? 0,
    prodottiAttivi: pAtt.count ?? 0,
    categorie: cat.count ?? 0,
    clienti: cli.count ?? 0,
    ordiniTot: oTot.count ?? 0,
    ordiniInAttesa: oAtt.count ?? 0,
    fatturatoCent: (pagati ?? []).reduce((n, o) => n + (o.totale_cent ?? 0), 0),
    recenti: (recenti ?? []) as Ordine[],
    esaurimento: (low ?? []) as DashboardStats['esaurimento'],
  };
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
