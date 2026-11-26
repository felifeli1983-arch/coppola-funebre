import { FileText, Upload, Download, Trash2, Globe, Lock } from 'lucide-react';
import { getDocumenti } from '@/lib/shop/admin-queries';
import { saveDocumento, deleteDocumento } from '@/lib/admin-actions';
import { documentUrl } from '@/lib/shop/format';

export const dynamic = 'force-dynamic';

const label = 'text-xs font-medium uppercase tracking-wide text-stone-500';
const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]';

export default async function Documenti() {
  const docs = await getDocumenti();

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-stone-900">Documenti</h1>
      <p className="mt-1 text-stone-500">
        Carica informative, moduli e allegati. I documenti pubblici possono essere collegati nel sito.
      </p>

      {/* Upload */}
      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Upload size={18} className="text-[#7F1518]" />
          <h2 className="font-medium text-stone-900">Carica un documento</h2>
        </div>
        <form action={saveDocumento} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Titolo</span>
            <input name="titolo" required className={field} placeholder="Es. Informativa privacy" />
          </label>
          <label className="block">
            <span className={label}>Tipo</span>
            <select name="tipo" className={field} defaultValue="generico">
              <option value="generico">Generico</option>
              <option value="privacy">Privacy</option>
              <option value="cookie">Cookie</option>
              <option value="condizioni">Condizioni di vendita</option>
              <option value="modulo">Modulo</option>
              <option value="catalogo">Catalogo</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Descrizione (opzionale)</span>
            <input name="descrizione" className={field} />
          </label>
          <label className="block">
            <span className={label}>File</span>
            <input type="file" name="file" required className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm" />
          </label>
          <label className="flex items-end gap-2 pb-2">
            <input type="checkbox" name="pubblico" className="accent-[#7F1518]" />
            <span className="text-sm text-stone-700">Visibile pubblicamente</span>
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-md bg-[#7F1518] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">
              Carica documento
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {docs.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Nessun documento caricato.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                <FileText size={20} className="flex-none text-stone-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-stone-900">{d.titolo}</span>
                    <span className="flex-none rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-500">
                      {d.tipo}
                    </span>
                    {d.pubblico ? (
                      <Globe size={13} className="flex-none text-green-600" aria-label="Pubblico" />
                    ) : (
                      <Lock size={13} className="flex-none text-stone-400" aria-label="Privato" />
                    )}
                  </div>
                  {d.descrizione && <p className="truncate text-sm text-stone-500">{d.descrizione}</p>}
                </div>
                <a
                  href={documentUrl(d.storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-none rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-[#7F1518]"
                  title="Apri / scarica"
                >
                  <Download size={16} />
                </a>
                <form action={deleteDocumento} className="flex-none">
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="path" value={d.storage_path} />
                  <button className="rounded-md p-2 text-stone-400 hover:bg-red-50 hover:text-red-600" title="Elimina">
                    <Trash2 size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
