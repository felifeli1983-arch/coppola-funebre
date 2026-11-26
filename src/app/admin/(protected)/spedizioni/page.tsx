import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/kit';
import SpedizioniForm from '@/components/admin/shop/SpedizioniForm';
import { getSpedizione } from '@/lib/shop/settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Spedizioni' };

export default async function SpedizioniPage() {
  const sp = await getSpedizione();
  return (
    <>
      <PageHeader
        title="Spedizioni"
        description="Imposta quanto costa la spedizione e da quale importo diventa gratuita. Le modifiche valgono subito per i nuovi ordini."
      />
      <SpedizioniForm
        initial={{
          costo_cent: sp.costo_cent ?? 0,
          soglia_gratis_cent: sp.soglia_gratis_cent ?? 0,
          attiva: sp.attiva ?? true,
        }}
      />
    </>
  );
}
