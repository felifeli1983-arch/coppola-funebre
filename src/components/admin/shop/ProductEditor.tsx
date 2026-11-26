'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, FolderTree, Images, Loader2, Tag, Trash2, Warehouse, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin/kit';
import { SubmitButton } from '@/components/admin/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Field, Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/primitives';
import ImageManager, { uploadProductImages, type PendingImage } from './ImageManager';
import { eliminaProdotto, salvaProdotto } from '@/lib/admin/shop-actions';
import type { Categoria, Prodotto } from '@/lib/shop/types';

const DESC_MAX = 2000;

export default function ProductEditor({
  prodotto,
  categorie,
}: {
  prodotto: Prodotto | null;
  categorie: Categoria[];
}) {
  const router = useRouter();
  const p = prodotto;
  const isEdit = !!p;
  const [desc, setDesc] = React.useState(p?.descrizione ?? '');
  const [attivo, setAttivo] = React.useState(p?.attivo ?? true);
  const [pending, setPending] = React.useState<PendingImage[]>([]);

  const top = categorie.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => categorie.filter((c) => c.parent_id === id);
  const orphans = categorie.filter((c) => c.parent_id && !categorie.some((x) => x.id === c.parent_id));

  const onSubmit = async (fd: FormData) => {
    fd.set('attivo', attivo ? 'true' : 'false');
    let res;
    try {
      res = await salvaProdotto(fd);
    } catch {
      toast.error('Si è verificato un errore. Riprova.');
      return;
    }
    if (!res.ok || !res.id) {
      toast.error(res.message || 'Salvataggio non riuscito.');
      return;
    }
    if (!isEdit && pending.length) {
      const { failed } = await uploadProductImages(res.id, pending.map((x) => x.file));
      pending.forEach((x) => URL.revokeObjectURL(x.url));
      if (failed) toast.error(`${failed} ${failed === 1 ? 'foto non caricata' : 'foto non caricate'}: puoi riprovare dalla scheda.`);
    }
    toast.success(res.message);
    // push() + refresh() back-to-back cancels the navigation in Next 14.
    if (!isEdit) router.push(`/admin/prodotti/${res.id}`);
    else router.refresh();
  };

  const prezzo = p ? (p.prezzo_cent / 100).toFixed(2).replace('.', ',') : '';

  return (
    <form action={onSubmit} className="pb-24 md:pb-0">
      {p && <input type="hidden" name="id" value={p.id} />}

      <PageHeader
        back={{ href: '/admin/prodotti', label: 'Prodotti' }}
        title={isEdit ? p!.titolo : 'Nuovo prodotto'}
        description={isEdit ? undefined : 'Compila i dati e aggiungi qualche foto: potrai sempre modificarli in seguito.'}
        actions={
          <div className="hidden items-center gap-2 md:flex">
            {isEdit && p!.attivo && (
              <Button variant="outline" asChild>
                <a href={`/negozio/${p!.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Vedi nel negozio
                </a>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/admin/prodotti">Annulla</Link>
            </Button>
            <SubmitButton pendingText="Salvataggio…">{isEdit ? 'Salva modifiche' : 'Crea prodotto'}</SubmitButton>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="grid min-w-0 content-start gap-4 lg:col-span-2 lg:gap-6">
          <Card>
            <CardHeaderRow icon={<Tag />} title="Informazioni" />
            <CardContent className="grid gap-4">
              <Field label="Titolo" htmlFor="titolo" required>
                <Input id="titolo" name="titolo" required maxLength={120} defaultValue={p?.titolo ?? ''} placeholder="Es. Urna cineraria in marmo" />
              </Field>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="descrizione">Descrizione</Label>
                  <span className={`text-xs tabular-nums ${desc.length > DESC_MAX * 0.9 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {desc.length}/{DESC_MAX}
                  </span>
                </div>
                <Textarea
                  id="descrizione"
                  name="descrizione"
                  rows={7}
                  maxLength={DESC_MAX}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Materiali, dimensioni, finiture, cosa include…"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow
              icon={<Images />}
              title="Immagini"
              description={isEdit ? 'Le modifiche alle foto vengono salvate subito.' : 'Le foto verranno caricate quando crei il prodotto.'}
            />
            <CardContent>
              <ImageManager
                prodottoId={p?.id}
                images={p?.immagini ?? []}
                pending={pending}
                onPendingChange={setPending}
              />
            </CardContent>
          </Card>

          {isEdit && (
            <Card className="hidden border-destructive/30 lg:block">
              <DangerZone id={p!.id} titolo={p!.titolo} />
            </Card>
          )}
        </div>

        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <Card>
            <CardHeaderRow icon={<Eye />} title="Visibilità" />
            <CardContent>
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{attivo ? 'Visibile nel negozio' : 'Nascosto'}</span>
                  <span className="block text-xs text-muted-foreground">
                    {attivo ? 'I clienti possono vederlo e acquistarlo.' : 'Salvato come bozza, non compare nel negozio.'}
                  </span>
                </span>
                <Switch checked={attivo} onCheckedChange={setAttivo} aria-label="Visibile nel negozio" />
              </label>
              {isEdit && p!.attivo && (
                <Button variant="link" asChild className="mt-2 h-auto px-0 md:hidden">
                  <a href={`/negozio/${p!.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Vedi nel negozio
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow icon={<Tag />} title="Prezzo" />
            <CardContent>
              <Field label="Prezzo di vendita" htmlFor="prezzo" required hint="IVA inclusa. Puoi scrivere 12,50.">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                  <Input
                    id="prezzo"
                    name="prezzo"
                    required
                    inputMode="decimal"
                    pattern="^\d{1,6}([.,]\d{1,2})?$"
                    title="Inserisci un importo, es. 45 oppure 45,90"
                    defaultValue={prezzo}
                    placeholder="0,00"
                    className="pl-7 tabular-nums"
                  />
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow icon={<Warehouse />} title="Magazzino" />
            <CardContent className="grid grid-cols-2 gap-3">
              <Field label="Pezzi disponibili" htmlFor="giacenza">
                <Input id="giacenza" name="giacenza" type="number" min={0} step={1} inputMode="numeric" defaultValue={p?.giacenza ?? 0} />
              </Field>
              <Field label="Peso (g)" htmlFor="peso_grammi">
                <Input id="peso_grammi" name="peso_grammi" type="number" min={0} step={1} inputMode="numeric" defaultValue={p?.peso_grammi ?? ''} placeholder="—" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow icon={<FolderTree />} title="Organizzazione" />
            <CardContent>
              <Field label="Categoria" htmlFor="categoria_id">
                <NativeSelect id="categoria_id" name="categoria_id" defaultValue={p?.categoria_id ?? ''}>
                  <option value="">Nessuna categoria</option>
                  {top.map((c) => (
                    <React.Fragment key={c.id}>
                      <option value={c.id}>{c.nome}</option>
                      {childrenOf(c.id).map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {'   ↳ '}
                          {ch.nome}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                  {orphans.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Button variant="link" asChild className="mt-1 h-auto px-0 text-xs">
                <Link href="/admin/categorie">Gestisci categorie</Link>
              </Button>
            </CardContent>
          </Card>

          {isEdit && (
            <Card className="border-destructive/30 lg:hidden">
              <DangerZone id={p!.id} titolo={p!.titolo} />
            </Card>
          )}
        </div>
      </div>

      {/* Mobile sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/admin/prodotti">Annulla</Link>
        </Button>
        <SubmitButton className="flex-[2]" pendingText="Salvataggio…">
          {isEdit ? 'Salva' : 'Crea prodotto'}
        </SubmitButton>
      </div>
    </form>
  );
}

function DangerZone({ id, titolo }: { id: string; titolo: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const onConfirm = async () => {
    setPending(true);
    const fd = new FormData();
    fd.set('id', id);
    try {
      const res = await eliminaProdotto(fd);
      if (!res.ok) {
        toast.error(res.message || 'Eliminazione non riuscita.');
        setPending(false);
        return;
      }
      toast.success(res.message);
      // Navigate away without an intermediate refresh (it would cancel the push
      // and re-render this now-deleted product).
      router.push('/admin/prodotti');
    } catch {
      toast.error('Si è verificato un errore. Riprova.');
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-medium">Elimina prodotto</div>
        <div className="text-sm text-muted-foreground">Rimuove il prodotto e le sue foto. Gli ordini già ricevuti non cambiano.</div>
      </div>
      <AlertDialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" className="flex-none text-destructive hover:text-destructive">
            <Trash2 />
            Elimina
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo prodotto?</AlertDialogTitle>
            <AlertDialogDescription>“{titolo}” verrà eliminato definitivamente insieme alle sue foto.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              destructive
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
            >
              {pending && <Loader2 className="animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
