'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type Table as TanTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  PlusCircle,
  Search,
  Settings2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox, Popover, PopoverContent, PopoverTrigger, Separator } from '@/components/ui/primitives';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// ── Types ─────────────────────────────────────────────────────────────────

export type FilterOption = { label: string; value: string; icon?: LucideIcon };
export type FacetFilter = { columnId: string; title: string; options: FilterOption[] };

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Header label used in the "Colonne" menu and CSV export. */
    label?: string;
    /** Extra classes for <th>/<td> (e.g. text-right, w-[120px]). */
    className?: string;
    /** Value written to CSV for this column. */
    csv?: (row: TData) => string | number | null | undefined;
  }
}

// ── Column helpers ────────────────────────────────────────────────────────

/** Checkbox column for row selection. */
export function selectColumn<T>(): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Seleziona tutti"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Seleziona riga"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-10' },
  };
}

/** Sortable header label. */
export function SortHeader<T>({ column, title, className }: { column: Column<T>; title: string; className?: string }) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  const dir = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(dir === 'asc')}
      className={cn(
        '-ml-2 inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground',
        dir && 'text-foreground',
        className,
      )}
    >
      {title}
      {dir === 'desc' ? (
        <ArrowDown className="size-3.5" />
      ) : dir === 'asc' ? (
        <ArrowUp className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </button>
  );
}

/** Filter function for faceted (multi-select) filters. */
export const facetFilterFn = <T,>(row: Row<T>, id: string, value: string[]) =>
  !value?.length || value.includes(String(row.getValue(id)));

// ── CSV export ────────────────────────────────────────────────────────────

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // Semicolon + BOM: opens correctly in Italian Excel.
  const body = [headers, ...rows].map((r) => r.map(esc).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportTable<T>(table: TanTable<T>, filename: string) {
  const cols = table
    .getAllLeafColumns()
    .filter((c) => c.id !== 'select' && c.id !== 'actions' && (c.columnDef.meta?.csv || c.columnDef.meta?.label));
  const selected = table.getSelectedRowModel().rows;
  const rows = selected.length ? selected : table.getFilteredRowModel().rows;
  downloadCsv(
    filename,
    cols.map((c) => c.columnDef.meta?.label ?? c.id),
    rows.map((r) =>
      cols.map((c) => {
        const csv = c.columnDef.meta?.csv;
        if (csv) return csv(r.original);
        const v = r.getValue(c.id);
        return typeof v === 'object' ? JSON.stringify(v) : (v as string | number | null);
      }),
    ),
  );
}

// ── DataTable ─────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = 'Cerca…',
  globalSearch = true,
  filters = [],
  toolbar,
  bulkActions,
  rowHref,
  initialSorting = [],
  initialVisibility = {},
  pageSize = 20,
  empty,
  exportName,
  getRowId,
  mobileCard,
}: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  searchPlaceholder?: string;
  globalSearch?: boolean;
  filters?: FacetFilter[];
  /** Extra controls rendered at the right of the toolbar. */
  toolbar?: React.ReactNode;
  /** Rendered in a bar when rows are selected. */
  bulkActions?: (rows: T[], clear: () => void) => React.ReactNode;
  rowHref?: (row: T) => string;
  initialSorting?: SortingState;
  initialVisibility?: VisibilityState;
  pageSize?: number;
  empty?: React.ReactNode;
  exportName?: string;
  getRowId?: (row: T) => string;
  /** Optional compact card rendering used below the md breakpoint. */
  mobileCard?: (row: T) => React.ReactNode;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    getRowId: getRowId ? (r) => getRowId(r) : undefined,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    // Case-insensitive "contains" on each column; a leading "#" is ignored so
    // "#12" finds order number 12.
    globalFilterFn: (row, columnId, value) => {
      const q = String(value ?? '').trim().replace(/^#/, '').toLowerCase();
      if (!q) return true;
      const v = row.getValue(columnId);
      if (v == null) return false;
      const text = Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? '' : String(v);
      return text.toLowerCase().includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
    autoResetPageIndex: true,
  });

  const isFiltered = columnFilters.length > 0 || globalFilter.length > 0;
  const selected = table.getSelectedRowModel().rows.map((r) => r.original);
  const rows = table.getRowModel().rows;

  const onRowClick = (e: React.MouseEvent, row: T) => {
    if (!rowHref) return;
    const target = e.target as HTMLElement;
    if (target.closest('a,button,input,label,[role=checkbox],[role=menuitem],[data-no-row-click]')) return;
    const href = rowHref(row);
    if (e.metaKey || e.ctrlKey) window.open(href, '_blank');
    else router.push(href);
  };

  return (
    <div className="grid min-w-0 gap-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {globalSearch && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-8"
              />
            </div>
          )}
          {filters.map((f) =>
            table.getColumn(f.columnId) ? (
              <FacetedFilter key={f.columnId} column={table.getColumn(f.columnId)!} title={f.title} options={f.options} />
            ) : null,
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                setGlobalFilter('');
              }}
            >
              Azzera
              <X />
            </Button>
          )}
        </div>
        <div className="flex flex-none items-center gap-2">
          {toolbar}
          {exportName && (
            <Button variant="outline" size="sm" onClick={() => exportTable(table, exportName)}>
              <Download />
              <span className="hidden sm:inline">Esporta</span>
            </Button>
          )}
          <ViewOptions table={table} />
        </div>
      </div>

      {/* Bulk action bar */}
      {bulkActions && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2 text-sm">
          <span className="font-medium">
            {selected.length} {selected.length === 1 ? 'selezionato' : 'selezionati'}
          </span>
          <Separator orientation="vertical" className="mx-1 h-4" />
          {bulkActions(selected, () => table.resetRowSelection())}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => table.resetRowSelection()}>
            Deseleziona
          </Button>
        </div>
      )}

      {/* Mobile cards */}
      {mobileCard && (
        <div className="grid gap-2 md:hidden">
          {rows.length ? (
            rows.map((row) => (
              <div
                key={row.id}
                onClick={(e) => onRowClick(e, row.original)}
                className={cn('min-w-0 rounded-lg border bg-card p-3', rowHref && 'cursor-pointer active:bg-muted/50')}
              >
                {mobileCard(row.original)}
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-card">{empty ?? <DefaultEmpty filtered={isFiltered} />}</div>
          )}
        </div>
      )}

      {/* Table */}
      <div className={cn('min-w-0 overflow-hidden rounded-lg border bg-card', mobileCard && 'hidden md:block')}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className={h.column.columnDef.meta?.className}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={(e) => onRowClick(e, row.original)}
                  className={cn(rowHref && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
                  {empty ?? <DefaultEmpty filtered={isFiltered} />}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
    </div>
  );
}

function DefaultEmpty({ filtered }: { filtered: boolean }) {
  return (
    <div className="py-12 text-center text-sm text-muted-foreground">
      {filtered ? 'Nessun risultato con questi filtri.' : 'Nessun elemento.'}
    </div>
  );
}

function FacetedFilter<T>({ column, title, options }: { column: Column<T>; title: string; options: FilterOption[] }) {
  const facets = column.getFacetedUniqueValues();
  const selected = new Set((column.getFilterValue() as string[]) ?? []);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircle />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              {selected.size > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {selected.size} selezionati
                </Badge>
              ) : (
                options
                  .filter((o) => selected.has(o.value))
                  .map((o) => (
                    <Badge key={o.value} variant="secondary" className="rounded-sm px-1 font-normal">
                      {o.label}
                    </Badge>
                  ))
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Nessun risultato.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const isSel = selected.has(o.value);
                return (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => {
                      const next = new Set(selected);
                      if (isSel) next.delete(o.value);
                      else next.add(o.value);
                      const arr = Array.from(next);
                      column.setFilterValue(arr.length ? arr : undefined);
                    }}
                  >
                    <Checkbox checked={isSel} className="pointer-events-none" tabIndex={-1} />
                    {o.icon && <o.icon />}
                    <span className="flex-1 truncate">{o.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{facets.get(o.value) ?? 0}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => column.setFilterValue(undefined)} className="justify-center">
                    Rimuovi filtro
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ViewOptions<T>({ table }: { table: TanTable<T> }) {
  const cols = table.getAllColumns().filter((c) => c.getCanHide() && c.columnDef.meta?.label);
  if (!cols.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:inline-flex">
          <Settings2 />
          Colonne
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Mostra colonne</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {cols.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            checked={c.getIsVisible()}
            onCheckedChange={(v) => c.toggleVisibility(!!v)}
            onSelect={(e) => e.preventDefault()}
          >
            {c.columnDef.meta?.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Pagination<T>({ table }: { table: TanTable<T> }) {
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  if (total === 0) return null;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(total, from + pageSize - 1);
  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
      <div className="tabular-nums">
        {from}–{to} di {total}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span>Righe</span>
          <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} aria-label="Prima pagina">
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Pagina precedente">
            <ChevronLeft />
          </Button>
          <span className="px-2 tabular-nums">
            {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Pagina successiva">
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} aria-label="Ultima pagina">
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
