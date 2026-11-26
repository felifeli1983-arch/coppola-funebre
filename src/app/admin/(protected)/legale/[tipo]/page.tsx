import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink, Info } from 'lucide-react';
import { dataAggiornamento, getTestoLegale, isLegaleTipo, LEGALE_DEFAULT, LEGALE_META } from '@/lib/legal-defaults';
import { PageHeader } from '@/components/admin/kit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LegaleEditor from '@/components/admin/system/LegaleEditor';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: { params: { tipo: string } }): Metadata {
  return { title: isLegaleTipo(params.tipo) ? LEGALE_META[params.tipo].titolo : 'Testi legali' };
}

export default async function LegalePage({ params }: { params: { tipo: string } }) {
  if (!isLegaleTipo(params.tipo)) notFound();
  const tipo = params.tipo;
  const meta = LEGALE_META[tipo];
  const testo = await getTestoLegale(tipo);

  return (
    <div className="grid gap-5">
      <PageHeader
        title={meta.titolo}
        description={meta.sottotitolo}
        className="mb-0"
        meta={
          <>
            <Badge variant={testo.personalizzato ? 'brand' : 'muted'} dot>
              {testo.personalizzato ? 'Testo personalizzato' : 'Testo predefinito'}
            </Badge>
            <span className="text-xs text-muted-foreground">Ultimo aggiornamento: {dataAggiornamento(testo)}</span>
          </>
        }
        actions={
          <Button variant="outline" size="sm" asChild>
            <a href={meta.path} target="_blank" rel="noreferrer">
              <ExternalLink /> Vedi pagina pubblica
            </a>
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-info/20 bg-info/5 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 flex-none text-info" />
        <div className="min-w-0">
          <span className="font-medium">Stai modificando il testo attualmente pubblicato.</span>{' '}
          <span className="text-muted-foreground">
            Quando salvi, la pagina del sito si aggiorna subito. Formattazione: “## ” per i titoli, “### ” per i
            sottotitoli, “- ” per gli elenchi, **grassetto**, [testo](link). Lascia una riga vuota tra i paragrafi.
          </span>
        </div>
      </div>

      <LegaleEditor
        key={testo.aggiornatoIl ?? 'default'}
        tipo={tipo}
        initial={testo.contenuto}
        personalizzato={testo.personalizzato}
        hasDefaultChanges={testo.personalizzato && testo.contenuto !== LEGALE_DEFAULT[tipo].trim()}
      />
    </div>
  );
}
