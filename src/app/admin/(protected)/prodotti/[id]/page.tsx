import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductEditor from '@/components/admin/shop/ProductEditor';
import { getCategorieAdmin, getProdottoAdmin } from '@/lib/admin/shop';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProdottoAdmin(params.id);
  return { title: p?.titolo ?? 'Prodotto' };
}

export default async function ModificaProdottoPage({ params }: { params: { id: string } }) {
  const [prodotto, categorie] = await Promise.all([getProdottoAdmin(params.id), getCategorieAdmin()]);
  if (!prodotto) notFound();
  return <ProductEditor key={prodotto.updated_at} prodotto={prodotto} categorie={categorie} />;
}
