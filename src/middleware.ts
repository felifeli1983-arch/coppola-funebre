import { NextResponse, type NextRequest } from 'next/server';
import {
  GEO_COOKIE,
  LANG_HEADER,
  LANG_PARAM,
  isLocale,
  localeFromCountry,
} from '@/i18n/config';

// Returns true for the admin subdomain (admin.eredicoppola.com, admin.localhost, …).
function isAdminHost(host: string): boolean {
  return host.split(':')[0].toLowerCase().startsWith('admin.');
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';

  // ── Admin subdomain → serve the /admin route group ────────────────
  // admin.<domain>/<path>  ->  internally /admin/<path>  (URL stays clean).
  // The admin app has its own auth; i18n/geo logic is skipped here.
  // The `x-coppola-admin` header lets the root layout skip the public chrome.
  if (isAdminHost(host)) {
    const url = req.nextUrl.clone();
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
    }
    const headers = new Headers(req.headers);
    headers.set('x-coppola-admin', '1');
    return NextResponse.rewrite(url, { request: { headers } });
  }

  // Direct /admin path (local dev at /admin, or main-host fallback).
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const headers = new Headers(req.headers);
    headers.set('x-coppola-admin', '1');
    return NextResponse.next({ request: { headers } });
  }

  // ── Public site: i18n language resolution (unchanged) ─────────────
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
