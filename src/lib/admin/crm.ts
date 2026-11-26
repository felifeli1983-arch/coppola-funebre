import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Indirizzo, Ordine } from '@/lib/shop/types';
import { ORDER_REVENUE_STATUSES } from '@/lib/admin/meta';

// ── Types ─────────────────────────────────────────────────────────────────

export type Contatto = {
  id: string;
  email: string | null;
  nome: string | null;
  telefono: string | null;
  indirizzo: Indirizzo | null;
  note: string | null;
  tipo: 'privato' | 'azienda';
  azienda: string | null;
  codice_fiscale: string | null;
  partita_iva: string | null;
  stato: string;
  fonte: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  ultima_attivita_at: string | null;
};

export type ContattoConStats = Contatto & {
  ordini: number;
  spesaCent: number;
  ultimoOrdine: string | null;
};

export type Attivita = {
  id: string;
  cliente_id: string;
  tipo: string;
  titolo: string | null;
  testo: string | null;
  scadenza: string | null;
  completata: boolean;
  ordine_id: string | null;
  autore: string | null;
  created_at: string;
};

export type AttivitaConCliente = Attivita & {
  cliente: { id: string; nome: string | null; azienda: string | null; email: string | null } | null;
};

export type ContattoLite = {
  id: string;
  nome: string | null;
  azienda: string | null;
  email: string | null;
  telefono: string | null;
};

/** Display name for a contact: name → company → email → phone. */
export function nomeContatto(c: { nome?: string | null; azienda?: string | null; email?: string | null; telefono?: string | null }) {
  return c.nome || c.azienda || c.email || c.telefono || 'Contatto senza nome';
}

function normalize(row: Record<string, unknown>): Contatto {
  return { ...(row as Contatto), tags: (row.tags as string[] | null) ?? [], tipo: (row.tipo as Contatto['tipo']) ?? 'privato' };
}

// ── Queries ───────────────────────────────────────────────────────────────

export async function getContatti(): Promise<ContattoConStats[]> {
  const s = createClient();
  const [{ data: clienti }, { data: ordini }] = await Promise.all([
    s.from('clienti').select('*').order('created_at', { ascending: false }).limit(5000),
    s.from('ordini').select('cliente_id, email, totale_cent, stato, created_at').limit(20000),
  ]);

  const byId = new Map<string, { n: number; sum: number; last: string | null }>();
  const byEmail = new Map<string, { n: number; sum: number; last: string | null }>();
  const add = (m: Map<string, { n: number; sum: number; last: string | null }>, k: string, o: { totale_cent: number; stato: string; created_at: string }) => {
    const e = m.get(k) ?? { n: 0, sum: 0, last: null };
    e.n += 1;
    if (ORDER_REVENUE_STATUSES.includes(o.stato)) e.sum += o.totale_cent ?? 0;
    if (!e.last || o.created_at > e.last) e.last = o.created_at;
    m.set(k, e);
  };
  for (const o of ordini ?? []) {
    if (o.cliente_id) add(byId, o.cliente_id, o);
    else if (o.email) add(byEmail, String(o.email).toLowerCase(), o);
  }

  return (clienti ?? []).map((row) => {
    const c = normalize(row);
    const a = byId.get(c.id);
    const b = c.email ? byEmail.get(c.email.toLowerCase()) : undefined;
    const last = [a?.last, b?.last].filter(Boolean).sort().pop() ?? null;
    return {
      ...c,
      ordini: (a?.n ?? 0) + (b?.n ?? 0),
      spesaCent: (a?.sum ?? 0) + (b?.sum ?? 0),
      ultimoOrdine: last,
    };
  });
}

export async function getContatto(
  id: string,
): Promise<{ contatto: Contatto; ordini: Ordine[]; attivita: Attivita[] } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const s = createClient();
  const { data: row } = await s.from('clienti').select('*').eq('id', id).maybeSingle();
  if (!row) return null;
  const contatto = normalize(row);

  let ordiniQ = s.from('ordini').select('*').order('created_at', { ascending: false });
  if (contatto.email) {
    // Quote the email so commas/dots can't break the PostgREST filter.
    const email = contatto.email.replace(/"/g, '');
    ordiniQ = ordiniQ.or(`cliente_id.eq.${id},email.eq."${email}"`);
  } else {
    ordiniQ = ordiniQ.eq('cliente_id', id);
  }

  const [{ data: ordini }, { data: attivita }] = await Promise.all([
    ordiniQ,
    s
      .from('clienti_attivita')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  return {
    contatto,
    ordini: (ordini ?? []) as Ordine[],
    attivita: (attivita ?? []) as Attivita[],
  };
}

export async function getAttivita(): Promise<AttivitaConCliente[]> {
  const s = createClient();
  const { data } = await s
    .from('clienti_attivita')
    .select('*, cliente:clienti(id, nome, azienda, email)')
    .order('created_at', { ascending: false })
    .limit(2000);
  return (data ?? []) as AttivitaConCliente[];
}

export async function getContattiLite(): Promise<ContattoLite[]> {
  const s = createClient();
  const { data } = await s
    .from('clienti')
    .select('id, nome, azienda, email, telefono')
    .order('nome', { ascending: true, nullsFirst: false })
    .limit(5000);
  return (data ?? []) as ContattoLite[];
}
