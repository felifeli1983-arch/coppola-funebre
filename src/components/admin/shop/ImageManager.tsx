'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Hint } from '@/components/ui/primitives';
import { productImageUrl } from '@/lib/shop/format';
import { eliminaImmagine, registraImmagini, riordinaImmagini } from '@/lib/admin/shop-actions';
import type { ProdottoImmagine } from '@/lib/shop/types';

const MAX_MB = 10;

export type PendingImage = { key: string; file: File; url: string };

/** Upload files straight to storage (admin session) under `<prodottoId>/`. */
export async function uploadProductImages(prodottoId: string, files: File[]): Promise<{ ok: number; failed: number }> {
  const supabase = createClient();
  const paths: string[] = [];
  let failed = 0;
  for (const file of files) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${prodottoId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('prodotti')
      .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
    if (error) failed++;
    else paths.push(path);
  }
  if (paths.length) {
    const fd = new FormData();
    fd.set('prodotto_id', prodottoId);
    fd.set('paths', JSON.stringify(paths));
    const res = await registraImmagini(fd);
    if (!res.ok) failed += paths.length;
  }
  return { ok: paths.length, failed };
}

function validate(files: File[]): File[] {
  const good: File[] = [];
  for (const f of files) {
    if (!f.type.startsWith('image/')) {
      toast.error(`“${f.name}” non è un’immagine.`);
      continue;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`“${f.name}” supera i ${MAX_MB} MB.`);
      continue;
    }
    good.push(f);
  }
  return good;
}

export default function ImageManager({
  prodottoId,
  images,
  pending,
  onPendingChange,
}: {
  /** Set for saved products: changes are applied immediately. */
  prodottoId?: string;
  images: ProdottoImmagine[];
  /** For new products: files are kept here and uploaded on save. */
  pending: PendingImage[];
  onPendingChange: (p: PendingImage[]) => void;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [order, setOrder] = React.useState(images);
  const [uploading, setUploading] = React.useState(0);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [drag, setDrag] = React.useState(false);
  React.useEffect(() => setOrder(images), [images]);

  const addFiles = async (list: FileList | File[]) => {
    const files = validate(Array.from(list));
    if (!files.length) return;
    if (!prodottoId) {
      onPendingChange([
        ...pending,
        ...files.map((file) => ({ key: `${file.name}-${file.size}-${Math.random()}`, file, url: URL.createObjectURL(file) })),
      ]);
      return;
    }
    setUploading(files.length);
    const { ok, failed } = await uploadProductImages(prodottoId, files);
    setUploading(0);
    if (ok) toast.success(ok === 1 ? 'Immagine caricata' : `${ok} immagini caricate`);
    if (failed) toast.error(`${failed} ${failed === 1 ? 'immagine non caricata' : 'immagini non caricate'}. Riprova.`);
    router.refresh();
  };

  const persistOrder = async (next: ProdottoImmagine[]) => {
    const prev = order;
    setOrder(next);
    const fd = new FormData();
    fd.set('prodotto_id', prodottoId!);
    fd.set('ids', next.map((i) => i.id).join(','));
    const res = await riordinaImmagini(fd);
    if (!res.ok) {
      setOrder(prev);
      toast.error(res.message);
    } else router.refresh();
  };

  const move = (idx: number, to: number) => {
    if (prodottoId) {
      const next = [...order];
      const [it] = next.splice(idx, 1);
      next.splice(to, 0, it);
      persistOrder(next);
    } else {
      const next = [...pending];
      const [it] = next.splice(idx, 1);
      next.splice(to, 0, it);
      onPendingChange(next);
    }
  };

  const remove = async (idx: number) => {
    if (!prodottoId) {
      URL.revokeObjectURL(pending[idx].url);
      onPendingChange(pending.filter((_, i) => i !== idx));
      return;
    }
    const img = order[idx];
    setBusyId(img.id);
    const fd = new FormData();
    fd.set('id', img.id);
    const res = await eliminaImmagine(fd);
    setBusyId(null);
    if (!res.ok) toast.error(res.message);
    else {
      toast.success(res.message);
      setOrder(order.filter((o) => o.id !== img.id));
      router.refresh();
    }
  };

  const tiles = prodottoId
    ? order.map((i) => ({ key: i.id, src: productImageUrl(i.storage_path), alt: i.alt ?? '' }))
    : pending.map((p) => ({ key: p.key, src: p.url, alt: p.file.name }));

  return (
    <div className="grid gap-3">
      {tiles.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {tiles.map((t, idx) => (
            <li
              key={t.key}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                idx === 0 && 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt={t.alt} className="size-full object-cover" />
              {idx === 0 && (
                <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  Copertina
                </span>
              )}
              {busyId === t.key && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <div className="flex gap-1">
                  <TileBtn label="Sposta a sinistra" disabled={idx === 0} onClick={() => move(idx, idx - 1)}>
                    <ArrowLeft />
                  </TileBtn>
                  <TileBtn label="Sposta a destra" disabled={idx === tiles.length - 1} onClick={() => move(idx, idx + 1)}>
                    <ArrowRight />
                  </TileBtn>
                  {idx > 0 && (
                    <TileBtn label="Usa come copertina" onClick={() => move(idx, 0)}>
                      <Star />
                    </TileBtn>
                  )}
                </div>
                <TileBtn label="Elimina immagine" onClick={() => remove(idx)} danger>
                  <Trash2 />
                </TileBtn>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/50">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </li>
          ))}
        </ul>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03]',
          drag && 'border-primary bg-primary/5',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </span>
        <span className="text-sm font-medium">
          Trascina qui le foto o <span className="text-primary underline underline-offset-2">sfoglia</span>
        </span>
        <span className="text-xs text-muted-foreground">
          JPG, PNG o WEBP fino a {MAX_MB} MB · la prima foto è la copertina
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

function TileBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Hint label={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'flex size-8 items-center justify-center rounded-md bg-white/90 text-zinc-800 shadow-sm transition-colors hover:bg-white disabled:opacity-40 [&_svg]:size-4',
          danger && 'text-red-600',
        )}
      >
        {children}
      </button>
    </Hint>
  );
}
