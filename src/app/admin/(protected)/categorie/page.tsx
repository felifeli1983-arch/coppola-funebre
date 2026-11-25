import { Trash2 } from 'lucide-react';
import { getAllCategorie } from '@/lib/shop/admin-queries';
import { createCategoria, toggleCategoria, deleteCategoria } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function AdminCategorie() {
  const categorie = await getAllCategorie();
  const top = categorie.filter((c) => !c.parent_id);

  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Categorie</h1>
      <p className="mt-1 text-stone-500">Gruppi e sottogruppi del catalogo.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* List */}
        <div className="rounded-xl border border-stone-200 bg-white">
          {top.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">Nessuna categoria. Creane una →</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {top.map((cat) => {
                const subs = categorie.filter((c) => c.parent_id === cat.id);
                return (
                  <li key={cat.id} className="p-4">
                    <Row c={cat} />
                    {subs.length > 0 && (
                      <ul className="ml-5 mt-2 space-y-2 border-l border-stone-200 pl-4">
                        {subs.map((s) => (
                          <li key={s.id}>
                            <Row c={s} sub />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Create form */}
        <div className="h-fit rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium text-stone-900">Nuova categoria</h2>
          <form action={createCategoria} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Nome</span>
              <input name="nome" required className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]" />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Gruppo padre (opzionale)</span>
              <select name="parent_id" className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]">
                <option value="">— Nessuno (gruppo principale) —</option>
                {top.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </label>
            <button className="w-full rounded-md bg-[#7F1518] py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">
              Crea categoria
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Row({ c, sub = false }: { c: { id: string; nome: string; attivo: boolean }; sub?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={sub ? 'text-sm text-stone-700' : 'font-medium text-stone-900'}>{c.nome}</span>
      <div className="flex items-center gap-2">
        <form action={toggleCategoria}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="attivo" value={String(c.attivo)} />
          <button
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
              c.attivo ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'
            }`}
          >
            {c.attivo ? 'Attiva' : 'Nascosta'}
          </button>
        </form>
        <form action={deleteCategoria}>
          <input type="hidden" name="id" value={c.id} />
          <button className="text-stone-400 hover:text-[#7F1518]" title="Elimina">
            <Trash2 size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
