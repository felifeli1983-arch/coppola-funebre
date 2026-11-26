'use server';

import { createClient } from '@/lib/supabase/server';

export type SearchResults = {
  contatti: { id: string; nome: string | null; email: string | null; telefono: string | null; azienda: string | null }[];
  ordini: { id: string; numero: number; email: string; stato: string; totale_cent: number }[];
  prodotti: { id: string; titolo: string; prezzo_cent: number; attivo: boolean }[];
};

const EMPTY: SearchResults = { contatti: [], ordini: [], prodotti: [] };

/** Global admin search used by the ⌘K command palette. RLS limits it to admins. */
export async function cercaGlobale(q: string): Promise<SearchResults> {
  // Strip PostgREST filter meta-characters so the term can't alter the query.
  const term = (q ?? '').trim().replace(/[,().*%\\"']/g, ' ').trim().slice(0, 60);
  if (term.length < 2) return EMPTY;
  const s = createClient();
  const like = `%${term}%`;
  const numero = /^#?\d+$/.test(term) ? Number(term.replace('#', '')) : null;

  const [contatti, ordini, prodotti] = await Promise.all([
    s
      .from('clienti')
      .select('id, nome, email, telefono, azienda')
      .or(`nome.ilike.${like},email.ilike.${like},telefono.ilike.${like},azienda.ilike.${like}`)
      .limit(6),
    numero != null
      ? s.from('ordini').select('id, numero, email, stato, totale_cent').eq('numero', numero).limit(6)
      : s.from('ordini').select('id, numero, email, stato, totale_cent').ilike('email', like).order('created_at', { ascending: false }).limit(6),
    s.from('prodotti').select('id, titolo, prezzo_cent, attivo').ilike('titolo', like).limit(6),
  ]);

  return {
    contatti: (contatti.data ?? []) as SearchResults['contatti'],
    ordini: (ordini.data ?? []) as SearchResults['ordini'],
    prodotti: (prodotti.data ?? []) as SearchResults['prodotti'],
  };
}
