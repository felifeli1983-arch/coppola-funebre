'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LOCALES } from '@/i18n/config';
import { useT } from '@/i18n/LanguageProvider';

export default function LanguageSwitcher({
  variant = 'header',
}: {
  variant?: 'header' | 'menu';
}) {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.header.langLabel}
        className={
          variant === 'header'
            ? 'inline-flex items-center gap-1.5 px-2.5 py-2 text-pietra hover:text-bordeaux transition-colors'
            : 'inline-flex items-center justify-center gap-2 w-full px-5 py-3 border border-pietra/20 text-pietra text-xs tracking-widest uppercase'
        }
      >
        <Globe size={16} strokeWidth={1.6} />
        <span className="text-xs font-medium uppercase tracking-wider">{current.code}</span>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          data-lenis-prevent
          className="absolute end-0 mt-2 max-h-[70vh] w-52 overflow-y-auto overscroll-contain bg-avorio border border-pietra/15 shadow-2xl z-[60] py-1"
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <li key={l.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  dir={l.dir}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-bordeaux/5 text-bordeaux font-medium'
                      : 'text-pietra hover:bg-pietra/5'
                  }`}
                >
                  <span className="text-base leading-none flex-none">{l.flag}</span>
                  <span className="flex-1 text-start">{l.label}</span>
                  {active && <Check size={15} className="flex-none text-bordeaux" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
