'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/supabase/env';
import { parsePriceToCents } from '@/lib/shop/format';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: 'categorie' | 'prodotti',
  base: string,
  ignoreId?: string,
): Promise<string> {
  const root = base || 'voce';
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = supabase.from(table).select('id').eq('slug', candidate);
    if (ignoreId) q = q.neq('id', ignoreId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now()}`;
}

// ── Categorie ───────────────────────────────────────────────────────
export async function createCategoria(formData: FormData) {
  const supabase = createClient();
  const nome = String(formData.get('nome') ?? '').trim();
  const parent_id = (String(formData.get('parent_id') ?? '').trim() || null) as string | null;
  if (!nome) return;
  const slug = await uniqueSlug(supabase, 'categorie', slugify(nome));
  await supabase.from('categorie').insert({ nome, slug, parent_id });
  revalidatePath('/admin/categorie');
  revalidatePath('/negozio');
}

export async function toggleCategoria(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  const attivo = String(formData.get('attivo') ?? '') === 'true';
  await supabase.from('categorie').update({ attivo: !attivo }).eq('id', id);
  revalidatePath('/admin/categorie');
  revalidatePath('/negozio');
}

export async function deleteCategoria(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  await supabase.from('categorie').delete().eq('id', id);
  revalidatePath('/admin/categorie');
  revalidatePath('/negozio');
}

// ── Prodotti ────────────────────────────────────────────────────────
export async function saveProdotto(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '').trim();
  const titolo = String(formData.get('titolo') ?? '').trim();
  if (!titolo) return;

  const descrizione = String(formData.get('descrizione') ?? '').trim() || null;
  const prezzo_cent = parsePriceToCents(String(formData.get('prezzo') ?? '0'));
  const giacenza = parseInt(String(formData.get('giacenza') ?? '0'), 10) || 0;
  const categoria_id = String(formData.get('categoria_id') ?? '').trim() || null;
  const attivo = formData.get('attivo') != null;
  const peso = parseInt(String(formData.get('peso_grammi') ?? ''), 10);
  const peso_grammi = Number.isFinite(peso) ? peso : null;

  const fields = { titolo, descrizione, prezzo_cent, giacenza, categoria_id, attivo, peso_grammi };

  let prodottoId = id;
  if (id) {
    await supabase.from('prodotti').update(fields).eq('id', id);
  } else {
    const slug = await uniqueSlug(supabase, 'prodotti', slugify(titolo));
    const { data } = await supabase
      .from('prodotti')
      .insert({ ...fields, slug })
      .select('id')
      .single();
    prodottoId = data?.id ?? '';
  }

  const file = formData.get('immagine') as File | null;
  if (prodottoId && file && typeof file === 'object' && file.size > 0) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${prodottoId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('prodotti')
      .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: true });
    if (!upErr) {
      await supabase
        .from('prodotti_immagini')
        .insert({ prodotto_id: prodottoId, storage_path: path, ordine: 0 });
    }
  }

  revalidatePath('/admin/prodotti');
  revalidatePath('/negozio');
  redirect('/admin/prodotti');
}

export async function toggleProdotto(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  const attivo = String(formData.get('attivo') ?? '') === 'true';
  await supabase.from('prodotti').update({ attivo: !attivo }).eq('id', id);
  revalidatePath('/admin/prodotti');
  revalidatePath('/negozio');
}

export async function deleteProdotto(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  await supabase.from('prodotti').delete().eq('id', id);
  revalidatePath('/admin/prodotti');
  revalidatePath('/negozio');
}

// ── Clienti (CRM) ───────────────────────────────────────────────────
export async function saveCliente(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const nome = String(formData.get('nome') ?? '').trim() || null;
  if (!email) return;

  const indirizzo = {
    via: String(formData.get('via') ?? '').trim(),
    citta: String(formData.get('citta') ?? '').trim(),
    cap: String(formData.get('cap') ?? '').trim(),
    provincia: String(formData.get('provincia') ?? '').trim(),
  };
  const fields = {
    email,
    nome,
    telefono: String(formData.get('telefono') ?? '').trim() || null,
    note: String(formData.get('note') ?? '').trim() || null,
    indirizzo,
  };

  if (id) {
    await supabase.from('clienti').update(fields).eq('id', id);
  } else {
    await supabase.from('clienti').upsert(fields, { onConflict: 'email' });
  }
  revalidatePath('/admin/clienti');
  redirect('/admin/clienti');
}

export async function deleteCliente(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  await supabase.from('clienti').delete().eq('id', id);
  revalidatePath('/admin/clienti');
  redirect('/admin/clienti');
}

// ── Ordini ──────────────────────────────────────────────────────────
export async function updateOrdineStato(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  const stato = String(formData.get('stato') ?? '');
  const tracking = String(formData.get('tracking') ?? '').trim() || null;
  const update: Record<string, unknown> = {};
  if (stato) update.stato = stato;
  update.tracking = tracking;
  await supabase.from('ordini').update(update).eq('id', id);
  revalidatePath('/admin/ordini');
  revalidatePath(`/admin/ordini/${id}`);
}

// ── Impostazioni (key/value) ────────────────────────────────────────
async function setImpostazione(chiave: string, valore: unknown) {
  const supabase = createClient();
  await supabase.from('impostazioni').upsert(
    { chiave, valore, updated_at: new Date().toISOString() },
    { onConflict: 'chiave' },
  );
}

export async function saveSpedizione(formData: FormData) {
  await setImpostazione('spedizione', {
    costo_cent: parsePriceToCents(String(formData.get('costo') ?? '0')),
    soglia_gratis_cent: parsePriceToCents(String(formData.get('soglia') ?? '0')),
    attiva: formData.get('attiva') != null,
  });
  revalidatePath('/admin/impostazioni');
  revalidatePath('/negozio/checkout');
}

export async function saveNegozio(formData: FormData) {
  await setImpostazione('negozio', {
    nome: String(formData.get('nome') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    telefono: String(formData.get('telefono') ?? '').trim(),
  });
  revalidatePath('/admin/impostazioni');
}

// ── Legale (editable privacy / cookie text) ─────────────────────────
export async function saveLegale(formData: FormData) {
  const tipo = String(formData.get('tipo') ?? ''); // 'privacy' | 'cookie'
  const contenuto = String(formData.get('contenuto') ?? '');
  if (tipo !== 'privacy' && tipo !== 'cookie') return;
  await setImpostazione(`legale_${tipo}`, { contenuto });
  revalidatePath(`/admin/legale/${tipo}`);
  revalidatePath(tipo === 'privacy' ? '/privacy-policy' : '/cookie-policy');
}

// ── Documenti ───────────────────────────────────────────────────────
export async function saveDocumento(formData: FormData) {
  const supabase = createClient();
  const titolo = String(formData.get('titolo') ?? '').trim();
  const tipo = String(formData.get('tipo') ?? 'generico').trim() || 'generico';
  const descrizione = String(formData.get('descrizione') ?? '').trim() || null;
  const pubblico = formData.get('pubblico') != null;
  const file = formData.get('file') as File | null;
  if (!titolo || !file || typeof file !== 'object' || file.size === 0) return;

  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
  const path = `${Date.now()}-${titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.${ext}`;
  const { error } = await supabase.storage
    .from('documenti')
    .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: true });
  if (!error) {
    await supabase.from('documenti').insert({ titolo, tipo, descrizione, pubblico, storage_path: path });
  }
  revalidatePath('/admin/documenti');
}

export async function deleteDocumento(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  const path = String(formData.get('path') ?? '');
  if (path) await supabase.storage.from('documenti').remove([path]);
  await supabase.from('documenti').delete().eq('id', id);
  revalidatePath('/admin/documenti');
}

// ── Utenti admin ────────────────────────────────────────────────────
// Creating an auth user requires the service-role key. We gate on it and
// return a friendly result the page can show, instead of throwing.
export async function createAdminUtente(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || password.length < 8) {
    return { ok: false, message: 'Email valida e password di almeno 8 caratteri richieste.' };
  }
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      message:
        'Per creare utenti dall’admin serve la chiave SUPABASE_SERVICE_ROLE_KEY nelle variabili d’ambiente. Contatta lo sviluppatore o aggiungila su Vercel.',
    };
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      return { ok: false, message: error?.message ?? 'Creazione utente non riuscita.' };
    }
    await admin.from('admins').upsert({ user_id: data.user.id, email }, { onConflict: 'user_id' });
    revalidatePath('/admin/impostazioni/utenti');
    return { ok: true, message: `Utente ${email} creato.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Errore imprevisto.' };
  }
}

export async function removeAdminUtente(formData: FormData) {
  const user_id = String(formData.get('user_id') ?? '');
  if (!user_id) return;
  const supabase = createClient();
  // Remove from the allowlist (revokes panel access). The auth account itself
  // is left intact; full deletion needs the service role + Supabase dashboard.
  await supabase.from('admins').delete().eq('user_id', user_id);
  if (isSupabaseAdminConfigured()) {
    try {
      await createAdminClient().auth.admin.deleteUser(user_id);
    } catch {
      /* allowlist removal already revoked access */
    }
  }
  revalidatePath('/admin/impostazioni/utenti');
}

export async function changeMyPassword(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const password = String(formData.get('password') ?? '');
  if (password.length < 8) {
    return { ok: false, message: 'La password deve avere almeno 8 caratteri.' };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Password aggiornata.' };
}
