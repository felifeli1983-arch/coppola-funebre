import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { saveCliente } from '@/lib/admin-actions';
import type { Cliente } from '@/lib/shop/types';

export default function ClienteForm({ cliente }: { cliente?: Cliente | null }) {
  const c = cliente ?? null;
  const ind = c?.indirizzo ?? {};
  const label = 'text-xs font-medium uppercase tracking-wide text-stone-500';
  const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]';

  return (
    <div className="max-w-2xl">
      <Link href="/admin/clienti" className="mb-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7F1518]">
        <ArrowLeft size={16} /> Clienti
      </Link>
      <h1 className="font-serif text-3xl text-stone-900">{c ? 'Modifica cliente' : 'Nuovo cliente'}</h1>

      <form action={saveCliente} className="mt-6 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        {c && <input type="hidden" name="id" value={c.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Nome e cognome</span>
            <input name="nome" defaultValue={c?.nome ?? ''} className={field} />
          </label>
          <label className="block">
            <span className={label}>Email</span>
            <input name="email" type="email" required defaultValue={c?.email ?? ''} className={field} />
          </label>
          <label className="block">
            <span className={label}>Telefono</span>
            <input name="telefono" defaultValue={c?.telefono ?? ''} className={field} />
          </label>
          <label className="block">
            <span className={label}>Città</span>
            <input name="citta" defaultValue={ind.citta ?? ''} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Indirizzo</span>
            <input name="via" defaultValue={ind.via ?? ''} className={field} />
          </label>
          <label className="block">
            <span className={label}>CAP</span>
            <input name="cap" defaultValue={ind.cap ?? ''} className={field} />
          </label>
          <label className="block">
            <span className={label}>Provincia</span>
            <input name="provincia" defaultValue={ind.provincia ?? ''} className={field} />
          </label>
        </div>
        <label className="block">
          <span className={label}>Note interne</span>
          <textarea name="note" rows={3} defaultValue={c?.note ?? ''} className={field} placeholder="Appunti visibili solo nell'admin…" />
        </label>
        <div className="flex gap-3 pt-2">
          <button className="rounded-md bg-[#7F1518] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">
            {c ? 'Salva' : 'Crea cliente'}
          </button>
          <Link href="/admin/clienti" className="rounded-md border border-stone-300 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50">Annulla</Link>
        </div>
      </form>
    </div>
  );
}
