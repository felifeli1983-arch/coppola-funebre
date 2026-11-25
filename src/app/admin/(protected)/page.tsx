import Link from 'next/link';
import { Package, FolderTree, ShoppingBag, Users, ArrowRight } from 'lucide-react';

const cards = [
  { href: '/admin/prodotti', label: 'Prodotti', desc: 'Foto, prezzi, giacenze, on/off', icon: Package },
  { href: '/admin/categorie', label: 'Categorie', desc: 'Gruppi e sottogruppi', icon: FolderTree },
  { href: '/admin/ordini', label: 'Ordini', desc: 'Vendite e stati, con filtri', icon: ShoppingBag },
  { href: '/admin/clienti', label: 'Clienti', desc: 'Anagrafica e storico', icon: Users },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-stone-900">Dashboard</h1>
      <p className="mt-1 text-stone-500">Gestione dello shop Onoranze Funebri Coppola.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <Icon className="text-[#7F1518]" size={24} strokeWidth={1.6} />
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium text-stone-900">{label}</span>
              <ArrowRight
                size={16}
                className="text-stone-400 transition-transform group-hover:translate-x-1"
              />
            </div>
            <p className="mt-1 text-sm text-stone-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
