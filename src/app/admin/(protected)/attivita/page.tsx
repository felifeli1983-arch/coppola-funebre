import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/kit';
import AttivitaView from '@/components/admin/crm/AttivitaView';
import { getAttivita, getContattiLite } from '@/lib/admin/crm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Attività' };

export default async function AttivitaPage({ searchParams }: { searchParams: { nuova?: string } }) {
  const [attivita, contatti] = await Promise.all([getAttivita(), getContattiLite()]);
  return (
    <>
      <PageHeader
        title="Attività e promemoria"
        description="Chiamate da fare, preventivi da seguire, ricorrenze: tutto ciò che c’è da fare con i vostri contatti."
      />
      <AttivitaView attivita={attivita} contatti={contatti} openNew={searchParams?.nuova === '1'} />
    </>
  );
}
