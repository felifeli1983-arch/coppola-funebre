import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertTriangle, Eye, Package, Plus } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/admin/kit';
import ProdottiTable from '@/components/admin/shop/ProdottiTable';
import { Button } from '@/components/ui/button';
import { getCategorieAdmin, getProdottiAdmin } from '@/lib/admin/shop';

const euroTondo = (c: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(c / 100);

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Prodotti' };

export default async function ProdottiPage() {
  const [prodotti, categorie] = await Promise.all([getProdottiAdmin(), getCategorieAdmin()]);
  const attivi = prodotti.filter((p) => p.attivo).length;
  const esauriti = prodotti.filter((p) => p.giacenza <= 3).length;
  const valore = prodotti.reduce((n, p) => n + p.prezzo_cent * Math.max(0, p.giacenza), 0);
  // Parent › Child labels for the category filter.
  const byId = new Map(categorie.map((c) => [c.id, c]));
  const catOptions = categorie
    .map((c) => ({
      id: c.id,
      nome: c.parent_id && byId.get(c.parent_id) ? `${byId.get(c.parent_id)!.nome} › ${c.nome}` : c.nome,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'));

  return (
    <>
      <PageHeader
        title="Prodotti"
        description="Il catalogo del negozio online: prezzi, foto, disponibilità e visibilità."
        actions={
          <Button asChild>
            <Link href="/admin/prodotti/nuovo">
              <Plus />
              Nuovo prodotto
            </Link>
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Prodotti" value={prodotti.length} icon={Package} hint={`${categorie.length} categorie`} />
        <StatCard label="Visibili nel negozio" value={attivi} icon={Eye} tone="success" hint={`${prodotti.length - attivi} nascosti`} />
        <StatCard
          label="Scorte basse"
          value={esauriti}
          icon={AlertTriangle}
          tone={esauriti ? 'warning' : 'default'}
          hint="3 pezzi o meno"
        />
        <StatCard label="Valore magazzino" value={euroTondo(valore)} icon={Package} tone="brand" hint="Prezzo × pezzi disponibili" />
      </div>
      <ProdottiTable data={prodotti} categorie={catOptions} />
    </>
  );
}
