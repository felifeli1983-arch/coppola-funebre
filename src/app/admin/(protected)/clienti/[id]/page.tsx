import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { getClienteById } from '@/lib/shop/admin-queries';
import { deleteCliente } from '@/lib/admin-actions';
import { formatPrice } from '@/lib/shop/format';

export const dynamic = 'force-dynamic';

export default async function ClienteDettaglio({ params }: { params: { id: string } }) {
  const data = await getClienteById(params.id);
  if (!data) notFound();
  const { cliente: c, ordini } = data;
  const ind = c.indirizzo ?? {};
  const speso = ordini
    .filter((o) => ['pagato', 'spedito', 'consegnato'].includes(o.stato))
    .reduce((n, o) => n + o.totale_cent, 0);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/clienti" className="mb-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7F1518]">
        <ArrowLeft size={16} /> Clienti
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 break-words font-serif text-3xl text-stone-900">{c.nome || c.email}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/clienti/${c.id}/modifica`} className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
            <Pencil size={15} /> Modifica
          </Link>
          <form action={deleteCliente}>
            <input type="hidden" name="id" value={c.id} />
            <button className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#7F1518]">
              <Trash2 size={15} /> Elimina
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm">
            <div className="flex items-start gap-2 text-stone-700"><Mail size={15} className="mt-0.5 flex-none text-stone-400" /> <span className="break-all">{c.email}</span></div>
            {c.telefono && <div className="mt-2 flex items-center gap-2 text-stone-700"><Phone size={15} className="flex-none text-stone-400" /> {c.telefono}</div>}
            {(ind.via || ind.citta) && (
              <div className="mt-2 flex items-start gap-2 text-stone-700">
                <MapPin size={15} className="mt-0.5 flex-none text-stone-400" />
                <span>{[ind.via, ind.cap, ind.citta, ind.provincia].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="text-2xl font-semibold text-stone-900">{ordini.length}</div>
              <div className="text-xs text-stone-500">Ordini</div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="text-2xl font-semibold text-stone-900">{formatPrice(speso)}</div>
              <div className="text-xs text-stone-500">Speso</div>
            </div>
          </div>
          {c.note && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide">Note</div>
              <p className="whitespace-pre-wrap">{c.note}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white md:col-span-2">
          <h2 className="border-b border-stone-100 p-4 font-medium text-stone-900">Storico ordini</h2>
          {ordini.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">Nessun ordine.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {ordini.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">#{o.numero}</td>
                    <td className="p-3 text-stone-500">{new Date(o.created_at).toLocaleDateString('it-IT')}</td>
                    <td className="p-3 text-stone-700">{formatPrice(o.totale_cent, o.valuta)}</td>
                    <td className="p-3">
                      <Link href={`/admin/ordini/${o.id}`} className="text-[#7F1518] hover:underline">Apri</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
