import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/kit';
import ContattoForm from '@/components/admin/crm/ContattoForm';

export const metadata: Metadata = { title: 'Nuovo contatto' };

export default function NuovoContattoPage() {
  return (
    <>
      <PageHeader
        back={{ href: '/admin/clienti', label: 'Contatti' }}
        title="Nuovo contatto"
        description="Aggiungi una persona o un’azienda alla rubrica."
      />
      <ContattoForm />
    </>
  );
}
