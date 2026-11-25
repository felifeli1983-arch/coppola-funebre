import Placeholder from '@/components/admin/Placeholder';

export default function AdminClienti() {
  return (
    <Placeholder
      title="Clienti"
      subtitle="Anagrafica e storico acquisti."
      features={[
        'Elenco clienti con ricerca',
        'Dati di contatto e indirizzi',
        'Storico ordini per cliente',
        'Esportazione (fase successiva)',
      ]}
    />
  );
}
