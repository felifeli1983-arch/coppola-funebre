import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { getDocumentiPubblici } from '@/lib/legal-defaults';
import { DocumentRow, raggruppaPerTipo } from './DocumentList';

export const metadata: Metadata = {
  title: 'Documenti — Onoranze Funebri Coppola',
  description: 'Informative, moduli e documenti utili di Onoranze Funebri Coppola, da consultare e scaricare.',
  alternates: { canonical: '/documenti' },
};

export const dynamic = 'force-dynamic';

export default async function DocumentiPage() {
  const docs = await getDocumentiPubblici();
  const gruppi = raggruppaPerTipo(docs);

  return (
    <LegalLayout
      title="Documenti"
      subtitle="Informative, moduli e documenti utili da consultare e scaricare."
    >
      {gruppi.length === 0 ? (
        <div className="border border-pietra/10 bg-white/60 px-6 py-12 text-center">
          <div className="font-serif text-2xl text-pietra">Nessun documento disponibile</div>
          <div className="mt-2 text-sm font-light text-pietra-chiaro">
            Al momento non ci sono documenti pubblicati. Per qualsiasi informazione contattaci al{' '}
            <a href="tel:0815713888">081 571 3888</a>.
          </div>
        </div>
      ) : (
        <div className="grid gap-12">
          {gruppi.map((g) => (
            <div key={g.tipo}>
              <div className="mb-2 flex items-center gap-3">
                <span className="divider-line" />
                <span className="eyebrow">{g.label}</span>
              </div>
              <div>
                {g.docs.map((d) => (
                  <DocumentRow key={d.id} d={d} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </LegalLayout>
  );
}
