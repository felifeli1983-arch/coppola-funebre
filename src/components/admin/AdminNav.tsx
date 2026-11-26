'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  BarChart3,
  ShieldCheck,
  Cookie,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type Item = { href: string; label: string; icon: typeof Package; exact?: boolean };
type Section = { label?: string; items: Item[] };

const sections: Section[] = [
  { items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }] },
  {
    label: 'Catalogo',
    items: [
      { href: '/admin/prodotti', label: 'Prodotti', icon: Package },
      { href: '/admin/categorie', label: 'Categorie', icon: FolderTree },
    ],
  },
  {
    label: 'Vendite',
    items: [
      { href: '/admin/ordini', label: 'Ordini', icon: ShoppingBag },
      { href: '/admin/clienti', label: 'Clienti', icon: Users },
    ],
  },
  {
    label: 'Statistiche',
    items: [{ href: '/admin/statistiche', label: 'Visite', icon: BarChart3 }],
  },
  {
    label: 'Contenuti legali',
    items: [
      { href: '/admin/legale/privacy', label: 'Privacy Policy', icon: ShieldCheck },
      { href: '/admin/legale/cookie', label: 'Cookie Policy', icon: Cookie },
      { href: '/admin/documenti', label: 'Documenti', icon: FileText },
    ],
  },
  {
    label: 'Sistema',
    items: [{ href: '/admin/impostazioni', label: 'Impostazioni', icon: Settings }],
  },
];

export default function AdminNav({ showHeader = true }: { showHeader?: boolean }) {
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
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-4">
      {showHeader && (
        <div className="mb-5 flex items-center gap-3 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/new/logo-coppola.webp" alt="Coppola" className="h-10 w-auto rounded-sm" />
          <div className="text-[11px] uppercase leading-tight tracking-widest text-white/50">
            Pannello
            <br />
            admin
          </div>
        </div>
      )}

      {sections.map((section, i) => (
        <div key={i} className={section.label ? 'mt-4' : ''}>
          {section.label && (
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
              {section.label}
            </div>
          )}
          {section.items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} strokeWidth={1.8} className="flex-none" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      <button
        onClick={logout}
        className="mt-6 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut size={17} strokeWidth={1.8} />
        Esci
      </button>
    </nav>
  );
}
