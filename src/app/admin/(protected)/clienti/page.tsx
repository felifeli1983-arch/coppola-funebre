import { getClienti } from '@/lib/shop/admin-queries';

export const dynamic = 'force-dynamic';

export default async function AdminClienti() {
  const clienti = await getClienti();

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Clienti</h1>
      <p className="mt-1 text-stone-500">{clienti.length} clienti registrati.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {clienti.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Nessun cliente ancora. Compariranno dopo il primo ordine.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Email</th>
                <th className="hidden p-3 font-medium sm:table-cell">Telefono</th>
                <th className="hidden p-3 font-medium md:table-cell">Registrato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {clienti.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="p-3 font-medium text-stone-900">{c.nome ?? '—'}</td>
                  <td className="p-3 text-stone-700">{c.email}</td>
                  <td className="hidden p-3 text-stone-500 sm:table-cell">{c.telefono ?? '—'}</td>
                  <td className="hidden p-3 text-stone-500 md:table-cell">
                    {new Date(c.created_at).toLocaleDateString('it-IT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
