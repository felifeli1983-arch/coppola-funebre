import { notFound } from 'next/navigation';
import ClienteForm from '@/components/admin/ClienteForm';
import { getClienteById } from '@/lib/shop/admin-queries';

export const dynamic = 'force-dynamic';

export default async function ModificaCliente({ params }: { params: { id: string } }) {
  const data = await getClienteById(params.id);
  if (!data) notFound();
  return <ClienteForm cliente={data.cliente} />;
}
