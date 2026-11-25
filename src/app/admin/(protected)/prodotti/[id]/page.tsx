import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getAllCategorie, getProdottoById } from '@/lib/shop/admin-queries';

export const dynamic = 'force-dynamic';

export default async function ModificaProdotto({ params }: { params: { id: string } }) {
  const [prodotto, categorie] = await Promise.all([
    getProdottoById(params.id),
    getAllCategorie(),
  ]);
  if (!prodotto) notFound();
  return <ProductForm prodotto={prodotto} categorie={categorie} />;
}
