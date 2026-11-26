'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { productImageUrl } from '@/lib/shop/format';

type Img = { id: string; storage_path: string; alt: string | null };

/** Main image + thumbnails; swipe on touch, arrows on desktop. */
export default function ProductGallery({ images, title }: { images: Img[]; title: string }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = images.length;

  if (n === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-avorio-scuro">
        <Package size={72} strokeWidth={0.7} className="text-pietra/20" />
      </div>
    );
  }

  const go = (d: number) => setI((cur) => (cur + d + n) % n);

  return (
    <div className="grid gap-3">
      <div
        className="group relative aspect-square overflow-hidden bg-avorio-scuro"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {images.map((img, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={productImageUrl(img.storage_path)}
            alt={img.alt ?? title}
            loading={idx === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
              idx === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center bg-avorio/85 text-pietra opacity-0 shadow-sm transition hover:bg-avorio group-hover:opacity-100 md:inline-flex"
              aria-label="Immagine precedente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center bg-avorio/85 text-pietra opacity-0 shadow-sm transition hover:bg-avorio group-hover:opacity-100 md:inline-flex"
              aria-label="Immagine successiva"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
              {images.map((img, idx) => (
                <span
                  key={img.id}
                  className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-5 bg-avorio' : 'w-1.5 bg-avorio/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Mostra immagine ${idx + 1}`}
              aria-current={idx === i}
              className={`relative aspect-square overflow-hidden bg-avorio-scuro outline-none ring-offset-2 ring-offset-avorio transition ${
                idx === i ? 'ring-1 ring-bordeaux' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImageUrl(img.storage_path)} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
