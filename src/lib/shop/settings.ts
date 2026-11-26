import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export type Spedizione = {
  costo_cent: number; // flat shipping cost
  soglia_gratis_cent: number; // free shipping above this (0 = disabled)
  attiva: boolean;
};

export type Negozio = {
  nome: string;
  email: string;
  telefono: string;
};

const DEFAULT_SPEDIZIONE: Spedizione = { costo_cent: 700, soglia_gratis_cent: 10000, attiva: true };
const DEFAULT_NEGOZIO: Negozio = {
  nome: 'Onoranze Funebri Coppola',
  email: 'info@eredicoppola.com',
  telefono: '081 571 3888',
};

async function getSetting<T>(chiave: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  const s = createClient();
  const { data } = await s.from('impostazioni').select('valore').eq('chiave', chiave).maybeSingle();
  return (data?.valore as T) ?? fallback;
}

export function getSpedizione() {
  return getSetting<Spedizione>('spedizione', DEFAULT_SPEDIZIONE);
}
export function getNegozio() {
  return getSetting<Negozio>('negozio', DEFAULT_NEGOZIO);
}

export type LegaleTipo = 'privacy' | 'cookie';
export async function getLegale(tipo: LegaleTipo): Promise<string> {
  const v = await getSetting<{ contenuto?: string }>(`legale_${tipo}`, {});
  return v.contenuto ?? '';
}

/** Shipping cost for a given cart subtotal, applying the free-shipping threshold. */
export function calcolaSpedizione(sub: number, sp: Spedizione): number {
  if (!sp.attiva) return 0;
  if (sp.soglia_gratis_cent > 0 && sub >= sp.soglia_gratis_cent) return 0;
  return sp.costo_cent;
}

export const DEFAULTS = { spedizione: DEFAULT_SPEDIZIONE, negozio: DEFAULT_NEGOZIO };
