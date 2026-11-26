import type { Metadata } from 'next';
import GuideHome, { type GuideFacts } from '@/components/admin/guide/GuideHome';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Guida all’uso' };
export const dynamic = 'force-dynamic';

async function getFacts(): Promise<GuideFacts> {
  const s = createClient();
  const head = { count: 'exact' as const, head: true };
  const [negozio, spedizione, prodotti, immagini, clienti, promemoria, admins] = await Promise.all([
    s.from('impostazioni').select('valore').eq('chiave', 'negozio').maybeSingle(),
    s.from('impostazioni').select('chiave').eq('chiave', 'spedizione').maybeSingle(),
    s.from('prodotti').select('id', head),
    s.from('prodotti_immagini').select('prodotto_id'),
    s.from('clienti').select('id', head),
    s.from('clienti_attivita').select('id', head).not('scadenza', 'is', null),
    s.from('admins').select('user_id', head),
  ]);
  const n = (negozio.data?.valore ?? {}) as Record<string, string>;
  return {
    businessData: Boolean(n.nome && (n.telefono || n.email)),
    shipping: Boolean(spedizione.data),
    productsTotal: prodotti.count ?? 0,
    productsWithPhotos: new Set((immagini.data ?? []).map((r) => r.prodotto_id)).size,
    contacts: clienti.count ?? 0,
    reminders: promemoria.count ?? 0,
    admins: admins.count ?? 0,
  };
}

export default async function GuidaPage() {
  return <GuideHome facts={await getFacts()} />;
}
