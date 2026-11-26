import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import AdminShell from '@/components/admin/shell/AdminShell';
import { createClient } from '@/lib/supabase/server';
import { ORDER_OPEN_STATUSES } from '@/lib/admin/meta';

export const metadata: Metadata = {
  title: { default: 'Gestionale · Eredi Coppola', template: '%s · Gestionale Coppola' },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [ordini, promemoria] = await Promise.all([
    supabase.from('ordini').select('id', { count: 'exact', head: true }).in('stato', ORDER_OPEN_STATUSES),
    supabase
      .from('clienti_attivita')
      .select('id', { count: 'exact', head: true })
      .eq('completata', false)
      .not('scadenza', 'is', null)
      .lte('scadenza', endOfToday.toISOString()),
  ]);

  return (
    <AdminShell
      userEmail={user.email ?? null}
      defaultCollapsed={cookies().get('admin_sidebar')?.value === 'collapsed'}
      counters={{ ordiniDaGestire: ordini.count ?? 0, promemoria: promemoria.count ?? 0 }}
    >
      {children}
    </AdminShell>
  );
}
