import { NextResponse } from 'next/server';
import { getSpedizione } from '@/lib/shop/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public shipping config so the cart/checkout can show the cost before paying. */
export async function GET() {
  const sp = await getSpedizione();
  return NextResponse.json(sp);
}
