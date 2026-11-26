'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parsePriceToCents } from '@/lib/shop/format';
import { ORDER_STATUS } from '@/lib/admin/meta';
import { fail, ok, type ActionResult } from '@/lib/admin/types';

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

/** "12,50", "12.50", "1.250,00" → cents. A lone dot followed by 1–2 digits is a decimal point. */
function euroToCents(raw: string): number {
  const s = raw.replace(/[€\s]/g, '');
  if (/^\d+\.\d{1,2}$/.test(s)) return Math.round(Number(s) * 100);
  return parsePriceToCents(s || '0');
}
const ids = (fd: FormData, k = 'ids') =>
  str(fd, k)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

function revalidateShop() {
  revalidatePath('/admin/prodotti');
  revalidatePath('/admin/categorie');
  revalidatePath('/negozio', 'layout');
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

async function uniqueSlug(
  s: ReturnType<typeof createClient>,
  table: 'categorie' | 'prodotti',
  base: string,
  ignoreId?: string,
): Promise<string> {
  const root = base || 'voce';
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = s.from(table).select('id').eq('slug', candidate);
    if (ignoreId) q = q.neq('id', ignoreId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now()}`;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export async function aggiornaOrdine(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const stato = str(fd, 'stato');
  if (!id) return fail('Ordine non trovato.');
  if (stato && !ORDER_STATUS[stato]) return fail('Stato non valido.');
  const s = createClient();
  const update: Record<string, unknown> = { tracking: str(fd, 'tracking') || null };
  if (stato) update.stato = stato;
  const { error } = await s.from('ordini').update(update).eq('id', id);
  if (error) return fail('Impossibile aggiornare l’ordine. Riprova.');
  revalidatePath('/admin/ordini');
  revalidatePath(`/admin/ordini/${id}`);
  revalidatePath('/admin', 'layout');
  return ok('Ordine aggiornato');
}

export async function aggiornaStatoOrdini(fd: FormData): Promise<ActionResult> {
  const list = ids(fd);
  const stato = str(fd, 'stato');
  if (!list.length) return fail('Nessun ordine selezionato.');
  if (!ORDER_STATUS[stato]) return fail('Stato non valido.');
  const s = createClient();
  const { error } = await s.from('ordini').update({ stato }).in('id', list);
  if (error) return fail('Impossibile aggiornare gli ordini. Riprova.');
  revalidatePath('/admin/ordini');
  revalidatePath('/admin', 'layout');
  const n = list.length;
  return ok(`${n} ${n === 1 ? 'ordine aggiornato' : 'ordini aggiornati'}: ${ORDER_STATUS[stato].label}`);
}

// ── Products ────────────────────────────────────────────────────────────────

export async function salvaProdotto(fd: FormData): Promise<ActionResult> {
  const s = createClient();
  const id = str(fd, 'id');
  const titolo = str(fd, 'titolo');
  if (!titolo) return fail('Il titolo è obbligatorio.');
  const prezzo_cent = euroToCents(str(fd, 'prezzo'));
  if (!Number.isFinite(prezzo_cent) || prezzo_cent < 0) return fail('Il prezzo non è valido.');
  const giacenza = Math.max(0, parseInt(str(fd, 'giacenza') || '0', 10) || 0);
  const peso = parseInt(str(fd, 'peso_grammi'), 10);
  const fields = {
    titolo,
    descrizione: str(fd, 'descrizione') || null,
    prezzo_cent,
    giacenza,
    peso_grammi: Number.isFinite(peso) && peso >= 0 ? peso : null,
    categoria_id: str(fd, 'categoria_id') || null,
    attivo: ['on', 'true', '1'].includes(str(fd, 'attivo')),
  };

  if (id) {
    const { error } = await s.from('prodotti').update(fields).eq('id', id);
    if (error) return fail('Impossibile salvare il prodotto. Riprova.');
    revalidateShop();
    revalidatePath(`/admin/prodotti/${id}`);
    return ok('Prodotto salvato', id);
  }
  const slug = await uniqueSlug(s, 'prodotti', slugify(titolo));
  const { data, error } = await s.from('prodotti').insert({ ...fields, slug }).select('id').single();
  if (error || !data) return fail('Impossibile creare il prodotto. Riprova.');
  revalidateShop();
  return ok('Prodotto creato', data.id);
}

export async function impostaProdottoAttivo(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const attivo = str(fd, 'attivo') === 'true';
  const s = createClient();
  const { error } = await s.from('prodotti').update({ attivo }).eq('id', id);
  if (error) return fail('Impossibile aggiornare il prodotto.');
  revalidateShop();
  return ok(attivo ? 'Prodotto pubblicato nel negozio' : 'Prodotto nascosto dal negozio');
}

async function removeProductFiles(s: ReturnType<typeof createClient>, prodIds: string[]) {
  if (!prodIds.length) return;
  const { data } = await s.from('prodotti_immagini').select('storage_path').in('prodotto_id', prodIds);
  const paths = (data ?? []).map((r) => r.storage_path).filter((p) => p && !p.startsWith('http'));
  if (paths.length) await s.storage.from('prodotti').remove(paths);
}

export async function azioneProdotti(fd: FormData): Promise<ActionResult> {
  const list = ids(fd);
  const azione = str(fd, 'azione');
  if (!list.length) return fail('Nessun prodotto selezionato.');
  const s = createClient();
  const n = list.length;
  if (azione === 'attiva' || azione === 'disattiva') {
    const { error } = await s.from('prodotti').update({ attivo: azione === 'attiva' }).in('id', list);
    if (error) return fail('Operazione non riuscita. Riprova.');
    revalidateShop();
    return ok(`${n} ${n === 1 ? 'prodotto' : 'prodotti'} ${azione === 'attiva' ? 'pubblicati' : 'nascosti'}`);
  }
  if (azione === 'elimina') {
    await removeProductFiles(s, list);
    const { error } = await s.from('prodotti').delete().in('id', list);
    if (error) return fail('Impossibile eliminare i prodotti. Riprova.');
    revalidateShop();
    return ok(`${n} ${n === 1 ? 'prodotto eliminato' : 'prodotti eliminati'}`);
  }
  return fail('Azione non valida.');
}

export async function eliminaProdotto(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  if (!id) return fail('Prodotto non trovato.');
  const s = createClient();
  await removeProductFiles(s, [id]);
  const { error } = await s.from('prodotti').delete().eq('id', id);
  if (error) return fail('Impossibile eliminare il prodotto. Riprova.');
  revalidateShop();
  return ok('Prodotto eliminato');
}

// ── Product images (files are uploaded from the browser straight to storage;
//    these actions only maintain the prodotti_immagini rows) ────────────────

export async function registraImmagini(fd: FormData): Promise<ActionResult> {
  const prodotto_id = str(fd, 'prodotto_id');
  let paths: string[] = [];
  try {
    paths = JSON.parse(str(fd, 'paths') || '[]');
  } catch {
    return fail('Caricamento non valido.');
  }
  paths = paths.filter((p) => typeof p === 'string' && p.startsWith(`${prodotto_id}/`));
  if (!prodotto_id || !paths.length) return fail('Nessuna immagine da salvare.');
  const s = createClient();
  const { data: existing } = await s
    .from('prodotti_immagini')
    .select('ordine')
    .eq('prodotto_id', prodotto_id)
    .order('ordine', { ascending: false })
    .limit(1);
  const start = (existing?.[0]?.ordine ?? -1) + 1;
  const { error } = await s
    .from('prodotti_immagini')
    .insert(paths.map((storage_path, i) => ({ prodotto_id, storage_path, ordine: start + i })));
  if (error) return fail('Impossibile salvare le immagini. Riprova.');
  revalidateShop();
  revalidatePath(`/admin/prodotti/${prodotto_id}`);
  return ok(paths.length === 1 ? 'Immagine caricata' : `${paths.length} immagini caricate`);
}

export async function eliminaImmagine(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const s = createClient();
  const { data: img } = await s.from('prodotti_immagini').select('*').eq('id', id).maybeSingle();
  if (!img) return fail('Immagine non trovata.');
  if (img.storage_path && !img.storage_path.startsWith('http')) {
    await s.storage.from('prodotti').remove([img.storage_path]);
  }
  const { error } = await s.from('prodotti_immagini').delete().eq('id', id);
  if (error) return fail('Impossibile eliminare l’immagine.');
  // Re-number remaining images so the cover is always ordine 0.
  const { data: rest } = await s
    .from('prodotti_immagini')
    .select('id')
    .eq('prodotto_id', img.prodotto_id)
    .order('ordine');
  await Promise.all(
    (rest ?? []).map((r, i) => s.from('prodotti_immagini').update({ ordine: i }).eq('id', r.id)),
  );
  revalidateShop();
  revalidatePath(`/admin/prodotti/${img.prodotto_id}`);
  return ok('Immagine eliminata');
}

export async function riordinaImmagini(fd: FormData): Promise<ActionResult> {
  const prodotto_id = str(fd, 'prodotto_id');
  const order = ids(fd);
  if (!prodotto_id || !order.length) return fail('Ordine non valido.');
  const s = createClient();
  const results = await Promise.all(
    order.map((id, i) =>
      s.from('prodotti_immagini').update({ ordine: i }).eq('id', id).eq('prodotto_id', prodotto_id),
    ),
  );
  if (results.some((r) => r.error)) return fail('Impossibile riordinare le immagini.');
  revalidateShop();
  revalidatePath(`/admin/prodotti/${prodotto_id}`);
  return ok();
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function salvaCategoria(fd: FormData): Promise<ActionResult> {
  const s = createClient();
  const id = str(fd, 'id');
  const nome = str(fd, 'nome');
  if (!nome) return fail('Il nome è obbligatorio.');
  const parent_id = str(fd, 'parent_id') || null;
  if (id && parent_id === id) return fail('Una categoria non può essere dentro se stessa.');
  if (id && parent_id) {
    const { count } = await s.from('categorie').select('id', { count: 'exact', head: true }).eq('parent_id', id);
    if ((count ?? 0) > 0) return fail('Questa categoria ha sottocategorie: non può diventare a sua volta una sottocategoria.');
  }
  const ordineN = parseInt(str(fd, 'ordine'), 10);
  const fields = {
    nome,
    descrizione: str(fd, 'descrizione') || null,
    parent_id,
    ordine: Number.isFinite(ordineN) ? ordineN : 0,
  };
  if (id) {
    const { error } = await s.from('categorie').update(fields).eq('id', id);
    if (error) return fail('Impossibile salvare la categoria.');
    revalidateShop();
    return ok('Categoria aggiornata', id);
  }
  const slug = await uniqueSlug(s, 'categorie', slugify(nome));
  const { data, error } = await s.from('categorie').insert({ ...fields, slug }).select('id').single();
  if (error || !data) return fail('Impossibile creare la categoria.');
  revalidateShop();
  return ok('Categoria creata', data.id);
}

export async function impostaCategoriaAttiva(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const attivo = str(fd, 'attivo') === 'true';
  const s = createClient();
  const { error } = await s.from('categorie').update({ attivo }).eq('id', id);
  if (error) return fail('Impossibile aggiornare la categoria.');
  revalidateShop();
  return ok(attivo ? 'Categoria visibile nel negozio' : 'Categoria nascosta dal negozio');
}

export async function eliminaCategoria(fd: FormData): Promise<ActionResult> {
  const id = str(fd, 'id');
  const s = createClient();
  const { count } = await s.from('categorie').select('id', { count: 'exact', head: true }).eq('parent_id', id);
  if ((count ?? 0) > 0) return fail('Prima elimina o sposta le sottocategorie.');
  const { error } = await s.from('categorie').delete().eq('id', id);
  if (error) return fail('Impossibile eliminare la categoria.');
  revalidateShop();
  return ok('Categoria eliminata');
}

// ── Shipping ────────────────────────────────────────────────────────────────

export async function salvaSpedizioni(fd: FormData): Promise<ActionResult> {
  const costo_cent = euroToCents(str(fd, 'costo'));
  const soglia_gratis_cent = euroToCents(str(fd, 'soglia'));
  if (costo_cent < 0 || soglia_gratis_cent < 0) return fail('Inserisci importi validi.');
  const s = createClient();
  const { error } = await s.from('impostazioni').upsert(
    {
      chiave: 'spedizione',
      valore: { costo_cent, soglia_gratis_cent, attiva: ['on', 'true', '1'].includes(str(fd, 'attiva')) },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'chiave' },
  );
  if (error) return fail('Impossibile salvare le impostazioni di spedizione.');
  revalidatePath('/admin/spedizioni');
  revalidatePath('/negozio', 'layout');
  return ok('Spedizioni aggiornate');
}
