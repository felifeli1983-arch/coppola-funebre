'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, ChevronDown, Loader2, Trash2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, SortHeader, facetFilterFn, selectColumn } from '@/components/admin/data-table';
import { ConfirmAction, useAction } from '@/components/admin/actions';
import { StageBadge } from '@/components/admin/status';
import { EmptyState } from '@/components/admin/kit';
import { CONTACT_SOURCE, CONTACT_STAGE, CONTACT_STAGE_KEYS, CONTACT_TYPE } from '@/lib/admin/meta';
import { formatPrice } from '@/lib/shop/format';
import { formatDate, timeAgo } from '@/lib/utils';
import { deleteContatti, setStatoContatti } from '@/lib/admin/crm-actions';
import type { ContattoConStats } from '@/lib/admin/crm';
import { ContactAvatar, TagChips, nomeContatto } from './shared';

type Row = ContattoConStats;

const columns: ColumnDef<Row, unknown>[] = [
  selectColumn<Row>(),
  {
    id: 'contatto',
    accessorFn: (r) =>
      [r.nome, r.azienda, r.email, r.telefono, r.codice_fiscale, r.partita_iva, ...(r.tags ?? [])]
        .filter(Boolean)
        .join(' '),
    header: ({ column }) => <SortHeader column={column} title="Contatto" />,
    sortingFn: (a, b) => nomeContatto(a.original).localeCompare(nomeContatto(b.original), 'it'),
    cell: ({ row }) => {
      const c = row.original;
      const sub = [c.nome && c.azienda ? c.azienda : null, c.email, c.telefono].filter(Boolean).join(' · ');
      return (
        <div className="flex min-w-0 max-w-[280px] items-center gap-3">
          <ContactAvatar c={c} className="size-8" />
          <div className="min-w-0">
            <div className="truncate font-medium">{nomeContatto(c)}</div>
            {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
          </div>
        </div>
      );
    },
    enableHiding: false,
    meta: {
      label: 'Contatto',
      csv: (r) => nomeContatto(r),
    },
  },
  {
    id: 'email',
    accessorFn: (r) => r.email ?? '',
    header: 'Email',
    cell: ({ getValue }) => <span className="block max-w-[220px] truncate">{String(getValue() || '—')}</span>,
    meta: { label: 'Email', csv: (r) => r.email ?? '' },
  },
  {
    id: 'telefono',
    accessorFn: (r) => r.telefono ?? '',
    header: 'Telefono',
    cell: ({ getValue }) => <span className="whitespace-nowrap tabular-nums">{String(getValue() || '—')}</span>,
    meta: { label: 'Telefono', csv: (r) => r.telefono ?? '' },
  },
  {
    id: 'tipo',
    accessorFn: (r) => r.tipo,
    header: 'Tipo',
    filterFn: facetFilterFn,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
        {row.original.tipo === 'azienda' ? <Building2 className="size-3.5" /> : <User className="size-3.5" />}
        {CONTACT_TYPE[row.original.tipo] ?? row.original.tipo}
      </span>
    ),
    meta: { label: 'Tipo', csv: (r) => CONTACT_TYPE[r.tipo] ?? r.tipo },
  },
  {
    id: 'stato',
    accessorFn: (r) => r.stato,
    header: ({ column }) => <SortHeader column={column} title="Stato" />,
    sortingFn: (a, b) =>
      CONTACT_STAGE_KEYS.indexOf(a.original.stato) - CONTACT_STAGE_KEYS.indexOf(b.original.stato),
    filterFn: facetFilterFn,
    cell: ({ row }) => <StageBadge stato={row.original.stato} />,
    meta: { label: 'Stato', csv: (r) => CONTACT_STAGE[r.stato]?.label ?? r.stato },
  },
  {
    id: 'fonte',
    accessorFn: (r) => r.fonte ?? 'nessuna',
    header: 'Fonte',
    filterFn: facetFilterFn,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {row.original.fonte ? CONTACT_SOURCE[row.original.fonte] ?? row.original.fonte : '—'}
      </span>
    ),
    meta: { label: 'Fonte', csv: (r) => (r.fonte ? CONTACT_SOURCE[r.fonte] ?? r.fonte : '') },
  },
  {
    id: 'tags',
    accessorFn: (r) => (r.tags ?? []).join(', '),
    header: 'Tag',
    enableSorting: false,
    cell: ({ row }) => <TagChips tags={row.original.tags} nowrap />,
    meta: { label: 'Tag', csv: (r) => (r.tags ?? []).join(', ') },
  },
  {
    id: 'ordini',
    accessorFn: (r) => r.ordini,
    header: ({ column }) => <SortHeader column={column} title="Ordini" />,
    cell: ({ getValue }) => <span className="tabular-nums">{Number(getValue())}</span>,
    meta: { label: 'Ordini', className: 'text-right', csv: (r) => r.ordini },
  },
  {
    id: 'spesa',
    accessorFn: (r) => r.spesaCent,
    header: ({ column }) => <SortHeader column={column} title="Speso" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.spesaCent ? formatPrice(row.original.spesaCent) : '—'}
      </span>
    ),
    meta: {
      label: 'Totale speso',
      className: 'text-right',
      csv: (r) => (r.spesaCent / 100).toFixed(2).replace('.', ','),
    },
  },
  {
    id: 'ultima',
    accessorFn: (r) => r.ultima_attivita_at ?? r.updated_at ?? r.created_at,
    header: ({ column }) => <SortHeader column={column} title="Ultima attività" />,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground" suppressHydrationWarning>
        {timeAgo(String(getValue()))}
      </span>
    ),
    meta: { label: 'Ultima attività', csv: (r) => formatDate(r.ultima_attivita_at ?? r.updated_at) },
  },
  {
    id: 'creato',
    accessorFn: (r) => r.created_at,
    header: ({ column }) => <SortHeader column={column} title="Creato il" />,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDate(String(getValue()))}</span>
    ),
    meta: { label: 'Creato il', csv: (r) => formatDate(r.created_at) },
  },
];

export default function ContattiTable({ data }: { data: Row[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(r) => r.id}
      searchPlaceholder="Cerca per nome, email, telefono, tag…"
      rowHref={(r) => `/admin/clienti/${r.id}`}
      initialSorting={[{ id: 'creato', desc: true }]}
      initialVisibility={{ email: false, telefono: false, creato: false }}
      exportName="contatti-coppola.csv"
      filters={[
        {
          columnId: 'stato',
          title: 'Stato',
          options: CONTACT_STAGE_KEYS.map((k) => ({ value: k, label: CONTACT_STAGE[k].label })),
        },
        {
          columnId: 'tipo',
          title: 'Tipo',
          options: [
            { value: 'privato', label: 'Privato', icon: User },
            { value: 'azienda', label: 'Azienda', icon: Building2 },
          ],
        },
        {
          columnId: 'fonte',
          title: 'Fonte',
          options: [
            ...Object.entries(CONTACT_SOURCE).map(([value, label]) => ({ value, label })),
            { value: 'nessuna', label: 'Non indicata' },
          ],
        },
      ]}
      bulkActions={(rows, clear) => <BulkActions rows={rows} clear={clear} />}
      empty={
        <EmptyState
          icon={Users}
          title="Nessun contatto trovato"
          description="Prova a cambiare la ricerca o i filtri."
          compact
        />
      }
      mobileCard={(c) => (
        <div className="flex min-w-0 items-start gap-3">
          <ContactAvatar c={c} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0 truncate font-medium">{nomeContatto(c)}</div>
              <StageBadge stato={c.stato} className="flex-none" />
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {[c.email, c.telefono].filter(Boolean).join(' · ') || '—'}
            </div>
            <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
              <TagChips tags={c.tags} className="min-w-0 flex-1" nowrap />
              <span className="flex-none tabular-nums" suppressHydrationWarning>
                {c.ordini > 0 ? `${c.ordini} ordini · ${formatPrice(c.spesaCent)}` : timeAgo(c.ultima_attivita_at ?? c.created_at)}
              </span>
            </div>
          </div>
        </div>
      )}
    />
  );
}

function BulkActions({ rows, clear }: { rows: Row[]; clear: () => void }) {
  const { run, pending } = useAction();
  const idList = rows.map((r) => r.id).join(',');
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Cambia stato
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sposta in</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CONTACT_STAGE_KEYS.map((k) => (
            <DropdownMenuItem
              key={k}
              onSelect={async () => {
                const good = await run(setStatoContatti, { ids: idList, stato: k });
                if (good) clear();
              }}
            >
              {CONTACT_STAGE[k].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmAction
        action={async (fd) => {
          const res = await deleteContatti(fd);
          if (res.ok) clear();
          return res;
        }}
        data={{ ids: idList }}
        title={rows.length === 1 ? 'Eliminare questo contatto?' : `Eliminare ${rows.length} contatti?`}
        description="Verranno eliminati anche le note e i promemoria collegati. Gli ordini restano nello storico."
        confirmLabel="Elimina"
        trigger={
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 />
            Elimina
          </Button>
        }
      />
    </>
  );
}
