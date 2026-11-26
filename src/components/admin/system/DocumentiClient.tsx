'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Copy,
  Download,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { documentFileUrl } from '@/lib/shop/format';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Field, Label } from '@/components/ui/label';
import { Hint, Switch } from '@/components/ui/primitives';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable, SortHeader, facetFilterFn } from '@/components/admin/data-table';
import { ActionForm, ConfirmAction, SubmitButton, useAction } from '@/components/admin/actions';
import {
  eliminaDocumento,
  impostaVisibilitaDocumento,
  modificaDocumento,
  registraDocumento,
} from '@/lib/admin/system-actions';

export type DocRow = {
  id: string;
  titolo: string;
  descrizione: string | null;
  storage_path: string;
  tipo: string;
  pubblico: boolean;
  created_at: string;
};

export const TIPI: Record<string, string> = {
  generico: 'Generico',
  privacy: 'Privacy',
  cookie: 'Cookie',
  condizioni: 'Condizioni di vendita',
  modulo: 'Modulo',
  catalogo: 'Catalogo',
  listino: 'Listino',
};

const MAX_MB = 25;

function ext(path: string) {
  const e = path.split('.').pop()?.toLowerCase() ?? '';
  return e.length <= 5 ? e : '';
}

function FileBadge({ path }: { path: string }) {
  const e = ext(path);
  const Icon = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(e)
    ? FileImage
    : ['xls', 'xlsx', 'csv', 'ods'].includes(e)
      ? FileSpreadsheet
      : ['pdf', 'doc', 'docx', 'odt', 'txt', 'rtf'].includes(e)
        ? FileText
        : FileIcon;
  return (
    <span className="flex size-10 flex-none flex-col items-center justify-center rounded-md border bg-muted/40 text-primary">
      <Icon className="size-4" />
      {e && <span className="mt-0.5 text-[9px] font-semibold uppercase leading-none text-muted-foreground">{e}</span>}
    </span>
  );
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

function prettySize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

// ── Upload ──────────────────────────────────────────────────────────────

export function UploadDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [drag, setDrag] = React.useState(false);
  const [titolo, setTitolo] = React.useState('');
  const [pubblico, setPubblico] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setTitolo('');
    setPubblico(true);
    setBusy(false);
  };

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`Il file supera i ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    if (!titolo) setTitolo(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim());
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error('Seleziona un file da caricare.');
      return;
    }
    if (!titolo.trim()) {
      toast.error('Inserisci un titolo.');
      return;
    }
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const e2 = ext(file.name) || 'pdf';
      const path = `${Date.now()}-${slug(titolo) || 'documento'}.${e2}`;
      const { error } = await createClient()
        .storage.from('documenti')
        .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (error) {
        console.error(error);
        toast.error('Caricamento del file non riuscito. Riprova.');
        setBusy(false);
        return;
      }
      fd.set('storage_path', path);
      fd.set('titolo', titolo.trim());
      fd.set('pubblico', String(pubblico));
      const res = await registraDocumento(fd);
      if (!res.ok) {
        toast.error(res.message ?? 'Operazione non riuscita');
        setBusy(false);
        return;
      }
      toast.success(res.message ?? 'Documento caricato');
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Si è verificato un errore. Riprova.');
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <UploadCloud /> Carica documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Carica un documento</DialogTitle>
          <DialogDescription>
            PDF, Word, immagini o fogli di calcolo fino a {MAX_MB} MB. I documenti pubblici compaiono nella pagina
            Documenti del sito.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              pick(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              drag ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50 hover:bg-muted/40',
            )}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.xls,.xlsx,.csv,.ods,.jpg,.jpeg,.png,.webp"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            {file ? (
              <div className="flex w-full min-w-0 items-center gap-3 text-left">
                <FileBadge path={file.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{prettySize(file.size)}</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Rimuovi file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X />
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud className="mb-2 size-7 text-muted-foreground" />
                <div className="text-sm font-medium">Trascina qui il file o clicca per sceglierlo</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Massimo {MAX_MB} MB</div>
              </>
            )}
          </div>

          <Field label="Titolo" htmlFor="doc-titolo" required>
            <Input id="doc-titolo" value={titolo} onChange={(e) => setTitolo(e.target.value)} maxLength={140} required />
          </Field>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field label="Tipo" htmlFor="doc-tipo">
              <NativeSelect id="doc-tipo" name="tipo" defaultValue="generico">
                {Object.entries(TIPI).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid gap-1.5">
              <Label htmlFor="doc-pubblico">Visibilità</Label>
              <label className="flex h-9 items-center gap-2.5 rounded-md border px-3 text-sm">
                <Switch id="doc-pubblico" checked={pubblico} onCheckedChange={setPubblico} />
                {pubblico ? 'Visibile sul sito' : 'Solo uso interno'}
              </label>
            </div>
          </div>
          <Field label="Descrizione" htmlFor="doc-descrizione" hint="Facoltativa, mostrata sotto il titolo">
            <Textarea id="doc-descrizione" name="descrizione" rows={2} maxLength={300} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={busy || !file}>
              {busy && <Loader2 className="animate-spin" />}
              {busy ? 'Caricamento…' : 'Carica'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Row actions ─────────────────────────────────────────────────────────

function EditDialog({ d }: { d: DocRow }) {
  const [open, setOpen] = React.useState(false);
  const [pubblico, setPubblico] = React.useState(d.pubblico);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Hint label="Modifica">
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Modifica">
            <Pencil />
          </Button>
        </DialogTrigger>
      </Hint>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica documento</DialogTitle>
        </DialogHeader>
        <ActionForm action={modificaDocumento} onSuccess={() => setOpen(false)} className="grid gap-4">
          <input type="hidden" name="id" value={d.id} />
          <input type="hidden" name="pubblico" value={String(pubblico)} />
          <Field label="Titolo" htmlFor={`t-${d.id}`} required>
            <Input id={`t-${d.id}`} name="titolo" defaultValue={d.titolo} maxLength={140} required />
          </Field>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field label="Tipo" htmlFor={`k-${d.id}`}>
              <NativeSelect id={`k-${d.id}`} name="tipo" defaultValue={d.tipo}>
                {Object.entries(TIPI).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid gap-1.5">
              <Label>Visibilità</Label>
              <label className="flex h-9 items-center gap-2.5 rounded-md border px-3 text-sm">
                <Switch checked={pubblico} onCheckedChange={setPubblico} />
                {pubblico ? 'Visibile sul sito' : 'Solo uso interno'}
              </label>
            </div>
          </div>
          <Field label="Descrizione" htmlFor={`d-${d.id}`}>
            <Textarea id={`d-${d.id}`} name="descrizione" defaultValue={d.descrizione ?? ''} rows={2} maxLength={300} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <SubmitButton pendingText="Salvataggio…">Salva</SubmitButton>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}

function RowActions({ d }: { d: DocRow }) {
  const url = documentFileUrl(d.id);
  return (
    <div className="flex items-center justify-end gap-0.5" data-no-row-click>
      <Hint label="Apri o scarica">
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={url} target="_blank" rel="noreferrer" aria-label="Apri o scarica">
            <Download />
          </a>
        </Button>
      </Hint>
      {d.pubblico && (
        <Hint label="Copia link">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copia link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
                toast.success('Link copiato');
              } catch {
                toast.error('Impossibile copiare il link');
              }
            }}
          >
            <Copy />
          </Button>
        </Hint>
      )}
      <EditDialog d={d} />
      <ConfirmAction
        action={eliminaDocumento}
        data={{ id: d.id, path: d.storage_path }}
        title="Eliminare il documento?"
        description={
          <>
            <span className="font-medium text-foreground">{d.titolo}</span> verrà eliminato definitivamente
            {d.pubblico ? ' e non sarà più disponibile sul sito' : ''}.
          </>
        }
        confirmLabel="Elimina"
        trigger={
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label="Elimina">
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}

function VisibilitySwitch({ d }: { d: DocRow }) {
  const { run, pending } = useAction();
  const [on, setOn] = React.useState(d.pubblico);
  React.useEffect(() => setOn(d.pubblico), [d.pubblico]);
  return (
    <label className="inline-flex items-center gap-2 text-sm" data-no-row-click>
      <Switch
        checked={on}
        disabled={pending}
        onCheckedChange={async (v) => {
          setOn(v);
          const good = await run(impostaVisibilitaDocumento, { id: d.id, pubblico: v });
          if (!good) setOn(!v);
        }}
        aria-label="Visibile sul sito"
      />
      <span className={cn('hidden whitespace-nowrap xl:inline', on ? 'text-foreground' : 'text-muted-foreground')}>
        {on ? 'Sul sito' : 'Interno'}
      </span>
    </label>
  );
}

// ── Table ───────────────────────────────────────────────────────────────

const columns: ColumnDef<DocRow, unknown>[] = [
  {
    id: 'documento',
    accessorFn: (d) => `${d.titolo} ${d.descrizione ?? ''}`,
    header: ({ column }) => <SortHeader column={column} title="Documento" />,
    sortingFn: (a, b) => a.original.titolo.localeCompare(b.original.titolo, 'it'),
    cell: ({ row }) => {
      const d = row.original;
      return (
        <div className="flex min-w-0 max-w-[460px] items-center gap-3">
          <FileBadge path={d.storage_path} />
          <div className="min-w-0">
            <div className="truncate font-medium">{d.titolo}</div>
            {d.descrizione && <div className="truncate text-xs text-muted-foreground">{d.descrizione}</div>}
          </div>
        </div>
      );
    },
    meta: { label: 'Documento', csv: (d) => d.titolo },
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    filterFn: facetFilterFn,
    cell: ({ row }) => <Badge variant="secondary">{TIPI[row.original.tipo] ?? row.original.tipo}</Badge>,
    meta: { label: 'Tipo', csv: (d) => TIPI[d.tipo] ?? d.tipo },
  },
  {
    id: 'visibilita',
    accessorFn: (d) => (d.pubblico ? 'pubblico' : 'interno'),
    header: 'Sul sito',
    filterFn: facetFilterFn,
    cell: ({ row }) => <VisibilitySwitch d={row.original} />,
    meta: { label: 'Visibilità', csv: (d) => (d.pubblico ? 'Pubblico' : 'Interno') },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <SortHeader column={column} title="Caricato il" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.created_at)}</span>,
    meta: { label: 'Caricato il', csv: (d) => formatDate(d.created_at) },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Azioni</span>,
    cell: ({ row }) => <RowActions d={row.original} />,
    enableHiding: false,
    meta: { className: 'w-[1%] text-right' },
  },
];

export function DocumentiTable({ docs }: { docs: DocRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={docs}
      getRowId={(d) => d.id}
      searchPlaceholder="Cerca documenti…"
      initialSorting={[{ id: 'created_at', desc: true }]}
      filters={[
        { columnId: 'tipo', title: 'Tipo', options: Object.entries(TIPI).map(([value, label]) => ({ value, label })) },
        {
          columnId: 'visibilita',
          title: 'Visibilità',
          options: [
            { value: 'pubblico', label: 'Sul sito', icon: Globe },
            { value: 'interno', label: 'Solo interno', icon: Lock },
          ],
        },
      ]}
      mobileCard={(d) => (
        <div className="grid gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <FileBadge path={d.storage_path} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{d.titolo}</div>
              {d.descrizione && <div className="line-clamp-2 break-words text-xs text-muted-foreground">{d.descrizione}</div>}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{TIPI[d.tipo] ?? d.tipo}</Badge>
                {formatDate(d.created_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-2">
            <VisibilitySwitch d={d} />
            <RowActions d={d} />
          </div>
        </div>
      )}
    />
  );
}
