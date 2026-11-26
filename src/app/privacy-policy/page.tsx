import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { renderLegaleContent } from '@/components/LegalContent';
import { dataAggiornamento, getDocumentiPubblici, getTestoLegale, LEGALE_META } from '@/lib/legal-defaults';
import { DocumentRow } from '@/app/documenti/DocumentList';

export const metadata: Metadata = {
  title: 'Privacy Policy — Onoranze Funebri Coppola',
  description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR Reg. UE 2016/679.',
};

// Always read the latest text saved from the admin.
export const dynamic = 'force-dynamic';

export default async function PrivacyPolicy() {
  const [testo, documenti] = await Promise.all([getTestoLegale('privacy'), getDocumentiPubblici()]);
  const meta = LEGALE_META.privacy;

  return (
    <LegalLayout title={meta.titolo} subtitle={meta.sottotitolo}>
      {renderLegaleContent(testo.contenuto)}

      <p className="text-sm italic">Ultimo aggiornamento: {dataAggiornamento(testo)}.</p>

      {documenti.length > 0 && (
        <div className="mt-14 border-t border-pietra/10 pt-10">
          <h2>Documenti utili</h2>
          <div>
            {documenti.slice(0, 6).map((d) => (
              <DocumentRow key={d.id} d={d} />
            ))}
          </div>
          {documenti.length > 6 && (
            <div className="mt-4">
              <a href="/documenti">Vedi tutti i documenti</a>
            </div>
          )}
        </div>
      )}
    </LegalLayout>
  );
}
