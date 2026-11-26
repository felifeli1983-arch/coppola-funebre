import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Categoria, Prodotto, Ordine, Cliente, RigaOrdine } from './types';

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

export async function getOrdineById(
  id: string,
): Promise<{ ordine: Ordine; righe: RigaOrdine[] } | null> {
  if (!isSupabaseConfigured()) return null;
  const s = createClient();
  const { data: ordine } = await s.from('ordini').select('*').eq('id', id).maybeSingle();
  if (!ordine) return null;
  const { data: righe } = await s.from('ordini_righe').select('*').eq('ordine_id', id);
  return { ordine: ordine as Ordine, righe: (righe ?? []) as RigaOrdine[] };
}

export type VisiteStats = {
  totale: number;
  oggi: number;
  settimana: number;
  topReferrer: { host: string; n: number }[];
  topSource: { source: string; n: number }[];
  topPaese: { paese: string; n: number }[];
  topPagine: { path: string; n: number }[];
  perGiorno: { giorno: string; n: number }[];
};

export async function getVisiteStats(): Promise<VisiteStats | null> {
  if (!isSupabaseConfigured()) return null;
  const s = createClient();
  // Last 30 days of visits (lightweight; aggregate in JS).
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await s
    .from('visite')
    .select('path, referrer_host, utm_source, paese, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5000);
  const rows = data ?? [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 86400000;

  const count = (arr: string[]) => {
    const m = new Map<string, number>();
    for (const v of arr) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const perGiornoMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    perGiornoMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    if (perGiornoMap.has(day)) perGiornoMap.set(day, (perGiornoMap.get(day) ?? 0) + 1);
  }

  return {
    totale: rows.length,
    oggi: rows.filter((r) => new Date(r.created_at) >= startOfToday).length,
    settimana: rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
    topReferrer: count(rows.map((r) => r.referrer_host || 'diretto')).slice(0, 8).map(([host, n]) => ({ host, n })),
    topSource: count(rows.map((r) => r.utm_source || '—')).slice(0, 6).map(([source, n]) => ({ source, n })),
    topPaese: count(rows.map((r) => r.paese || '—')).slice(0, 6).map(([paese, n]) => ({ paese, n })),
    topPagine: count(rows.map((r) => r.path || '/')).slice(0, 8).map(([path, n]) => ({ path, n })),
    perGiorno: [...perGiornoMap.entries()].map(([giorno, n]) => ({ giorno, n })),
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

export type ClienteConStats = Cliente & { ordini: number; spesaCent: number };

export async function getClientiConStats(q?: string): Promise<ClienteConStats[]> {
  if (!isSupabaseConfigured()) return [];
  const s = createClient();
  let cq = s.from('clienti').select('*').order('created_at', { ascending: false });
  if (q && q.trim()) {
    // Strip PostgREST meta-characters so the term can't alter/break the .or() filter.
    const term = q.trim().replace(/[,().*%\\]/g, ' ').trim();
    if (term) cq = cq.or(`nome.ilike.%${term}%,email.ilike.%${term}%`);
  }
  const [{ data: clienti }, { data: ordini }] = await Promise.all([
    cq,
    s.from('ordini').select('email, totale_cent, stato'),
  ]);
  const agg = new Map<string, { n: number; sum: number }>();
  for (const o of ordini ?? []) {
    const e = agg.get(o.email) ?? { n: 0, sum: 0 };
    e.n += 1;
    if (['pagato', 'spedito', 'consegnato'].includes(o.stato)) e.sum += o.totale_cent ?? 0;
    agg.set(o.email, e);
  }
  return (clienti ?? []).map((c) => ({
    ...(c as Cliente),
    ordini: agg.get(c.email)?.n ?? 0,
    spesaCent: agg.get(c.email)?.sum ?? 0,
  }));
}

export type Documento = {
  id: string;
  titolo: string;
  descrizione: string | null;
  storage_path: string;
  tipo: string;
  pubblico: boolean;
  created_at: string;
};

export async function getDocumenti(): Promise<Documento[]> {
  if (!isSupabaseConfigured()) return [];
  const s = createClient();
  const { data } = await s.from('documenti').select('*').order('created_at', { ascending: false });
  return (data ?? []) as Documento[];
}

export type AdminUtente = { user_id: string; email: string; created_at: string | null };

export async function getAdmins(): Promise<AdminUtente[]> {
  if (!isSupabaseConfigured()) return [];
  const s = createClient();
  const { data } = await s
    .from('admins')
    .select('user_id, email, created_at')
    .order('created_at', { ascending: true });
  return (data ?? []) as AdminUtente[];
}

export async function getClienteById(
  id: string,
): Promise<{ cliente: Cliente; ordini: Ordine[] } | null> {
  if (!isSupabaseConfigured()) return null;
  const s = createClient();
  const { data: cliente } = await s.from('clienti').select('*').eq('id', id).maybeSingle();
  if (!cliente) return null;
  // Quote the email value so commas/dots in it can't break the PostgREST filter.
  const email = (cliente as Cliente).email.replace(/"/g, '');
  const { data: ordini } = await s
    .from('ordini')
    .select('*')
    .or(`cliente_id.eq.${id},email.eq."${email}"`)
    .order('created_at', { ascending: false });
  return { cliente: cliente as Cliente, ordini: (ordini ?? []) as Ordine[] };
}
