import ProductForm from '@/components/admin/ProductForm';
import { getAllCategorie } from '@/lib/shop/admin-queries';

export const dynamic = 'force-dynamic';

export default async function NuovoProdotto() {
  const categorie = await getAllCategorie();
  return <ProductForm categorie={categorie} />;
}
