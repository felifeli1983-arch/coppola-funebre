import Link from 'next/link';
import { Plus, Search, Mail, Phone, ArrowRight } from 'lucide-react';
import { getClientiConStats } from '@/lib/shop/admin-queries';
import { formatPrice } from '@/lib/shop/format';

export const dynamic = 'force-dynamic';

export default async function AdminClienti({ searchParams }: { searchParams: { q?: string } }) {
  const clienti = await getClientiConStats(searchParams.q);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Clienti</h1>
          <p className="mt-1 text-stone-500">{clienti.length} clienti · CRM</p>
        </div>
        <Link href="/admin/clienti/nuovo" className="inline-flex items-center gap-2 rounded-md bg-[#7F1518] px-4 py-2 text-sm font-medium text-white hover:bg-[#5A0F12]">
          <Plus size={16} /> Nuovo cliente
        </Link>
      </div>

      <form className="mt-6 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Cerca per nome o email…"
          className="w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#7F1518]"
        />
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {clienti.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">
            {searchParams.q ? 'Nessun cliente trovato.' : 'Nessun cliente. Aggiungine uno o arriveranno con gli ordini.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="p-3 font-medium">Cliente</th>
                <th className="hidden p-3 font-medium sm:table-cell">Contatti</th>
                <th className="p-3 font-medium">Ordini</th>
                <th className="p-3 font-medium">Speso</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {clienti.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="max-w-[160px] p-3 sm:max-w-none">
                    <Link href={`/admin/clienti/${c.id}`} className="block truncate font-medium text-stone-900 hover:text-[#7F1518]">
                      {c.nome || '—'}
                    </Link>
                    <div className="truncate text-xs text-stone-500 sm:hidden">{c.email}</div>
                  </td>
                  <td className="hidden max-w-[220px] p-3 text-stone-500 sm:table-cell">
                    <div className="flex items-center gap-1.5"><Mail size={12} className="flex-none" /> <span className="truncate">{c.email}</span></div>
                    {c.telefono && <div className="flex items-center gap-1.5"><Phone size={12} className="flex-none" /> <span className="truncate">{c.telefono}</span></div>}
                  </td>
                  <td className="p-3 text-stone-700">{c.ordini}</td>
                  <td className="p-3 font-medium text-stone-900">{formatPrice(c.spesaCent)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/clienti/${c.id}`} className="text-stone-400 hover:text-[#7F1518]">
                      <ArrowRight size={16} />
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
