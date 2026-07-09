'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LOCALE,
  GEO_COOKIE,
  LANG_PARAM,
  LOCALE_MAP,
  STORAGE_KEY,
  isLocale,
  resolveLocale,
  type LocaleCode,
} from './config';
import { getDictionary } from './dictionaries';
import type { Dictionary } from './dictionaries/it';

type LanguageContextValue = {
  locale: LocaleCode;
  dir: 'ltr' | 'rtl';
  t: Dictionary;
  setLocale: (code: LocaleCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Resolve the initial locale on first load, in priority order:
 *  1. ?lang= query param (deep link / crawler target for hreflang URLs)
 *  2. explicit stored user choice (localStorage)
 *  3. geo suggestion cookie set by middleware from the visitor's IP country
 *  4. browser UI language
 *  5. site default (Italian)
 */
function detectInitialLocale(serverLocale: LocaleCode): LocaleCode {
  try {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(LANG_PARAM);
    if (isLocale(param)) return param;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;

    const geo = readCookie(GEO_COOKIE);
    if (isLocale(geo)) return geo;

    const nav = resolveLocale(navigator.language);
    // resolveLocale falls back to the default; prefer a real browser match,
    // otherwise keep whatever the server already resolved.
    return nav === DEFAULT_LOCALE ? serverLocale : nav;
  } catch {
    return serverLocale;
  }
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  /** Server-resolved locale (from the ?lang= URL) so SSR renders the right language. */
  initialLocale?: LocaleCode;
}) {
  // Seed from the server-resolved locale so SSR and the first client render
  // match (no hydration mismatch); the client-refined locale is applied in effect.
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  useEffect(() => {
    const detected = detectInitialLocale(initialLocale);
    if (detected !== locale) setLocaleState(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang> and dir in sync with the active locale
  useEffect(() => {
    const meta = LOCALE_MAP[locale];
    document.documentElement.lang = meta.hreflang;
    document.documentElement.dir = meta.dir;
  }, [locale]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    // Reflect the choice in the URL (shareable + matches the hreflang targets),
    // keeping the clean root URL for the default locale.
    try {
      const url = new URL(window.location.href);
      if (code === DEFAULT_LOCALE) url.searchParams.delete(LANG_PARAM);
      else url.searchParams.set(LANG_PARAM, code);
      window.history.replaceState(null, '', url.toString());
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const meta = LOCALE_MAP[locale];
    return {
      locale,
      dir: meta.dir,
      t: getDictionary(locale),
      setLocale,
    };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useT must be used within a LanguageProvider');
  }
  return ctx;
}
