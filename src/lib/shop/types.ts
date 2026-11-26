// Domain types for the shop. Mirror the Postgres schema in
// supabase/migrations/0001_init.sql.

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  parent_id: string | null;
  descrizione: string | null;
  ordine: number;
  attivo: boolean;
  created_at: string;
};

export type ProdottoImmagine = {
  id: string;
  prodotto_id: string;
  storage_path: string;
  alt: string | null;
  ordine: number;
};

export type Prodotto = {
  id: string;
  titolo: string;
  slug: string;
  descrizione: string | null;
  prezzo_cent: number;
  valuta: string;
  giacenza: number;
  attivo: boolean;
  categoria_id: string | null;
  ordine: number;
  peso_grammi: number | null;
  created_at: string;
  updated_at: string;
  immagini?: ProdottoImmagine[];
};

export type StatoOrdine =
  | 'in_attesa'
  | 'pagato'
  | 'spedito'
  | 'consegnato'
  | 'annullato'
  | 'rimborsato';

export type Indirizzo = {
  nome?: string;
  via?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
  telefono?: string;
};

export type Ordine = {
  id: string;
  numero: number;
  cliente_id: string | null;
  email: string;
  stato: StatoOrdine;
  totale_cent: number;
  valuta: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  indirizzo_spedizione: Indirizzo | null;
  indirizzo_fatturazione: Indirizzo | null;
  metodo_spedizione: string | null;
  costo_spedizione_cent: number;
  tracking: string | null;
  note: string | null;
  created_at: string;
};

export type RigaOrdine = {
  id: string;
  ordine_id: string;
  prodotto_id: string | null;
  titolo: string;
  prezzo_cent: number;
  quantita: number;
};

export type Cliente = {
  id: string;
  email: string;
  nome: string | null;
  telefono: string | null;
  indirizzo: Indirizzo | null;
  note: string | null;
  created_at: string;
};
