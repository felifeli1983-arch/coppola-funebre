'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { fail, ok, type ActionResult } from '@/lib/admin/types';

// Server actions for: business data, legal texts, admin users, documents.
// All run under the logged-in admin session; RLS (`is_admin()`) enforces access.

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

async function setImpostazione(chiave: string, valore: unknown): Promise<boolean> {
  const s = createClient();
  const { error } = await s
    .from('impostazioni')
    .upsert({ chiave, valore, updated_at: new Date().toISOString() }, { onConflict: 'chiave' });
  if (error) console.error('setImpostazione', chiave, error);
  return !error;
}

// ── Dati attività ────────────────────────────────────────────────────────

// ('use server' modules may only export async functions.)
const NEGOZIO_FIELDS = [
  'nome',
  'email',
  'telefono',
  'indirizzo',
  'citta',
  'cap',
  'provincia',
  'partita_iva',
  'codice_fiscale',
  'pec',
  'sito',
] as const;

export async function salvaDatiAttivita(fd: FormData): Promise<ActionResult> {
  const valore: Record<string, string> = {};
  for (const k of NEGOZIO_FIELDS) valore[k] = str(fd, k);
  if (!valore.nome) return fail('Inserisci il nome dell’attività.');
  if (valore.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valore.email)) return fail('Email non valida.');
  if (valore.pec && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valore.pec)) return fail('Indirizzo PEC non valido.');
  if (!(await setImpostazione('negozio', valore))) return fail('Salvataggio non riuscito. Riprova.');
  revalidatePath('/admin/impostazioni');
  revalidatePath('/negozio', 'layout');
  return ok('Dati dell’attività salvati');
}

// ── Testi legali ─────────────────────────────────────────────────────────

export async function salvaTestoLegale(fd: FormData): Promise<ActionResult> {
  const tipo = str(fd, 'tipo');
  if (tipo !== 'privacy' && tipo !== 'cookie') return fail('Documento non valido.');
  const contenuto = String(fd.get('contenuto') ?? '');
  if (!contenuto.trim()) return fail('Il testo non può essere vuoto. Usa “Ripristina testo predefinito” per tornare all’originale.');
  if (!(await setImpostazione(`legale_${tipo}`, { contenuto }))) {
    return fail('Salvataggio non riuscito. Riprova.');
  }
  revalidateLegale(tipo);
  return ok(tipo === 'privacy' ? 'Privacy Policy aggiornata sul sito' : 'Cookie Policy aggiornata sul sito');
}

/** Drops the custom text so the page shows the built-in default again. */
export async function ripristinaTestoLegale(fd: FormData): Promise<ActionResult> {
  const tipo = str(fd, 'tipo');
  if (tipo !== 'privacy' && tipo !== 'cookie') return fail('Documento non valido.');
  const s = createClient();
  const { error } = await s.from('impostazioni').delete().eq('chiave', `legale_${tipo}`);
  if (error) return fail('Ripristino non riuscito. Riprova.');
  revalidateLegale(tipo);
  return ok('Testo predefinito ripristinato');
}

function revalidateLegale(tipo: 'privacy' | 'cookie') {
  revalidatePath(`/admin/legale/${tipo}`);
  revalidatePath(tipo === 'privacy' ? '/privacy-policy' : '/cookie-policy');
}

function revalidateDocumenti() {
  revalidatePath('/admin/documenti');
  revalidatePath('/documenti');
  revalidatePath('/privacy-policy');
}

// ── Utenti amministratori ────────────────────────────────────────────────

const KNOWN_DB_MESSAGES = [
  'Email non valida',
  'La password deve avere almeno 8 caratteri',
  'Questo utente è già un amministratore',
  'Non puoi rimuovere il tuo stesso account',
  'Deve restare almeno un amministratore',
  'Non autorizzato',
];

function friendly(message: string | undefined, fallback: string): string {
  const hit = KNOWN_DB_MESSAGES.find((m) => message?.includes(m));
  if (hit === 'Non autorizzato') return 'Non hai i permessi per questa operazione.';
  return hit ? `${hit}.` : fallback;
}

export async function aggiungiAmministratore(fd: FormData): Promise<ActionResult> {
  const email = str(fd, 'email').toLowerCase();
  const password = String(fd.get('password') ?? '');
  const conferma = String(fd.get('conferma') ?? '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Email non valida.');
  if (password.length < 8) return fail('La password deve avere almeno 8 caratteri.');
  if (password !== conferma) return fail('Le due password non coincidono.');

  const s = createClient();
  const { error } = await s.rpc('admin_crea_utente', { p_email: email, p_password: password });
  if (error) {
    console.error('admin_crea_utente', error);
    return fail(friendly(error.message, 'Non è stato possibile aggiungere l’amministratore. Riprova.'));
  }
  revalidatePath('/admin/impostazioni/utenti');
  return ok(`${email} ora può accedere al gestionale`);
}

export async function rimuoviAmministratore(fd: FormData): Promise<ActionResult> {
  const userId = str(fd, 'user_id');
  if (!userId) return fail('Utente non valido.');
  const s = createClient();
  const { error } = await s.rpc('admin_rimuovi_utente', { p_user_id: userId });
  if (error) {
    console.error('admin_rimuovi_utente', error);
    return fail(friendly(error.message, 'Non è stato possibile rimuovere l’accesso. Riprova.'));
  }
  revalidatePath('/admin/impostazioni/utenti');
  return ok('Accesso rimosso');
}

export async function cambiaPassword(fd: FormData): Promise<ActionResult> {
  const password = String(fd.get('password') ?? '');
  const conferma = String(fd.get('conferma') ?? '');
  if (password.length < 8) return fail('La password deve avere almeno 8 caratteri.');
  if (password !== conferma) return fail('Le due password non coincidono.');
  const s = createClient();
  const { error } = await s.auth.updateUser({ password });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes('different')) return fail('La nuova password deve essere diversa da quella attuale.');
    if (m.includes('weak') || m.includes('pwned') || m.includes('leaked'))
      return fail('Password troppo debole o già nota: scegline una più sicura.');
    if (m.includes('reauth') || m.includes('session'))
      return fail('Sessione scaduta: esci e rientra, poi riprova.');
    return fail('Non è stato possibile aggiornare la password. Riprova.');
  }
  return ok('Password aggiornata');
}

// ── Documenti ────────────────────────────────────────────────────────────
// The file itself is uploaded straight from the browser to Storage (no size
// limit from server actions); these actions only manage the catalogue rows.

export async function registraDocumento(fd: FormData): Promise<ActionResult> {
  const titolo = str(fd, 'titolo');
  const storage_path = str(fd, 'storage_path');
  if (!titolo) return fail('Inserisci un titolo.');
  if (!storage_path) return fail('Seleziona un file.');
  const s = createClient();
  const { error } = await s.from('documenti').insert({
    titolo,
    descrizione: str(fd, 'descrizione') || null,
    tipo: str(fd, 'tipo') || 'generico',
    pubblico: str(fd, 'pubblico') === 'true',
    storage_path,
  });
  if (error) {
    console.error('registraDocumento', error);
    await s.storage.from('documenti').remove([storage_path]);
    return fail('Non è stato possibile salvare il documento. Riprova.');
  }
  revalidateDocumenti();
  return ok(str(fd, 'pubblico') === 'true' ? 'Documento caricato e pubblicato sul sito' : 'Documento caricato');
}

export async function modificaDocumento(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const titolo = str(fd, 'titolo');
  if (!id) return fail('Documento non valido.');
  if (!titolo) return fail('Inserisci un titolo.');
  const s = createClient();
  const { error } = await s
    .from('documenti')
    .update({
      titolo,
      descrizione: str(fd, 'descrizione') || null,
      tipo: str(fd, 'tipo') || 'generico',
      pubblico: str(fd, 'pubblico') === 'true',
    })
    .eq('id', id);
  if (error) return fail('Aggiornamento non riuscito. Riprova.');
  revalidateDocumenti();
  return ok('Documento aggiornato');
}

export async function impostaVisibilitaDocumento(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const pubblico = str(fd, 'pubblico') === 'true';
  const s = createClient();
  const { error } = await s.from('documenti').update({ pubblico }).eq('id', id);
  if (error) return fail('Aggiornamento non riuscito. Riprova.');
  revalidateDocumenti();
  return ok(pubblico ? 'Documento visibile sul sito' : 'Documento nascosto dal sito');
}

export async function eliminaDocumento(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const path = str(fd, 'path');
  const s = createClient();
  if (path) await s.storage.from('documenti').remove([path]);
  const { error } = await s.from('documenti').delete().eq('id', id);
  if (error) return fail('Eliminazione non riuscita. Riprova.');
  revalidateDocumenti();
  return ok('Documento eliminato');
}
