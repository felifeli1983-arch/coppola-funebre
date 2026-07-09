import type { MetadataRoute } from 'next';
import { LOCALES, SITE_URL, localeUrl } from '@/i18n/config';

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // hreflang alternates for the homepage — x-default + one entry per language.
  const languages: Record<string, string> = { 'x-default': `${BASE}/` };
  for (const l of LOCALES) languages[l.hreflang] = localeUrl(l.code, BASE);

  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${BASE}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/cookie-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/codice-etico`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
