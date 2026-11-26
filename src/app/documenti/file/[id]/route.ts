import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Serves a document file through a short-lived signed URL.
 * - Visitors: only documents marked "Visibile sul sito" (database rules).
 * - Logged-in admins: every document, internal ones included.
 * The storage bucket is private, so internal files can't be opened by link.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const notFound = () => NextResponse.redirect(new URL('/documenti?non-disponibile=1', req.url), 302);
  if (!UUID_RE.test(params.id)) return notFound();

  const supabase = createClient();
  const { data: doc } = await supabase
    .from('documenti')
    .select('storage_path, titolo')
    .eq('id', params.id)
    .maybeSingle();
  if (!doc?.storage_path) return notFound();

  const download = new URL(req.url).searchParams.has('scarica');
  const { data, error } = await supabase.storage
    .from('documenti')
    .createSignedUrl(doc.storage_path, 300, download ? { download: true } : undefined);
  if (error || !data?.signedUrl) return notFound();

  const res = NextResponse.redirect(data.signedUrl, 302);
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}
