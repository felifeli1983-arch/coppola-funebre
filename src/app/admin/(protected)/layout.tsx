import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
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
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      <aside className="hidden w-60 shrink-0 bg-stone-900 md:block">
        <AdminNav />
      </aside>

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
