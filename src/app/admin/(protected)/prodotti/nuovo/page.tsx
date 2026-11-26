import type { Metadata } from 'next';
import ProductEditor from '@/components/admin/shop/ProductEditor';
import { getCategorieAdmin } from '@/lib/admin/shop';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Nuovo prodotto' };

export default async function NuovoProdottoPage() {
  const categorie = await getCategorieAdmin();
  return <ProductEditor prodotto={null} categorie={categorie} />;
}
