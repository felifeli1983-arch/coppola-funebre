import type { Metadata } from 'next';
import { Clock, Euro, Inbox, Truck } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/admin/kit';
import OrdiniTable from '@/components/admin/shop/OrdiniTable';
import { getOrdiniAdmin } from '@/lib/admin/shop';
import { ORDER_OPEN_STATUSES, ORDER_REVENUE_STATUSES } from '@/lib/admin/meta';

const euroTondo = (c: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(c / 100);

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Ordini' };

export default async function OrdiniPage() {
  const ordini = await getOrdiniAdmin();
  const daGestire = ordini.filter((o) => ORDER_OPEN_STATUSES.includes(o.stato)).length;
  const inAttesa = ordini.filter((o) => o.stato === 'in_attesa').length;
  const spediti = ordini.filter((o) => o.stato === 'spedito').length;
  const fatturato = ordini
    .filter((o) => ORDER_REVENUE_STATUSES.includes(o.stato))
    .reduce((n, o) => n + o.totale_cent, 0);

  return (
    <>
      <PageHeader
        title="Ordini"
        description="Tutti gli ordini ricevuti dal negozio online. Seleziona più ordini per aggiornarne lo stato in un colpo solo."
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Da gestire" value={daGestire} icon={Inbox} tone={daGestire ? 'brand' : 'default'} hint="In attesa o pagati, da spedire" />
        <StatCard label="In attesa di pagamento" value={inAttesa} icon={Clock} tone={inAttesa ? 'warning' : 'default'} hint="Ordini non ancora saldati" />
        <StatCard label="In consegna" value={spediti} icon={Truck} hint="Spediti, non ancora consegnati" />
        <StatCard label="Incassato" value={euroTondo(fatturato)} icon={Euro} tone="success" hint="Ordini pagati, spediti e consegnati" />
      </div>
      <OrdiniTable data={ordini} />
    </>
  );
}
