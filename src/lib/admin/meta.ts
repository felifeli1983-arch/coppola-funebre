// Labels/variants for enum-like fields, shared by every admin screen.

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'muted'
  | 'brand';

// ── Orders ────────────────────────────────────────────────────────────────
export const ORDER_STATUS: Record<string, { label: string; variant: BadgeVariant; step: number }> = {
  in_attesa: { label: 'In attesa', variant: 'warning', step: 0 },
  pagato: { label: 'Pagato', variant: 'info', step: 1 },
  spedito: { label: 'Spedito', variant: 'brand', step: 2 },
  consegnato: { label: 'Consegnato', variant: 'success', step: 3 },
  annullato: { label: 'Annullato', variant: 'muted', step: -1 },
  rimborsato: { label: 'Rimborsato', variant: 'destructive', step: -1 },
};
export const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUS);
/** Orders that still need someone to act on them. */
export const ORDER_OPEN_STATUSES = ['in_attesa', 'pagato'];
/** Orders counted as revenue. */
export const ORDER_REVENUE_STATUSES = ['pagato', 'spedito', 'consegnato'];

// ── CRM contacts ──────────────────────────────────────────────────────────
export const CONTACT_STAGE: Record<string, { label: string; variant: BadgeVariant; hint: string }> = {
  nuovo: { label: 'Nuovo', variant: 'info', hint: 'Contatto appena acquisito' },
  contattato: { label: 'Contattato', variant: 'secondary', hint: 'Primo contatto avvenuto' },
  preventivo: { label: 'Preventivo', variant: 'warning', hint: 'Preventivo inviato, in attesa' },
  cliente: { label: 'Cliente', variant: 'success', hint: 'Ha acquistato un servizio o un prodotto' },
  perso: { label: 'Non interessato', variant: 'muted', hint: 'Trattativa chiusa senza esito' },
};
export const CONTACT_STAGE_KEYS = Object.keys(CONTACT_STAGE);

export const CONTACT_TYPE: Record<string, string> = { privato: 'Privato', azienda: 'Azienda' };

export const CONTACT_SOURCE: Record<string, string> = {
  shop: 'Negozio online',
  sito: 'Sito web',
  telefono: 'Telefono',
  passaparola: 'Passaparola',
  social: 'Social',
  sede: 'In sede',
  altro: 'Altro',
};
export const CONTACT_SOURCE_KEYS = Object.keys(CONTACT_SOURCE);

// ── CRM activities ────────────────────────────────────────────────────────
export const ACTIVITY_TYPE: Record<string, { label: string; tone: string }> = {
  nota: { label: 'Nota', tone: 'bg-muted text-muted-foreground' },
  chiamata: { label: 'Chiamata', tone: 'bg-info/10 text-info' },
  email: { label: 'Email', tone: 'bg-chart-3/15 text-chart-3' },
  whatsapp: { label: 'WhatsApp', tone: 'bg-success/10 text-success' },
  incontro: { label: 'Incontro', tone: 'bg-chart-5/15 text-chart-5' },
  preventivo: { label: 'Preventivo', tone: 'bg-warning/15 text-warning' },
  ordine: { label: 'Ordine', tone: 'bg-primary/10 text-primary' },
  sistema: { label: 'Aggiornamento', tone: 'bg-muted text-muted-foreground' },
};
/** Types a person can log by hand (ordine/sistema are automatic). */
export const ACTIVITY_MANUAL_TYPES = ['nota', 'chiamata', 'email', 'whatsapp', 'incontro', 'preventivo'];
