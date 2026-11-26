import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { ORDER_OPEN_STATUSES, ORDER_REVENUE_STATUSES } from '@/lib/admin/meta';

// Read-only queries for the dashboard and the visits analytics page. All run
// under the logged-in admin session (RLS `is_admin()`).

const TZ = 'Europe/Rome';
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

/** YYYY-MM-DD in Italian local time. */
export function dayKey(d: Date | string): string {
  return dayFmt.format(typeof d === 'string' ? new Date(d) : d);
}

/** Last `n` day keys, oldest first, ending today. */
function lastDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(Date.now() - i * 86400000)));
  return out;
}

const daysAgoIso = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

// ── Dashboard ────────────────────────────────────────────────────────────

export type DashboardData = {
  fatturato30: number;
  fatturatoPrev30: number;
  ordini30: number;
  ordiniDaGestire: number;
  nuoviContatti30: number;
  contattiTotali: number;
  visite7: number;
  visitePrev7: number;
  serie: { giorno: string; fatturato: number; ordini: number }[];
  promemoria: {
    id: string;
    tipo: string;
    titolo: string | null;
    testo: string | null;
    scadenza: string;
    cliente: { id: string; nome: string | null; azienda: string | null; email: string | null } | null;
  }[];
  ultimiOrdini: { id: string; numero: number; email: string; stato: string; totale_cent: number; created_at: string; nome: string | null }[];
  ultimiContatti: { id: string; nome: string | null; azienda: string | null; email: string | null; telefono: string | null; stato: string; created_at: string }[];
  scorteBasse: { id: string; titolo: string; giacenza: number }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const s = createClient();
  const since60 = daysAgoIso(60);
  const since30 = daysAgoIso(30);
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString();

  const [ordini60, daGestire, contatti30, contattiTot, visite14, promemoria, ultimiOrdini, ultimiContatti, scorte] =
    await Promise.all([
      s.from('ordini').select('created_at, totale_cent, stato').gte('created_at', since60).limit(10000),
      s.from('ordini').select('id', { count: 'exact', head: true }).in('stato', ORDER_OPEN_STATUSES),
      s.from('clienti').select('id', { count: 'exact', head: true }).gte('created_at', since30),
      s.from('clienti').select('id', { count: 'exact', head: true }),
      s.from('visite').select('created_at').gte('created_at', daysAgoIso(14)).limit(20000),
      s
        .from('clienti_attivita')
        .select('id, tipo, titolo, testo, scadenza, cliente:clienti(id, nome, azienda, email)')
        .eq('completata', false)
        .not('scadenza', 'is', null)
        .lte('scadenza', in7days)
        .order('scadenza', { ascending: true })
        .limit(8),
      s
        .from('ordini')
        .select('id, numero, email, stato, totale_cent, created_at, indirizzo_spedizione')
        .order('created_at', { ascending: false })
        .limit(5),
      s
        .from('clienti')
        .select('id, nome, azienda, email, telefono, stato, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      s
        .from('prodotti')
        .select('id, titolo, giacenza')
        .eq('attivo', true)
        .lte('giacenza', 3)
        .order('giacenza', { ascending: true })
        .limit(6),
    ]);

  const days = lastDays(30);
  const byDay = new Map(days.map((d) => [d, { giorno: d, fatturato: 0, ordini: 0 }]));
  const cutoff30 = Date.now() - 30 * 86400000;
  let fatturato30 = 0;
  let fatturatoPrev30 = 0;
  let ordini30 = 0;
  for (const o of ordini60.data ?? []) {
    const t = new Date(o.created_at).getTime();
    const revenue = ORDER_REVENUE_STATUSES.includes(o.stato) ? o.totale_cent ?? 0 : 0;
    if (t >= cutoff30) {
      fatturato30 += revenue;
      if (o.stato !== 'annullato') ordini30 += 1;
      const b = byDay.get(dayKey(o.created_at));
      if (b) {
        b.fatturato += revenue / 100;
        if (o.stato !== 'annullato') b.ordini += 1;
      }
    } else {
      fatturatoPrev30 += revenue;
    }
  }

  const cutoff7 = Date.now() - 7 * 86400000;
  let visite7 = 0;
  let visitePrev7 = 0;
  for (const v of visite14.data ?? []) {
    if (new Date(v.created_at).getTime() >= cutoff7) visite7++;
    else visitePrev7++;
  }

  return {
    fatturato30,
    fatturatoPrev30,
    ordini30,
    ordiniDaGestire: daGestire.count ?? 0,
    nuoviContatti30: contatti30.count ?? 0,
    contattiTotali: contattiTot.count ?? 0,
    visite7,
    visitePrev7,
    serie: [...byDay.values()].map((d) => ({ ...d, fatturato: Math.round(d.fatturato * 100) / 100 })),
    promemoria: ((promemoria.data ?? []) as unknown as DashboardData['promemoria']).map((p) => ({
      ...p,
      cliente: Array.isArray(p.cliente) ? (p.cliente[0] ?? null) : p.cliente,
    })),
    ultimiOrdini: (ultimiOrdini.data ?? []).map((o) => ({
      id: o.id,
      numero: o.numero,
      email: o.email,
      stato: o.stato,
      totale_cent: o.totale_cent,
      created_at: o.created_at,
      nome: (o.indirizzo_spedizione as { nome?: string } | null)?.nome || null,
    })),
    ultimiContatti: (ultimiContatti.data ?? []) as DashboardData['ultimiContatti'],
    scorteBasse: (scorte.data ?? []) as DashboardData['scorteBasse'],
  };
}

// ── Visits analytics ─────────────────────────────────────────────────────

export type Ranked = { label: string; n: number };

export type VisiteData = {
  giorni: number;
  totale: number;
  oggi: number;
  mediaGiornaliera: number;
  pagineUniche: number;
  perGiorno: { giorno: string; visite: number }[];
  referrer: Ranked[];
  sorgenti: Ranked[];
  paesi: Ranked[];
  dispositivi: Ranked[];
  pagine: Ranked[];
  troncato: boolean;
};

const LIMIT = 20000;

function rank(values: (string | null | undefined)[], fallback: string, top = 8): Ranked[] {
  const m = new Map<string, number>();
  for (const raw of values) {
    const v = (raw ?? '').trim() || fallback;
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, n]) => ({ label, n }));
}

export async function getVisiteData(giorni: number): Promise<VisiteData> {
  const s = createClient();
  const { data } = await s
    .from('visite')
    .select('path, referrer_host, utm_source, utm_medium, paese, device, created_at')
    .gte('created_at', daysAgoIso(giorni))
    .order('created_at', { ascending: false })
    .limit(LIMIT);
  const rows = data ?? [];

  const days = lastDays(giorni);
  const perGiorno = new Map(days.map((d) => [d, 0]));
  const today = dayKey(new Date());
  let oggi = 0;
  for (const r of rows) {
    const k = dayKey(r.created_at);
    if (perGiorno.has(k)) perGiorno.set(k, (perGiorno.get(k) ?? 0) + 1);
    if (k === today) oggi++;
  }

  const sorgente = (r: (typeof rows)[number]) =>
    r.utm_source ? `${r.utm_source}${r.utm_medium ? ` / ${r.utm_medium}` : ''}` : null;

  return {
    giorni,
    totale: rows.length,
    oggi,
    mediaGiornaliera: Math.round((rows.length / giorni) * 10) / 10,
    pagineUniche: new Set(rows.map((r) => r.path || '/')).size,
    perGiorno: [...perGiorno.entries()].map(([giorno, visite]) => ({ giorno, visite })),
    referrer: rank(rows.map((r) => r.referrer_host), 'Accesso diretto'),
    sorgenti: rank(rows.map(sorgente), 'Nessuna campagna', 6),
    paesi: rank(rows.map((r) => r.paese), 'Sconosciuto', 6),
    dispositivi: rank(rows.map((r) => r.device), 'Non rilevato', 5),
    pagine: rank(rows.map((r) => r.path || '/'), '/', 10),
    troncato: rows.length >= LIMIT,
  };
}
