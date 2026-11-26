import type { Metadata } from 'next';
import { ExternalLink, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { EmptyState, PageHeader } from '@/components/admin/kit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DocumentiTable, UploadDialog, type DocRow } from '@/components/admin/system/DocumentiClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Documenti' };

export default async function DocumentiAdminPage() {
  const s = createClient();
  const { data } = await s
    .from('documenti')
    .select('id, titolo, descrizione, storage_path, tipo, pubblico, created_at')
    .order('created_at', { ascending: false });
  const docs = (data ?? []) as DocRow[];
  const pubblici = docs.filter((d) => d.pubblico).length;

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Documenti"
        description="Informative, moduli e allegati. Quelli visibili sul sito compaiono nella pagina pubblica “Documenti” e in fondo alla Privacy Policy."
        className="mb-0"
        meta={
          docs.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {docs.length} {docs.length === 1 ? 'documento' : 'documenti'} · {pubblici} visibili sul sito
            </span>
          ) : undefined
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href="/documenti" target="_blank" rel="noreferrer">
                <ExternalLink /> Pagina pubblica
              </a>
            </Button>
            <UploadDialog />
          </>
        }
      />

      {docs.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Nessun documento caricato"
            description="Carica informative, moduli o cataloghi: puoi decidere quali mostrare sul sito."
            action={<UploadDialog />}
          />
        </Card>
      ) : (
        <DocumentiTable docs={docs} />
      )}
    </div>
  );
}
