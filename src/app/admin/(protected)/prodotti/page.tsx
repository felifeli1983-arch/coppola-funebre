import Placeholder from '@/components/admin/Placeholder';

export default function AdminProdotti() {
  return (
    <Placeholder
      title="Prodotti"
      subtitle="Catalogo gestibile al 100%."
      actionLabel="Nuovo prodotto"
      features={[
        'Creare/modificare/eliminare prodotti',
        'Foto multiple (caricamento su Supabase Storage)',
        'Titolo, descrizione, prezzo, quantità/giacenza',
        'Toggle on/off (attivo) per mostrarlo o nasconderlo nello shop',
        'Assegnazione a categoria e sottocategoria',
        'Peso per il calcolo spedizione (Packlink, fase 2)',
      ]}
    />
  );
}
