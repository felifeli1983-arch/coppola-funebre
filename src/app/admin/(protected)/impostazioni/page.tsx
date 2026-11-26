import Link from 'next/link';
import { Truck, Store, Users, ArrowRight } from 'lucide-react';
import { getSpedizione, getNegozio } from '@/lib/shop/settings';
import { saveSpedizione, saveNegozio } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

const eur = (c: number) => (c / 100).toFixed(2).replace('.', ',');

export default async function Impostazioni() {
  const [sp, neg] = await Promise.all([getSpedizione(), getNegozio()]);
  const label = 'text-xs font-medium uppercase tracking-wide text-stone-500';
  const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]';

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-stone-900">Impostazioni</h1>
      <p className="mt-1 text-stone-500">Spedizione, dati del negozio e accessi.</p>

      <div className="mt-8 space-y-6">
        {/* Spedizione */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Truck size={18} className="text-[#7F1518]" />
            <h2 className="font-medium text-stone-900">Spedizione</h2>
          </div>
          <form action={saveSpedizione} className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Costo spedizione (€)</span>
              <input name="costo" defaultValue={eur(sp.costo_cent)} className={field} />
            </label>
            <label className="block">
              <span className={label}>Spedizione gratis sopra (€)</span>
              <input name="soglia" defaultValue={eur(sp.soglia_gratis_cent)} className={field} />
              <span className="mt-1 block text-xs text-stone-400">0 = soglia disattivata</span>
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" name="attiva" defaultChecked={sp.attiva} className="accent-[#7F1518]" />
              <span className="text-sm text-stone-700">Spedizione attiva</span>
            </label>
            <div className="sm:col-span-2">
              <button className="rounded-md bg-[#7F1518] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">Salva spedizione</button>
            </div>
          </form>
        </section>

        {/* Negozio */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Store size={18} className="text-[#7F1518]" />
            <h2 className="font-medium text-stone-900">Dati del negozio</h2>
          </div>
          <form action={saveNegozio} className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={label}>Nome</span>
              <input name="nome" defaultValue={neg.nome} className={field} />
            </label>
            <label className="block">
              <span className={label}>Email</span>
              <input name="email" defaultValue={neg.email} className={field} />
            </label>
            <label className="block">
              <span className={label}>Telefono</span>
              <input name="telefono" defaultValue={neg.telefono} className={field} />
            </label>
            <div className="sm:col-span-2">
              <button className="rounded-md bg-[#7F1518] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">Salva dati</button>
            </div>
          </form>
        </section>

        {/* Admin users */}
        <Link href="/admin/impostazioni/utenti" className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white p-6 hover:shadow-md">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-[#7F1518]" />
            <div>
              <div className="font-medium text-stone-900">Utenti admin</div>
              <div className="text-sm text-stone-500">Gestisci chi può accedere al pannello</div>
            </div>
          </div>
          <ArrowRight size={18} className="text-stone-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
