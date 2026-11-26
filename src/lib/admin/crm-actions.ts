'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ACTIVITY_MANUAL_TYPES, CONTACT_SOURCE_KEYS, CONTACT_STAGE_KEYS } from '@/lib/admin/meta';
import { fail, ok, type ActionResult } from '@/lib/admin/types';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

function str(fd: FormData, k: string): string {
  return String(fd.get(k) ?? '').trim();
}
function orNull(v: string): string | null {
  return v ? v : null;
}
function ids(fd: FormData): string[] {
  return str(fd, 'ids')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => UUID_RE.test(s));
}

function refreshCrm(id?: string) {
  revalidatePath('/admin/clienti');
  revalidatePath('/admin/pipeline');
  revalidatePath('/admin/attivita');
  if (id) revalidatePath(`/admin/clienti/${id}`);
  // Sidebar counters live in the protected layout.
  revalidatePath('/admin', 'layout');
}

// ── Contacts ──────────────────────────────────────────────────────────────

export async function saveContatto(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const email = str(fd, 'email').toLowerCase();
  const nome = str(fd, 'nome');
  const telefono = str(fd, 'telefono');
  const tipo = str(fd, 'tipo') === 'azienda' ? 'azienda' : 'privato';
  const azienda = tipo === 'azienda' ? str(fd, 'azienda') : '';

  if (!email && !telefono && !nome && !azienda) {
    return fail('Inserisci almeno un nome, un’email o un numero di telefono.');
  }
  if (email && !EMAIL_RE.test(email)) return fail('L’indirizzo email non sembra corretto.');

  const stato = CONTACT_STAGE_KEYS.includes(str(fd, 'stato')) ? str(fd, 'stato') : 'nuovo';
  const fonteRaw = str(fd, 'fonte');
  const fonte = CONTACT_SOURCE_KEYS.includes(fonteRaw) ? fonteRaw : null;
  const tags = Array.from(
    new Set(
      str(fd, 'tags')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => t.slice(0, 40)),
    ),
  ).slice(0, 20);

  const fields = {
    email: orNull(email),
    nome: orNull(nome),
    telefono: orNull(telefono),
    tipo,
    azienda: orNull(azienda),
    codice_fiscale: orNull(str(fd, 'codice_fiscale').toUpperCase()),
    partita_iva: tipo === 'azienda' ? orNull(str(fd, 'partita_iva')) : null,
    stato,
    fonte,
    tags,
    note: orNull(str(fd, 'note')),
    indirizzo: {
      via: str(fd, 'via'),
      citta: str(fd, 'citta'),
      cap: str(fd, 'cap'),
      provincia: str(fd, 'provincia').toUpperCase(),
    },
  };

  const s = createClient();
  if (id) {
    if (!UUID_RE.test(id)) return fail('Contatto non trovato.');
    const { error } = await s.from('clienti').update(fields).eq('id', id);
    if (error) return fail(error.code === '23505' ? 'Esiste già un contatto con questa email.' : 'Non è stato possibile salvare il contatto.');
    refreshCrm(id);
    return ok('Contatto aggiornato', id);
  }

  const { data, error } = await s.from('clienti').insert(fields).select('id').single();
  if (error || !data) {
    return fail(error?.code === '23505' ? 'Esiste già un contatto con questa email.' : 'Non è stato possibile creare il contatto.');
  }
  refreshCrm(data.id);
  return ok('Contatto creato', data.id);
}

export async function deleteContatti(fd: FormData): Promise<ActionResult> {
  const list = ids(fd);
  if (!list.length) return fail('Nessun contatto selezionato.');
  const s = createClient();
  const { error } = await s.from('clienti').delete().in('id', list);
  if (error) return fail('Non è stato possibile eliminare.');
  refreshCrm();
  return ok(list.length === 1 ? 'Contatto eliminato' : `${list.length} contatti eliminati`);
}

export async function setStatoContatti(fd: FormData): Promise<ActionResult> {
  const list = ids(fd);
  const stato = str(fd, 'stato');
  if (!list.length || !CONTACT_STAGE_KEYS.includes(stato)) return fail('Selezione non valida.');
  const s = createClient();
  const { error } = await s.from('clienti').update({ stato }).in('id', list);
  if (error) return fail('Non è stato possibile aggiornare lo stato.');
  refreshCrm(list.length === 1 ? list[0] : undefined);
  return ok(list.length === 1 ? 'Stato aggiornato' : `Stato aggiornato per ${list.length} contatti`);
}

// ── Activities ────────────────────────────────────────────────────────────

export async function addAttivita(fd: FormData): Promise<ActionResult> {
  const cliente_id = str(fd, 'cliente_id');
  if (!UUID_RE.test(cliente_id)) return fail('Scegli un contatto.');
  const tipo = ACTIVITY_MANUAL_TYPES.includes(str(fd, 'tipo')) ? str(fd, 'tipo') : 'nota';
  const titolo = str(fd, 'titolo').slice(0, 200);
  const testo = str(fd, 'testo').slice(0, 5000);
  if (!titolo && !testo) return fail('Scrivi almeno un titolo o una descrizione.');

  // The client sends an ISO timestamp (converted from local time in the browser).
  const scadRaw = str(fd, 'scadenza');
  let scadenza: string | null = null;
  if (scadRaw) {
    const d = new Date(scadRaw);
    if (Number.isNaN(d.getTime())) return fail('La data del promemoria non è valida.');
    scadenza = d.toISOString();
  }
  if (str(fd, 'promemoria') === '1' && !scadenza) {
    return fail('Scegli la data e l’ora del promemoria.');
  }

  const s = createClient();
  const { error } = await s
    .from('clienti_attivita')
    .insert({ cliente_id, tipo, titolo: orNull(titolo), testo: orNull(testo), scadenza });
  if (error) return fail('Non è stato possibile registrare l’attività.');
  refreshCrm(cliente_id);
  return ok(scadenza ? 'Promemoria aggiunto' : 'Attività registrata');
}

export async function toggleAttivita(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  if (!UUID_RE.test(id)) return fail('Attività non trovata.');
  const completata = str(fd, 'completata') === 'true';
  const s = createClient();
  const { data, error } = await s
    .from('clienti_attivita')
    .update({ completata })
    .eq('id', id)
    .select('cliente_id')
    .maybeSingle();
  if (error) return fail('Non è stato possibile aggiornare l’attività.');
  refreshCrm(data?.cliente_id);
  return ok(completata ? 'Segnata come completata' : 'Riaperta');
}

export async function deleteAttivita(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  if (!UUID_RE.test(id)) return fail('Attività non trovata.');
  const s = createClient();
  const { data, error } = await s
    .from('clienti_attivita')
    .delete()
    .eq('id', id)
    .select('cliente_id')
    .maybeSingle();
  if (error) return fail('Non è stato possibile eliminare l’attività.');
  refreshCrm(data?.cliente_id);
  return ok('Attività eliminata');
}
