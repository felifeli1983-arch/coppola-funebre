import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake, KanbanSquare, Sparkles, UserCheck, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, PageHeader, StatCard } from '@/components/admin/kit';
import ContattiTable from '@/components/admin/crm/ContattiTable';
import { getContatti } from '@/lib/admin/crm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Contatti' };

export default async function ContattiPage() {
  const contatti = await getContatti();
  const monthAgo = Date.now() - 30 * 86400000;
  const clienti = contatti.filter((c) => c.stato === 'cliente').length;
  const trattativa = contatti.filter((c) => c.stato === 'contattato' || c.stato === 'preventivo').length;
  const nuovi = contatti.filter((c) => new Date(c.created_at).getTime() >= monthAgo).length;

  return (
    <>
      <PageHeader
        title="Contatti"
        description="Tutte le persone e le aziende con cui siete in contatto: clienti dello shop, famiglie, fornitori."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/pipeline">
                <KanbanSquare />
                Pipeline
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

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Contatti totali" value={contatti.length} icon={Users} hint="In rubrica" />
        <StatCard label="Clienti" value={clienti} icon={UserCheck} tone="success" hint="Hanno acquistato" />
        <StatCard
          label="In trattativa"
          value={trattativa}
          icon={Handshake}
          tone="warning"
          hint="Contattati o con preventivo"
          href="/admin/pipeline"
        />
        <StatCard label="Nuovi (30 giorni)" value={nuovi} icon={Sparkles} tone="brand" hint="Ultimo mese" />
      </div>

      {contatti.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Ancora nessun contatto"
            description="I clienti dello shop compaiono qui automaticamente a ogni ordine. Puoi anche aggiungere contatti a mano."
            action={
              <Button asChild>
                <Link href="/admin/clienti/nuovo">
                  <UserPlus />
                  Aggiungi il primo contatto
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <ContattiTable data={contatti} />
      )}
    </>
  );
}
