import Link from 'next/link';
import {
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Euro,
  Plus,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/shop/admin-queries';
import { formatPrice } from '@/lib/shop/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const s = await getDashboardStats();

  const stats = [
    {
      label: 'Fatturato (pagato)',
      value: s ? formatPrice(s.fatturatoCent) : '—',
      icon: Euro,
      href: '/admin/ordini?stato=pagato',
    },
    {
      label: 'Ordini',
      value: s ? String(s.ordiniTot) : '—',
      sub: s && s.ordiniInAttesa > 0 ? `${s.ordiniInAttesa} in attesa` : undefined,
      icon: ShoppingBag,
      href: '/admin/ordini',
    },
    {
      label: 'Prodotti attivi',
      value: s ? `${s.prodottiAttivi}/${s.prodottiTot}` : '—',
      icon: Package,
      href: '/admin/prodotti',
    },
    {
      label: 'Categorie',
      value: s ? String(s.categorie) : '—',
      icon: FolderTree,
      href: '/admin/categorie',
    },
    {
      label: 'Clienti',
      value: s ? String(s.clienti) : '—',
      icon: Users,
      href: '/admin/clienti',
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Dashboard</h1>
          <p className="mt-1 text-stone-500">Onoranze Funebri Coppola · Shop</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/prodotti/nuovo" className="inline-flex items-center gap-2 rounded-md bg-[#7F1518] px-4 py-2 text-sm font-medium text-white hover:bg-[#5A0F12]">
            <Plus size={16} /> Prodotto
          </Link>
          <Link href="/admin/categorie" className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
            <Plus size={16} /> Categoria
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md">
            <c.icon className="text-[#7F1518]" size={22} strokeWidth={1.6} />
            <div className="mt-3 text-2xl font-semibold text-stone-900">{c.value}</div>
            <div className="text-sm text-stone-500">{c.label}</div>
            {c.sub && (
              <div className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {c.sub}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-xl border border-stone-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 p-4">
            <h2 className="font-medium text-stone-900">Ultimi ordini</h2>
            <Link href="/admin/ordini" className="inline-flex items-center gap-1 text-sm text-[#7F1518] hover:underline">
              Tutti <ArrowRight size={14} />
            </Link>
          </div>
          {!s || s.recenti.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">Nessun ordine ancora.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {s.recenti.map((o) => (
                  <tr key={o.id}>
                    <td className="p-3 font-medium text-stone-900">#{o.numero}</td>
                    <td className="p-3 text-stone-500">{o.email}</td>
                    <td className="p-3 text-stone-700">{formatPrice(o.totale_cent, o.valuta)}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-stone-600">
                        {o.stato.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-stone-200 bg-white">
          <div className="flex items-center gap-2 border-b border-stone-100 p-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-medium text-stone-900">Scorte in esaurimento</h2>
          </div>
          {!s || s.esaurimento.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">Tutto a posto.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {s.esaurimento.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="text-stone-700">{p.titolo}</span>
                  <span className={`font-medium ${p.giacenza === 0 ? 'text-[#7F1518]' : 'text-amber-600'}`}>
                    {p.giacenza} pz
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
