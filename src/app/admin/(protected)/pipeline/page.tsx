import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/kit';
import PipelineBoard from '@/components/admin/crm/PipelineBoard';
import { getContatti } from '@/lib/admin/crm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pipeline' };

export default async function PipelinePage() {
  const contatti = await getContatti();
  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Segui ogni contatto dal primo incontro fino all’acquisto."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/clienti">
                <Users />
                Elenco contatti
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/clienti/nuovo">
                <UserPlus />
                Nuovo contatto
              </Link>
            </Button>
          </>
        }
      />
      <PipelineBoard contatti={contatti} />
    </>
  );
}
