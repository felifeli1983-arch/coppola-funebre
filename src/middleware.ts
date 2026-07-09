import { NextResponse, type NextRequest } from 'next/server';
import {
  GEO_COOKIE,
  LANG_HEADER,
  LANG_PARAM,
  isLocale,
  localeFromCountry,
} from '@/i18n/config';

// Two jobs:
//  1. If the URL pins a language via ?lang=xx, forward it to the server render
//     as the `x-coppola-lang` request header so the page is SSR'd in that
//     language (correct HTML for crawlers at each hreflang URL). Also mirror it
//     into the persistence cookie.
//  2. Otherwise, detect the visitor's country from the edge geo headers and
//     store the best-fit language as a *suggestion* cookie. This does NOT change
//     the SSR language of "/" (which stays the Italian canonical) — the client
//     LanguageProvider uses the cookie to auto-switch the experience for real
//     users, without affecting the indexed HTML.
export function middleware(req: NextRequest) {
  const paramLang = req.nextUrl.searchParams.get(LANG_PARAM);

  const requestHeaders = new Headers(req.headers);

  if (isLocale(paramLang)) {
    requestHeaders.set(LANG_HEADER, paramLang);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.cookies.set(GEO_COOKIE, paramLang, cookieOpts());
    return res;
  }

  const country =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).geo?.country ||
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    '';

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  const geoLocale = localeFromCountry(country);
  if (geoLocale) {
    res.cookies.set(GEO_COOKIE, geoLocale, cookieOpts());
  }
  return res;
}

function cookieOpts() {
  return {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax' as const,
  };
}

export const config = {
  // Run on page routes only — skip API, Next internals, and static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|img/|.*\\.).*)'],
};
