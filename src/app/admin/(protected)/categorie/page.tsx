import Placeholder from '@/components/admin/Placeholder';

export default function AdminCategorie() {
  return (
    <Placeholder
      title="Categorie"
      subtitle="Gruppi e sottogruppi del catalogo."
      actionLabel="Nuova categoria"
      features={[
        'Creare gruppi e sottogruppi (categorie annidate)',
        'Riordinare e rinominare',
        'Toggle on/off (attivo)',
        'Eliminare categorie (con i relativi sottogruppi)',
      ]}
    />
  );
}
