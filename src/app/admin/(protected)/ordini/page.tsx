import Link from 'next/link';
import { getOrdini } from '@/lib/shop/admin-queries';
import { formatPrice } from '@/lib/shop/format';

export const dynamic = 'force-dynamic';

const STATI = ['in_attesa', 'pagato', 'spedito', 'consegnato', 'annullato', 'rimborsato'];
const statoCls: Record<string, string> = {
  in_attesa: 'bg-amber-100 text-amber-700',
  pagato: 'bg-green-100 text-green-700',
  spedito: 'bg-blue-100 text-blue-700',
  consegnato: 'bg-stone-200 text-stone-600',
  annullato: 'bg-red-100 text-red-700',
  rimborsato: 'bg-purple-100 text-purple-700',
};

export default async function AdminOrdini({ searchParams }: { searchParams: { stato?: string } }) {
  const ordini = await getOrdini(searchParams.stato);

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Ordini</h1>
      <p className="mt-1 text-stone-500">Vendite e stato di avanzamento.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/ordini"
          className={`rounded-full px-3 py-1 text-xs font-medium ${!searchParams.stato ? 'bg-[#7F1518] text-white' : 'bg-stone-100 text-stone-600'}`}
        >
          Tutti
        </Link>
        {STATI.map((s) => (
          <Link
            key={s}
            href={`/admin/ordini?stato=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${searchParams.stato === s ? 'bg-[#7F1518] text-white' : 'bg-stone-100 text-stone-600'}`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {ordini.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Nessun ordine{searchParams.stato ? ' con questo stato' : ' ancora'}.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="p-3 font-medium">N.</th>
                <th className="p-3 font-medium">Data</th>
                <th className="p-3 font-medium">Cliente</th>
                <th className="p-3 font-medium">Totale</th>
                <th className="p-3 font-medium">Stato</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ordini.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="p-3 font-medium text-stone-900">
                    <Link href={`/admin/ordini/${o.id}`} className="hover:text-[#7F1518] hover:underline">
                      #{o.numero}
                    </Link>
                  </td>
                  <td className="p-3 text-stone-500">
                    {new Date(o.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td className="max-w-[200px] truncate p-3 text-stone-700">{o.email}</td>
                  <td className="p-3 text-stone-700">{formatPrice(o.totale_cent, o.valuta)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${statoCls[o.stato] ?? 'bg-stone-100 text-stone-600'}`}>
                      {o.stato.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/ordini/${o.id}`} className="text-xs font-medium text-[#7F1518] hover:underline">
                      Dettaglio →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
