export type LocaleCode =
  | 'it'
  | 'en'
  | 'fr'
  | 'es'
  | 'de'
  | 'pt'
  | 'ro'
  | 'pl'
  | 'uk'
  | 'ru'
  | 'sq'
  | 'nl'
  | 'hi'
  | 'fil'
  | 'ur'
  | 'ar'
  | 'zh'
  | 'bg'
  | 'bn';

export type LocaleMeta = {
  code: LocaleCode;
  /** Endonym — the language name in its own language */
  label: string;
  /** English name — used for structured data (schema.org availableLanguage) */
  englishName: string;
  /** BCP-47 tag used for <html lang> / hreflang / og:locale */
  hreflang: string;
  /** Regional flag emoji for the switcher */
  flag: string;
  /** Text direction */
  dir: 'ltr' | 'rtl';
};

export const DEFAULT_LOCALE: LocaleCode = 'it';

export const STORAGE_KEY = 'coppola-lang';
/** Cookie set by middleware from the visitor's IP country (a suggestion only). */
export const GEO_COOKIE = 'coppola-geo-lang';
/** Query-string parameter for deep-linking / crawling a specific language. */
export const LANG_PARAM = 'lang';
/** Request header the middleware sets so the server renders in the pinned language. */
export const LANG_HEADER = 'x-coppola-lang';

export const SITE_URL = 'https://www.eredicoppola.com';

// Phone number shown across the site. For non-Italian locales we prepend the
// Italy country code (+39) so foreign visitors can dial internationally;
// Italian keeps the plain national format.
export const PHONE_DISPLAY = '081 571 3888';
const PHONE_TEL_NATIONAL = 'tel:0815713888';
const PHONE_TEL_INTL = 'tel:+390815713888';

/** Standalone phone number for display (adds +39 for non-Italian locales). */
export function phoneDisplay(locale: LocaleCode): string {
  return locale === DEFAULT_LOCALE ? PHONE_DISPLAY : `+39 ${PHONE_DISPLAY}`;
}

/** Add the +39 prefix to any occurrence of the number inside a translated string. */
export function withItalyPhonePrefix(text: string, locale: LocaleCode): string {
  if (locale === DEFAULT_LOCALE) return text;
  return text.split(PHONE_DISPLAY).join(`+39 ${PHONE_DISPLAY}`);
}

/** tel: href — international (+39) for non-Italian locales so the dialed number works abroad. */
export function phoneTelHref(locale: LocaleCode): string {
  return locale === DEFAULT_LOCALE ? PHONE_TEL_NATIONAL : PHONE_TEL_INTL;
}

export const LOCALES: LocaleMeta[] = [
  { code: 'it', label: 'Italiano', englishName: 'Italian', hreflang: 'it-IT', flag: '🇮🇹', dir: 'ltr' },
  { code: 'en', label: 'English', englishName: 'English', hreflang: 'en', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', englishName: 'French', hreflang: 'fr', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', label: 'Español', englishName: 'Spanish', hreflang: 'es', flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', englishName: 'German', hreflang: 'de', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', label: 'Português', englishName: 'Portuguese', hreflang: 'pt', flag: '🇵🇹', dir: 'ltr' },
  { code: 'ro', label: 'Română', englishName: 'Romanian', hreflang: 'ro', flag: '🇷🇴', dir: 'ltr' },
  { code: 'pl', label: 'Polski', englishName: 'Polish', hreflang: 'pl', flag: '🇵🇱', dir: 'ltr' },
  { code: 'uk', label: 'Українська', englishName: 'Ukrainian', hreflang: 'uk', flag: '🇺🇦', dir: 'ltr' },
  { code: 'ru', label: 'Русский', englishName: 'Russian', hreflang: 'ru', flag: '🇷🇺', dir: 'ltr' },
  { code: 'sq', label: 'Shqip', englishName: 'Albanian', hreflang: 'sq', flag: '🇦🇱', dir: 'ltr' },
  { code: 'nl', label: 'Nederlands', englishName: 'Dutch', hreflang: 'nl', flag: '🇳🇱', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', englishName: 'Hindi', hreflang: 'hi', flag: '🇮🇳', dir: 'ltr' },
  { code: 'fil', label: 'Filipino', englishName: 'Filipino', hreflang: 'fil', flag: '🇵🇭', dir: 'ltr' },
  { code: 'ur', label: 'اردو', englishName: 'Urdu', hreflang: 'ur', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', label: 'العربية', englishName: 'Arabic', hreflang: 'ar', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh', label: '中文', englishName: 'Chinese', hreflang: 'zh', flag: '🇨🇳', dir: 'ltr' },
  { code: 'bg', label: 'Български', englishName: 'Bulgarian', hreflang: 'bg', flag: '🇧🇬', dir: 'ltr' },
  { code: 'bn', label: 'বাংলা', englishName: 'Bengali', hreflang: 'bn', flag: '🇧🇩', dir: 'ltr' },
];

export const LOCALE_CODES: LocaleCode[] = LOCALES.map((l) => l.code);

export const LOCALE_MAP: Record<LocaleCode, LocaleMeta> = Object.fromEntries(
  LOCALES.map((l) => [l.code, l]),
) as Record<LocaleCode, LocaleMeta>;

/** Map an ISO 3166-1 alpha-2 country code to the best-fit site locale. */
export const COUNTRY_TO_LOCALE: Record<string, LocaleCode> = {
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
  // English
  GB: 'en', US: 'en', IE: 'en', AU: 'en', NZ: 'en', CA: 'en', ZA: 'en', MT: 'en', NG: 'en', KE: 'en', GH: 'en',
  // French
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', CM: 'fr', CD: 'fr', HT: 'fr',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es',
  BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // German
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt',
  // Romanian
  RO: 'ro', MD: 'ro',
  // Polish
  PL: 'pl',
  // Ukrainian
  UA: 'uk',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Albanian
  AL: 'sq', XK: 'sq',
  // Dutch
  NL: 'nl',
  // Hindi
  IN: 'hi',
  // Filipino
  PH: 'fil',
  // Urdu
  PK: 'ur',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', LY: 'ar', IQ: 'ar', JO: 'ar', LB: 'ar',
  KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', YE: 'ar', SD: 'ar', SY: 'ar', PS: 'ar',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  // Bulgarian
  BG: 'bg',
  // Bengali
  BD: 'bn',
};

export function localeFromCountry(country: string | null | undefined): LocaleCode | null {
  if (!country) return null;
  return COUNTRY_TO_LOCALE[country.toUpperCase()] ?? null;
}

/** Resolve a browser language string (e.g. "en-US") to a supported locale. */
export function resolveLocale(input: string | null | undefined): LocaleCode {
  if (!input) return DEFAULT_LOCALE;
  const primary = input.toLowerCase().split('-')[0];
  const found = LOCALES.find((l) => l.code === primary);
  return found ? found.code : DEFAULT_LOCALE;
}

export function isLocale(value: string | null | undefined): value is LocaleCode {
  return !!value && LOCALE_CODES.includes(value as LocaleCode);
}

/** Canonical URL for a given locale (default locale keeps the clean root URL). */
export function localeUrl(code: LocaleCode, base: string = SITE_URL): string {
  return code === DEFAULT_LOCALE ? `${base}/` : `${base}/?${LANG_PARAM}=${code}`;
}

/** hreflang → URL map for <link rel="alternate"> / sitemap, incl. x-default. */
export function hreflangAlternates(base: string = SITE_URL): Record<string, string> {
  const map: Record<string, string> = { 'x-default': `${base}/` };
  for (const l of LOCALES) map[l.hreflang] = localeUrl(l.code, base);
  return map;
}
