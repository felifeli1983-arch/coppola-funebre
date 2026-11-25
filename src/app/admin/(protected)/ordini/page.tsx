import Placeholder from '@/components/admin/Placeholder';

export default function AdminOrdini() {
  return (
    <Placeholder
      title="Ordini"
      subtitle="Vendite con filtri."
      features={[
        'Elenco ordini con filtri (stato, data, cliente, importo)',
        'Dettaglio ordine: righe, totale, indirizzi, pagamento Stripe',
        'Aggiornamento stato (pagato, spedito, consegnato, annullato, rimborsato)',
        'Inserimento tracking e creazione spedizione (Packlink, fase 2)',
      ]}
    />
  );
}
