import Link from 'next/link';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { getAllProdotti } from '@/lib/shop/admin-queries';
import { formatPrice, productImageUrl } from '@/lib/shop/format';
import { toggleProdotto, deleteProdotto } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function AdminProdotti() {
  const prodotti = await getAllProdotti();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Prodotti</h1>
          <p className="mt-1 text-stone-500">{prodotti.length} prodotti a catalogo.</p>
        </div>
        <Link
          href="/admin/prodotti/nuovo"
          className="inline-flex items-center gap-2 rounded-md bg-[#7F1518] px-4 py-2 text-sm font-medium text-white hover:bg-[#5A0F12]"
        >
          <Plus size={16} /> Nuovo prodotto
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {prodotti.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Nessun prodotto. Aggiungine uno →</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="p-3 font-medium">Prodotto</th>
                <th className="hidden p-3 font-medium md:table-cell">Categoria</th>
                <th className="p-3 font-medium">Prezzo</th>
                <th className="hidden p-3 font-medium sm:table-cell">Giacenza</th>
                <th className="p-3 font-medium">Stato</th>
                <th className="p-3 text-right font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {prodotti.map((p) => {
                const img = p.immagini?.[0]?.storage_path;
                return (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded bg-stone-100">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={productImageUrl(img)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package size={16} className="text-stone-300" />
                          )}
                        </div>
                        <span className="font-medium text-stone-900">{p.titolo}</span>
                      </div>
                    </td>
                    <td className="hidden p-3 text-stone-500 md:table-cell">{p.categoria?.nome ?? '—'}</td>
                    <td className="p-3 text-stone-700">{formatPrice(p.prezzo_cent, p.valuta)}</td>
                    <td className="hidden p-3 text-stone-700 sm:table-cell">{p.giacenza}</td>
                    <td className="p-3">
                      <form action={toggleProdotto}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="attivo" value={String(p.attivo)} />
                        <button
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                            p.attivo ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {p.attivo ? 'Attivo' : 'Nascosto'}
                        </button>
                      </form>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/prodotti/${p.id}`} className="text-stone-400 hover:text-[#7F1518]" title="Modifica">
                          <Pencil size={15} />
                        </Link>
                        <form action={deleteProdotto}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="text-stone-400 hover:text-[#7F1518]" title="Elimina">
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
