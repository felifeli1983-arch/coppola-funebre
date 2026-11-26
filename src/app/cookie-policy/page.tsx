import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { renderLegaleContent } from '@/components/LegalContent';
import { dataAggiornamento, getTestoLegale, LEGALE_META } from '@/lib/legal-defaults';

export const metadata: Metadata = {
  title: 'Cookie Policy — Onoranze Funebri Coppola',
  description: "Informativa estesa sull'utilizzo dei cookie ai sensi del Provvedimento del Garante e del GDPR.",
};

// Always read the latest text saved from the admin.
export const dynamic = 'force-dynamic';

export default async function CookiePolicy() {
  const testo = await getTestoLegale('cookie');
  const meta = LEGALE_META.cookie;

  return (
    <LegalLayout title={meta.titolo} subtitle={meta.sottotitolo}>
      {renderLegaleContent(testo.contenuto)}
      <p className="text-sm italic">Ultimo aggiornamento: {dataAggiornamento(testo)}.</p>
    </LegalLayout>
  );
}
