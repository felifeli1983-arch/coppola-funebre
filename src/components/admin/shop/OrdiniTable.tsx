'use client';

import * as React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, ChevronDown, PackageCheck, ShoppingBag, Truck, XCircle, CreditCard } from 'lucide-react';
import { DataTable, SortHeader, facetFilterFn, selectColumn } from '@/components/admin/data-table';
import { OrderStatusBadge } from '@/components/admin/status';
import { EmptyState } from '@/components/admin/kit';
import { useAction } from '@/components/admin/actions';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ORDER_STATUS, ORDER_STATUS_KEYS } from '@/lib/admin/meta';
import { aggiornaStatoOrdini } from '@/lib/admin/shop-actions';
import type { OrdineRow } from '@/lib/admin/shop';
import { formatPrice } from '@/lib/shop/format';
import { formatDateTime, timeAgo } from '@/lib/utils';

const BULK = [
  { stato: 'pagato', label: 'Segna come pagati', icon: CreditCard },
  { stato: 'spedito', label: 'Segna come spediti', icon: Truck },
  { stato: 'consegnato', label: 'Segna come consegnati', icon: PackageCheck },
  { stato: 'annullato', label: 'Annulla ordini', icon: XCircle },
];

export default function OrdiniTable({ data }: { data: OrdineRow[] }) {
  const { run, pending } = useAction();
  const [confirmCancel, setConfirmCancel] = React.useState<{ ids: string[]; clear: () => void } | null>(null);

  const columns = React.useMemo<ColumnDef<OrdineRow, unknown>[]>(
    () => [
      selectColumn<OrdineRow>(),
      {
        accessorKey: 'numero',
        header: ({ column }) => <SortHeader column={column} title="Ordine" />,
        cell: ({ row }) => <span className="font-medium tabular-nums">#{row.original.numero}</span>,
        meta: { label: 'Numero', className: 'w-[90px]', csv: (r) => r.numero },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => <SortHeader column={column} title="Data" />,
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <div>{formatDateTime(row.original.created_at)}</div>
            <div className="text-xs text-muted-foreground">{timeAgo(row.original.created_at)}</div>
          </div>
        ),
        meta: { label: 'Data', csv: (r) => formatDateTime(r.created_at) },
      },
      {
        id: 'cliente',
        accessorFn: (r) => `${r.cliente_nome ?? ''} ${r.email}`,
        header: ({ column }) => <SortHeader column={column} title="Cliente" />,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-0 max-w-[260px]">
              {r.cliente_id ? (
                <Link href={`/admin/clienti/${r.cliente_id}`} className="block truncate font-medium hover:underline">
                  {r.cliente_nome || r.email}
                </Link>
              ) : (
                <div className="truncate font-medium">{r.cliente_nome || r.email}</div>
              )}
              <div className="truncate text-xs text-muted-foreground">{r.email}</div>
            </div>
          );
        },
        meta: { label: 'Cliente', csv: (r) => r.cliente_nome ?? '' },
      },
      {
        accessorKey: 'articoli',
        header: ({ column }) => <SortHeader column={column} title="Articoli" />,
        cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.articoli}</span>,
        meta: { label: 'Articoli', className: 'hidden lg:table-cell', csv: (r) => r.articoli },
      },
      {
        accessorKey: 'totale_cent',
        header: ({ column }) => (
          <div className="text-right">
            <SortHeader column={column} title="Totale" className="ml-auto mr-0" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">{formatPrice(row.original.totale_cent, row.original.valuta)}</div>
        ),
        meta: { label: 'Totale', className: 'text-right', csv: (r) => (r.totale_cent / 100).toFixed(2).replace('.', ',') },
      },
      {
        accessorKey: 'stato',
        header: 'Stato',
        cell: ({ row }) => <OrderStatusBadge stato={row.original.stato} />,
        filterFn: facetFilterFn,
        meta: { label: 'Stato', csv: (r) => ORDER_STATUS[r.stato]?.label ?? r.stato },
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        meta: { label: 'Email', csv: (r) => r.email },
      },
    ],
    [],
  );

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState
          icon={ShoppingBag}
          title="Ancora nessun ordine"
          description="Quando un cliente completa un acquisto nel negozio online, l’ordine comparirà qui e il cliente verrà aggiunto automaticamente ai Contatti."
          action={
            <Button asChild variant="outline" size="sm">
              <a href="/negozio" target="_blank" rel="noreferrer">
                Apri il negozio
              </a>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
    <DataTable
      columns={columns}
      data={data}
      getRowId={(r) => r.id}
      searchPlaceholder="Cerca per numero (#12), cliente o email…"
      filters={[
        {
          columnId: 'stato',
          title: 'Stato',
          options: ORDER_STATUS_KEYS.map((k) => ({ value: k, label: ORDER_STATUS[k].label })),
        },
      ]}
      initialSorting={[{ id: 'created_at', desc: true }]}
      initialVisibility={{ email: false }}
      rowHref={(r) => `/admin/ordini/${r.id}`}
      exportName="ordini.csv"
      bulkActions={(rows, clear) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={pending}>
              <CheckCircle2 />
              Cambia stato
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BULK.map((b) => (
              <DropdownMenuItem
                key={b.stato}
                destructive={b.stato === 'annullato'}
                onSelect={async () => {
                  const ids = rows.map((r) => r.id);
                  if (b.stato === 'annullato') {
                    setConfirmCancel({ ids, clear });
                    return;
                  }
                  const good = await run(aggiornaStatoOrdini, { ids: ids.join(','), stato: b.stato });
                  if (good) clear();
                }}
              >
                <b.icon />
                {b.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      mobileCard={(r) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold tabular-nums">#{r.numero}</span>
            <OrderStatusBadge stato={r.stato} />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{r.cliente_nome || r.email}</div>
              <div className="truncate text-xs text-muted-foreground">
                {formatDateTime(r.created_at)} · {r.articoli} {r.articoli === 1 ? 'articolo' : 'articoli'}
              </div>
            </div>
            <div className="flex-none font-semibold tabular-nums">{formatPrice(r.totale_cent, r.valuta)}</div>
          </div>
        </div>
      )}
    />
    <AlertDialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmCancel && confirmCancel.ids.length === 1 ? 'Annullare questo ordine?' : `Annullare ${confirmCancel?.ids.length ?? 0} ordini?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Gli ordini passeranno allo stato “Annullato” e la modifica comparirà nella cronologia dei clienti. I pezzi non
            tornano in magazzino da soli e l’eventuale rimborso va gestito a parte. Potrai sempre cambiare di nuovo lo stato.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Indietro</AlertDialogCancel>
          <AlertDialogAction
            destructive
            disabled={pending}
            onClick={async (e) => {
              e.preventDefault();
              if (!confirmCancel) return;
              const good = await run(aggiornaStatoOrdini, { ids: confirmCancel.ids.join(','), stato: 'annullato' });
              if (good) confirmCancel.clear();
              setConfirmCancel(null);
            }}
          >
            Annulla ordini
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
