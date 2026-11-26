import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const runtime = 'nodejs';

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Lightweight, cookie-less analytics beacon. Stores aggregate-friendly fields only. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }

  const path = typeof body.path === 'string' ? body.path.slice(0, 300) : null;
  const referrer = typeof body.referrer === 'string' && body.referrer ? body.referrer.slice(0, 500) : null;
  const utm = (body.utm ?? {}) as Record<string, string | undefined>;

  const h = req.headers;
  const ua = h.get('user-agent') ?? '';
  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop';
  // Vercel/edge geo headers (fallbacks for other hosts).
  const paese =
    h.get('x-vercel-ip-country') ||
    h.get('cf-ipcountry') ||
    h.get('x-country') ||
    null;

  try {
    const supabase = createClient();
    await supabase.from('visite').insert({
      path,
      referrer,
      referrer_host: hostOf(referrer),
      utm_source: utm.source?.slice(0, 120) ?? null,
      utm_medium: utm.medium?.slice(0, 120) ?? null,
      utm_campaign: utm.campaign?.slice(0, 120) ?? null,
      paese,
      device,
    });
  } catch {
    /* never block the page on analytics */
  }
  return NextResponse.json({ ok: true });
}
