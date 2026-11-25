import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { saveProdotto } from '@/lib/admin-actions';
import { productImageUrl } from '@/lib/shop/format';
import type { Categoria, Prodotto } from '@/lib/shop/types';

export default function ProductForm({
  prodotto,
  categorie,
}: {
  prodotto?: Prodotto | null;
  categorie: Categoria[];
}) {
  const p = prodotto ?? null;
  const prezzo = p ? (p.prezzo_cent / 100).toFixed(2).replace('.', ',') : '';
  const label = 'text-xs font-medium uppercase tracking-wide text-stone-500';
  const field =
    'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]';

  // Group categories (parent → children) for a clear select.
  const top = categorie.filter((c) => !c.parent_id);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/prodotti" className="mb-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7F1518]">
        <ArrowLeft size={16} /> Prodotti
      </Link>
      <h1 className="font-serif text-3xl text-stone-900">{p ? 'Modifica prodotto' : 'Nuovo prodotto'}</h1>

      <form action={saveProdotto} encType="multipart/form-data" className="mt-6 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        {p && <input type="hidden" name="id" value={p.id} />}

        <label className="block">
          <span className={label}>Titolo</span>
          <input name="titolo" required defaultValue={p?.titolo ?? ''} className={field} />
        </label>

        <label className="block">
          <span className={label}>Descrizione</span>
          <textarea name="descrizione" rows={4} defaultValue={p?.descrizione ?? ''} className={field} />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={label}>Prezzo (€)</span>
            <input name="prezzo" required defaultValue={prezzo} placeholder="0,00" className={field} />
          </label>
          <label className="block">
            <span className={label}>Giacenza</span>
            <input name="giacenza" type="number" min="0" defaultValue={p?.giacenza ?? 0} className={field} />
          </label>
          <label className="block">
            <span className={label}>Peso (g)</span>
            <input name="peso_grammi" type="number" min="0" defaultValue={p?.peso_grammi ?? ''} className={field} />
          </label>
        </div>

        <label className="block">
          <span className={label}>Categoria</span>
          <select name="categoria_id" defaultValue={p?.categoria_id ?? ''} className={field}>
            <option value="">— Nessuna —</option>
            {top.map((parent) => {
              const subs = categorie.filter((c) => c.parent_id === parent.id);
              return (
                <optgroup key={parent.id} label={parent.nome}>
                  <option value={parent.id}>{parent.nome} (tutto)</option>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {parent.nome} › {s.nome}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>

        <div>
          <span className={label}>Immagine</span>
          {p?.immagini?.[0]?.storage_path && (
            <div className="mt-2 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImageUrl(p.immagini[0].storage_path)} alt="" className="h-24 w-24 rounded object-cover" />
            </div>
          )}
          <input name="immagine" type="file" accept="image/*" className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm" />
          <p className="mt-1 text-xs text-stone-400">JPG/PNG/WebP. Caricando una nuova immagine, questa viene aggiunta al prodotto.</p>
        </div>

        <label className="flex items-center gap-2">
          <input name="attivo" type="checkbox" defaultChecked={p ? p.attivo : true} className="accent-[#7F1518]" />
          <span className="text-sm text-stone-700">Attivo (visibile nello shop)</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button className="rounded-md bg-[#7F1518] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">
            {p ? 'Salva modifiche' : 'Crea prodotto'}
          </button>
          <Link href="/admin/prodotti" className="rounded-md border border-stone-300 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
            Annulla
          </Link>
        </div>
      </form>
    </div>
  );
}
