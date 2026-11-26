import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/kit';
import CategorieManager from '@/components/admin/shop/CategorieManager';
import { getCategorieAdmin } from '@/lib/admin/shop';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Categorie' };

export default async function CategoriePage() {
  const categorie = await getCategorieAdmin();
  return (
    <>
      <PageHeader
        title="Categorie"
        description="Organizza il catalogo in gruppi principali e sottocategorie. Le categorie nascoste non compaiono nel negozio."
      />
      <CategorieManager categorie={categorie} />
    </>
  );
}
