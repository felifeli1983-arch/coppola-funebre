'use client';

import * as React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, EyeOff, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DataTable, SortHeader, facetFilterFn, selectColumn } from '@/components/admin/data-table';
import { StockBadge } from '@/components/admin/status';
import { EmptyState } from '@/components/admin/kit';
import { ConfirmAction, useAction } from '@/components/admin/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/primitives';
import { azioneProdotti, impostaProdottoAttivo } from '@/lib/admin/shop-actions';
import type { ProdottoRow } from '@/lib/admin/shop';
import { formatPrice, productImageUrl } from '@/lib/shop/format';

type Row = ProdottoRow & { stato_pub: string; disponibilita: string; categoria_key: string };

function stockKey(g: number) {
  return g <= 0 ? 'esaurito' : g <= 3 ? 'scarso' : 'disponibile';
}

function Thumb({ path, size = 'size-10' }: { path: string | null; size?: string }) {
  return (
    <div className={`flex ${size} flex-none items-center justify-center overflow-hidden rounded-md border bg-muted`}>
      {path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={productImageUrl(path)} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <Package className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}

function ActiveSwitch({ id, attivo }: { id: string; attivo: boolean }) {
  const router = useRouter();
  const [on, setOn] = React.useState(attivo);
  const [pending, start] = React.useTransition();
  React.useEffect(() => setOn(attivo), [attivo]);
  return (
    <Switch
      checked={on}
      disabled={pending}
      aria-label={on ? 'Nascondi dal negozio' : 'Pubblica nel negozio'}
      onClick={(e) => e.stopPropagation()}
      onCheckedChange={(v) => {
        setOn(v);
        start(async () => {
          const fd = new FormData();
          fd.set('id', id);
          fd.set('attivo', String(v));
          const res = await impostaProdottoAttivo(fd);
          if (!res.ok) {
            setOn(!v);
            toast.error(res.message);
          } else {
            toast.success(res.message);
            router.refresh();
          }
        });
      }}
    />
  );
}

export default function ProdottiTable({ data, categorie }: { data: ProdottoRow[]; categorie: { id: string; nome: string }[] }) {
  const { run, pending } = useAction();
  const rows = React.useMemo<Row[]>(
    () =>
      data.map((p) => ({
        ...p,
        stato_pub: p.attivo ? 'attivo' : 'bozza',
        disponibilita: stockKey(p.giacenza),
        categoria_key: p.categoria_id ?? 'none',
      })),
    [data],
  );

  const columns = React.useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      selectColumn<Row>(),
      {
        accessorKey: 'titolo',
        header: ({ column }) => <SortHeader column={column} title="Prodotto" />,
        cell: ({ row }) => (
          <div className="flex min-w-0 max-w-[380px] items-center gap-3">
            <Thumb path={row.original.cover} />
            <div className="min-w-0">
              <Link href={`/admin/prodotti/${row.original.id}`} className="block truncate font-medium hover:underline">
                {row.original.titolo}
              </Link>
              <div className="truncate text-xs text-muted-foreground">/{row.original.slug}</div>
            </div>
          </div>
        ),
        meta: { label: 'Prodotto', csv: (r) => r.titolo },
      },
      {
        id: 'categoria_key',
        accessorKey: 'categoria_key',
        header: 'Categoria',
        cell: ({ row }) =>
          row.original.categoria_nome ? (
            <span className="block max-w-[180px] truncate">{row.original.categoria_nome}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        filterFn: facetFilterFn,
        enableGlobalFilter: false,
        meta: { label: 'Categoria', className: 'hidden lg:table-cell', csv: (r) => r.categoria_nome ?? '' },
      },
      {
        accessorKey: 'prezzo_cent',
        header: ({ column }) => (
          <div className="text-right">
            <SortHeader column={column} title="Prezzo" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">{formatPrice(row.original.prezzo_cent, row.original.valuta)}</div>
        ),
        enableGlobalFilter: false,
        meta: { label: 'Prezzo', className: 'text-right', csv: (r) => (r.prezzo_cent / 100).toFixed(2).replace('.', ',') },
      },
      {
        accessorKey: 'giacenza',
        header: ({ column }) => <SortHeader column={column} title="Magazzino" />,
        cell: ({ row }) => <StockBadge giacenza={row.original.giacenza} />,
        enableGlobalFilter: false,
        meta: { label: 'Magazzino', csv: (r) => r.giacenza },
      },
      {
        id: 'disponibilita',
        accessorKey: 'disponibilita',
        header: 'Disponibilità',
        filterFn: facetFilterFn,
        enableGlobalFilter: false,
        enableHiding: false,
      },
      {
        id: 'stato_pub',
        accessorKey: 'stato_pub',
        header: 'Nel negozio',
        cell: ({ row }) => (
          <div className="flex items-center gap-2" data-no-row-click>
            <ActiveSwitch id={row.original.id} attivo={row.original.attivo} />
            <span className="hidden text-xs text-muted-foreground xl:inline">
              {row.original.attivo ? 'Visibile' : 'Nascosto'}
            </span>
          </div>
        ),
        filterFn: facetFilterFn,
        enableGlobalFilter: false,
        meta: { label: 'Nel negozio', csv: (r) => (r.attivo ? 'Visibile' : 'Nascosto') },
      },
    ],
    [],
  );

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState
          icon={Package}
          title="Nessun prodotto nel catalogo"
          description="Aggiungi il primo prodotto: titolo, prezzo, foto e disponibilità."
          action={
            <Button asChild size="sm">
              <Link href="/admin/prodotti/nuovo">
                <Plus />
                Nuovo prodotto
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const catOptions = [
    ...categorie.map((c) => ({ value: c.id, label: c.nome })),
    { value: 'none', label: 'Senza categoria' },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      searchPlaceholder="Cerca prodotto…"
      filters={[
        { columnId: 'categoria_key', title: 'Categoria', options: catOptions },
        {
          columnId: 'stato_pub',
          title: 'Stato',
          options: [
            { value: 'attivo', label: 'Visibile nel negozio' },
            { value: 'bozza', label: 'Nascosto' },
          ],
        },
        {
          columnId: 'disponibilita',
          title: 'Disponibilità',
          options: [
            { value: 'disponibile', label: 'Disponibile' },
            { value: 'scarso', label: 'In esaurimento' },
            { value: 'esaurito', label: 'Esaurito' },
          ],
        },
      ]}
      initialVisibility={{ disponibilita: false }}
      rowHref={(r) => `/admin/prodotti/${r.id}`}
      exportName="prodotti.csv"
      bulkActions={(sel, clear) => {
        const ids = sel.map((r) => r.id).join(',');
        return (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={async () => (await run(azioneProdotti, { ids, azione: 'attiva' })) && clear()}
            >
              <Eye />
              Pubblica
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={async () => (await run(azioneProdotti, { ids, azione: 'disattiva' })) && clear()}
            >
              <EyeOff />
              Nascondi
            </Button>
            <ConfirmAction
              action={azioneProdotti}
              data={{ ids, azione: 'elimina' }}
              title={`Eliminare ${sel.length} ${sel.length === 1 ? 'prodotto' : 'prodotti'}?`}
              description="I prodotti e le loro foto verranno eliminati definitivamente. Gli ordini già ricevuti restano invariati."
              confirmLabel="Elimina"
              trigger={
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 />
                  Elimina
                </Button>
              }
            />
          </>
        );
      }}
      mobileCard={(r) => (
        <div className="flex items-center gap-3">
          <Thumb path={r.cover} size="size-14" />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 break-words text-sm font-medium">{r.titolo}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold tabular-nums">{formatPrice(r.prezzo_cent, r.valuta)}</span>
              <StockBadge giacenza={r.giacenza} />
              {!r.attivo && <Badge variant="muted">Nascosto</Badge>}
            </div>
          </div>
          <div data-no-row-click>
            <ActiveSwitch id={r.id} attivo={r.attivo} />
          </div>
        </div>
      )}
    />
  );
}
