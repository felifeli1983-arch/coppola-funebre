// Central place for Supabase env + a "configured?" guard so the shop/admin
// can render graceful empty states before Supabase is connected.

// Public values of the "Eredi Coppola" Supabase project. Safe to ship: the
// anon key is a publishable key that is sent to every visitor's browser
// anyway, and all data access is enforced by Row Level Security.
const DEFAULT_SUPABASE_URL = 'https://qmnwtejuzvjslhfojcay.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnd0ZWp1enZqc2xoZm9qY2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2NDAzODksImV4cCI6MjExMTIxNjM4OX0.9DYSNV4aTLl6Hxtrup4Ja8-5Ws3icM3aVLIXm1woGiY';

// Values pasted into a hosting dashboard can carry invisible junk (spaces,
// line breaks) or masked "•••" characters copied from a UI that hides
// secrets. Such values make fetch() throw a TypeError, because HTTP header
// values must be plain ASCII — which breaks login with a cryptic "type error".
// Use an env value only when it is clean; otherwise fall back to the defaults.
function clean(value: string | undefined, isValid: (s: string) => boolean): string | null {
  const s = (value ?? '').trim();
  return s && isValid(s) ? s : null;
}

const isSupabaseUrl = (s: string) => /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(s);
const isPublicKey = (s: string) =>
  /^[A-Za-z0-9._-]+$/.test(s) && (s.startsWith('eyJ') || s.startsWith('sb_publishable_'));
const isAsciiToken = (s: string) => /^[\x21-\x7e]+$/.test(s);

export const SUPABASE_URL = (
  clean(process.env.NEXT_PUBLIC_SUPABASE_URL, isSupabaseUrl) ?? DEFAULT_SUPABASE_URL
).replace(/\/$/, '');
export const SUPABASE_ANON_KEY =
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, isPublicKey) ?? DEFAULT_SUPABASE_ANON_KEY;
// Secret: no default. An invalid value is treated as "not configured" so the
// app degrades gracefully instead of crashing on every server-side request.
export const SUPABASE_SERVICE_ROLE_KEY =
  clean(process.env.SUPABASE_SERVICE_ROLE_KEY, isAsciiToken) ?? '';

/** True when the public Supabase client can be created (URL + anon key present). */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** True when server-side admin writes are possible (service role present). */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
