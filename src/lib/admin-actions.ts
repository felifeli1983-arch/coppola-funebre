'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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
