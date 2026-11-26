import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/kit';
import ContattoForm from '@/components/admin/crm/ContattoForm';
import { getContatto, nomeContatto } from '@/lib/admin/crm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Modifica contatto' };

export default async function ModificaContattoPage({ params }: { params: { id: string } }) {
  const data = await getContatto(params.id);
  if (!data) notFound();
  const c = data.contatto;
  return (
    <>
      <PageHeader
        back={{ href: `/admin/clienti/${c.id}`, label: nomeContatto(c) }}
        title="Modifica contatto"
      />
      <ContattoForm contatto={c} />
    </>
  );
}
