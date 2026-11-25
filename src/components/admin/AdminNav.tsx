'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/prodotti', label: 'Prodotti', icon: Package },
  { href: '/admin/categorie', label: 'Categorie', icon: FolderTree },
  { href: '/admin/ordini', label: 'Ordini', icon: ShoppingBag },
  { href: '/admin/clienti', label: 'Clienti', icon: Users },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await createClient().auth.signOut();
      } catch {
        /* ignore */
      }
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 px-2">
        <div className="text-sm font-semibold tracking-wide text-white">COPPOLA</div>
        <div className="text-[11px] uppercase tracking-widest text-white/50">
          Pannello admin
        </div>
      </div>

      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut size={18} strokeWidth={1.8} />
        Esci
      </button>
    </nav>
  );
}
