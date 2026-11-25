import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Menu } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: 'Admin · Coppola',
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();

  // Once Supabase is connected, require a logged-in admin. Until then, show the
  // skeleton so the panel is navigable during development.
  if (configured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-stone-800 md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 bg-stone-900 md:block">
        <AdminNav />
      </aside>

      {/* Mobile top nav */}
      <details className="bg-stone-900 text-white md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/new/logo-coppola.webp" alt="Coppola" className="h-8 w-auto rounded-sm" />
            <span className="text-[11px] uppercase tracking-widest text-white/60">Admin</span>
          </span>
          <Menu size={20} />
        </summary>
        <div className="border-t border-white/10">
          <AdminNav showHeader={false} />
        </div>
      </details>

      <div className="flex min-w-0 flex-1 flex-col">
        {!configured && (
          <div className="bg-amber-100 px-6 py-2 text-sm text-amber-900">
            ⚠️ Supabase non ancora collegato — il pannello è in modalità anteprima
            (i dati compariranno dopo la connessione).
          </div>
        )}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
