import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getOrdineById } from '@/lib/shop/admin-queries';
import { updateOrdineStato } from '@/lib/admin-actions';
import { formatPrice } from '@/lib/shop/format';
import type { Indirizzo } from '@/lib/shop/types';

export const dynamic = 'force-dynamic';

const STATI = ['in_attesa', 'pagato', 'spedito', 'consegnato', 'annullato', 'rimborsato'];

function Addr({ a }: { a: Indirizzo | null }) {
  if (!a) return <span className="text-stone-400">—</span>;
  return (
    <div className="text-sm text-stone-700">
      {a.nome && <div className="font-medium">{a.nome}</div>}
      <div>{[a.via, a.cap, a.citta, a.provincia].filter(Boolean).join(', ')}</div>
      {a.telefono && <div>{a.telefono}</div>}
    </div>
  );
}

export default async function OrdineDettaglio({ params }: { params: { id: string } }) {
  const data = await getOrdineById(params.id);
  if (!data) notFound();
  const { ordine: o, righe } = data;

  return (
    <div className="max-w-4xl">
      <Link href="/admin/ordini" className="mb-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7F1518]">
        <ArrowLeft size={16} /> Ordini
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-serif text-3xl text-stone-900">Ordine #{o.numero}</h1>
        <span className="text-sm text-stone-500">{new Date(o.created_at).toLocaleString('it-IT')}</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Items */}
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <h2 className="border-b border-stone-100 p-4 font-medium text-stone-900">Articoli</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {righe.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 text-stone-800">{r.titolo}</td>
                    <td className="p-3 text-stone-500">× {r.quantita}</td>
                    <td className="p-3 text-right text-stone-700">{formatPrice(r.prezzo_cent * r.quantita)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-stone-200">
                {o.costo_spedizione_cent > 0 && (
                  <tr><td className="p-3 text-stone-500" colSpan={2}>Spedizione</td><td className="p-3 text-right text-stone-700">{formatPrice(o.costo_spedizione_cent)}</td></tr>
                )}
                <tr><td className="p-3 font-medium" colSpan={2}>Totale</td><td className="p-3 text-right font-medium text-stone-900">{formatPrice(o.totale_cent, o.valuta)}</td></tr>
              </tfoot>
            </table>
          </div>

          {/* Addresses */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Spedizione</div>
              <Addr a={o.indirizzo_spedizione} />
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Contatto</div>
              <div className="text-sm text-stone-700"><div className="break-all">{o.email}</div></div>
              {o.stripe_payment_intent && <div className="mt-2 break-all text-xs text-stone-400">Stripe: {o.stripe_payment_intent}</div>}
            </div>
          </div>
        </div>

        {/* Status management */}
        <div className="h-fit rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium text-stone-900">Gestione</h2>
          <form action={updateOrdineStato} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={o.id} />
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Stato</span>
              <select name="stato" defaultValue={o.stato} className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]">
                {STATI.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Tracking</span>
              <input name="tracking" defaultValue={o.tracking ?? ''} placeholder="Codice spedizione" className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]" />
            </label>
            <button className="w-full rounded-md bg-[#7F1518] py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">Aggiorna ordine</button>
          </form>
        </div>
      </div>
    </div>
  );
}
