'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CornerDownRight, FolderTree, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ActionForm, SubmitButton, useAction } from '@/components/admin/actions';
import { EmptyState } from '@/components/admin/kit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Switch } from '@/components/ui/primitives';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { eliminaCategoria, impostaCategoriaAttiva, salvaCategoria } from '@/lib/admin/shop-actions';
import type { CategoriaRow } from '@/lib/admin/shop';
import { cn } from '@/lib/utils';

type Editing = { mode: 'new'; parent_id?: string } | { mode: 'edit'; cat: CategoriaRow } | null;

export default function CategorieManager({ categorie }: { categorie: CategoriaRow[] }) {
  const [editing, setEditing] = React.useState<Editing>(null);
  const [deleting, setDeleting] = React.useState<CategoriaRow | null>(null);
  const top = categorie.filter((c) => !c.parent_id || !categorie.some((x) => x.id === c.parent_id));
  const childrenOf = (id: string) => categorie.filter((c) => c.parent_id === id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ mode: 'new' })}>
          <Plus />
          Nuova categoria
        </Button>
      </div>

      <Card className="overflow-hidden">
        {top.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="Nessuna categoria"
            description="Le categorie aiutano i clienti a orientarsi nel negozio (es. Urne, Fiori, Cornici)."
            action={
              <Button size="sm" onClick={() => setEditing({ mode: 'new' })}>
                <Plus />
                Crea la prima categoria
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_110px_120px_44px] items-center gap-3 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid">
              <span>Categoria</span>
              <span className="text-right">Prodotti</span>
              <span>Nel negozio</span>
              <span />
            </div>
            <ul className="divide-y">
              {top.map((c) => (
                <React.Fragment key={c.id}>
                  <CatRow
                    cat={c}
                    total={c.prodotti + childrenOf(c.id).reduce((n, ch) => n + ch.prodotti, 0)}
                    hasChildren={childrenOf(c.id).length > 0}
                    onEdit={() => setEditing({ mode: 'edit', cat: c })}
                    onAddChild={() => setEditing({ mode: 'new', parent_id: c.id })}
                    onDelete={() => setDeleting(c)}
                  />
                  {childrenOf(c.id).map((ch) => (
                    <CatRow
                      key={ch.id}
                      cat={ch}
                      total={ch.prodotti}
                      child
                      hasChildren={false}
                      onEdit={() => setEditing({ mode: 'edit', cat: ch })}
                      onDelete={() => setDeleting(ch)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </ul>
          </>
        )}
      </Card>

      <CategoriaDialog editing={editing} onClose={() => setEditing(null)} categorie={categorie} />

      {deleting && (
        <DeleteDialog
          cat={deleting}
          hasChildren={childrenOf(deleting.id).length > 0}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

function ActiveToggle({ cat }: { cat: CategoriaRow }) {
  const router = useRouter();
  const [on, setOn] = React.useState(cat.attivo);
  const [pending, start] = React.useTransition();
  React.useEffect(() => setOn(cat.attivo), [cat.attivo]);
  return (
    <Switch
      checked={on}
      disabled={pending}
      aria-label="Visibile nel negozio"
      onCheckedChange={(v) => {
        setOn(v);
        start(async () => {
          const fd = new FormData();
          fd.set('id', cat.id);
          fd.set('attivo', String(v));
          const res = await impostaCategoriaAttiva(fd);
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

function CatRow({
  cat,
  total,
  child,
  hasChildren,
  onEdit,
  onAddChild,
  onDelete,
}: {
  cat: CategoriaRow;
  /** Products in this category (parents include their subcategories). */
  total: number;
  child?: boolean;
  hasChildren: boolean;
  onEdit: () => void;
  onAddChild?: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={cn(
        'grid grid-cols-[1fr_auto_44px] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_110px_120px_44px]',
        child && 'bg-muted/20',
      )}
    >
      <div className={cn('flex min-w-0 items-center gap-2', child && 'pl-5 sm:pl-7')}>
        {child && <CornerDownRight className="size-4 flex-none text-muted-foreground" />}
        <div className="min-w-0">
          <button type="button" onClick={onEdit} className={cn('block max-w-full truncate text-left hover:underline', !child && 'font-medium')}>
            {cat.nome}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            <span>
              {total} {total === 1 ? 'prodotto' : 'prodotti'}
            </span>
            {!cat.attivo && <Badge variant="muted">Nascosta</Badge>}
          </div>
          {cat.descrizione && <div className="hidden truncate text-xs text-muted-foreground sm:block">{cat.descrizione}</div>}
        </div>
      </div>
      <div className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
        {total > 0 ? (
          <Link href="/admin/prodotti" className="hover:text-foreground hover:underline">
            {total}
          </Link>
        ) : (
          '0'
        )}
      </div>
      <div className="flex items-center">
        <ActiveToggle cat={cat} />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Azioni per ${cat.nome}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil />
            Modifica
          </DropdownMenuItem>
          {onAddChild && (
            <DropdownMenuItem onSelect={onAddChild}>
              <Plus />
              Aggiungi sottocategoria
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={onDelete} disabled={hasChildren}>
            <Trash2 />
            {hasChildren ? 'Elimina (ha sottocategorie)' : 'Elimina'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function CategoriaDialog({
  editing,
  onClose,
  categorie,
}: {
  editing: Editing;
  onClose: () => void;
  categorie: CategoriaRow[];
}) {
  const cat = editing?.mode === 'edit' ? editing.cat : null;
  const defaultParent = editing?.mode === 'new' ? editing.parent_id ?? '' : cat?.parent_id ?? '';
  const hasChildren = cat ? categorie.some((c) => c.parent_id === cat.id) : false;
  // Only top-level categories can be parents (two-level tree), never itself.
  const parents = categorie.filter((c) => !c.parent_id && c.id !== cat?.id);

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cat ? 'Modifica categoria' : 'Nuova categoria'}</DialogTitle>
          <DialogDescription>
            {cat ? 'Aggiorna nome, descrizione o posizione nel catalogo.' : 'Crea un gruppo principale o una sottocategoria.'}
          </DialogDescription>
        </DialogHeader>
        {editing && (
          <ActionForm
            key={cat?.id ?? `new-${defaultParent}`}
            action={salvaCategoria}
            onSuccess={onClose}
            className="grid gap-4"
          >
            {cat && <input type="hidden" name="id" value={cat.id} />}
            <Field label="Nome" htmlFor="cat-nome" required>
              <Input id="cat-nome" name="nome" required maxLength={80} defaultValue={cat?.nome ?? ''} autoFocus />
            </Field>
            <Field label="Descrizione" htmlFor="cat-desc" hint="Facoltativa, mostrata nel negozio.">
              <Textarea id="cat-desc" name="descrizione" rows={3} maxLength={400} defaultValue={cat?.descrizione ?? ''} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field
                label="Gruppo principale"
                htmlFor="cat-parent"
                hint={hasChildren ? 'Ha sottocategorie: resta un gruppo principale.' : undefined}
              >
                <NativeSelect id="cat-parent" name="parent_id" defaultValue={defaultParent} disabled={hasChildren}>
                  <option value="">Nessuno (gruppo principale)</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Posizione" htmlFor="cat-ordine" hint="Più basso = prima">
                <Input id="cat-ordine" name="ordine" type="number" step={1} defaultValue={cat?.ordine ?? 0} />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <SubmitButton pendingText="Salvataggio…">{cat ? 'Salva' : 'Crea categoria'}</SubmitButton>
            </DialogFooter>
          </ActionForm>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ cat, hasChildren, onClose }: { cat: CategoriaRow; hasChildren: boolean; onClose: () => void }) {
  const { run, pending } = useAction();
  return (
    <AlertDialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare “{cat.nome}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasChildren
              ? 'Questa categoria ha delle sottocategorie: spostale o eliminale prima.'
              : cat.prodotti > 0
                ? `I ${cat.prodotti} prodotti di questa categoria non verranno eliminati: resteranno “senza categoria”.`
                : 'La categoria verrà eliminata definitivamente.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
          {!hasChildren && (
            <AlertDialogAction
              destructive
              disabled={pending}
              onClick={async (e) => {
                e.preventDefault();
                if (await run(eliminaCategoria, { id: cat.id })) onClose();
              }}
            >
              {pending && <Loader2 className="animate-spin" />}
              Elimina
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
