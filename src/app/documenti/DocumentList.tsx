import { Download, FileImage, FileSpreadsheet, FileText, File as FileIcon } from 'lucide-react';
import { documentUrl } from '@/lib/shop/format';
import { TIPI_DOCUMENTO, type DocumentoPubblico } from '@/lib/legal-defaults';

// Public, brand-styled list of downloadable documents (site palette, not admin
// tokens). Uses explicit !-prefixed classes so it renders correctly even inside
// the `.prose-coppola` legal layout.

export function estensione(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return ext.length <= 5 ? ext : '';
}

function iconFor(ext: string) {
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return FileImage;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return FileSpreadsheet;
  if (['pdf', 'doc', 'docx', 'odt', 'txt', 'rtf'].includes(ext)) return FileText;
  return FileIcon;
}

const dataFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

export function DocumentRow({ d }: { d: DocumentoPubblico }) {
  const ext = estensione(d.storage_path);
  const Icon = iconFor(ext);
  const url = documentUrl(d.storage_path);
  return (
    <div className="flex min-w-0 flex-col gap-4 border-b border-pietra/10 py-5 last:border-b-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className="flex h-12 w-12 flex-none flex-col items-center justify-center border border-pietra/15 bg-white text-bordeaux">
          <Icon size={20} strokeWidth={1.4} />
          {ext && <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-pietra-chiaro">{ext}</span>}
        </span>
        <div className="min-w-0 flex-1">
          <div className="break-words font-serif text-xl leading-snug text-pietra">{d.titolo}</div>
          {d.descrizione && (
            <div className="mt-1 break-words text-sm font-light leading-relaxed text-pietra-chiaro">{d.descrizione}</div>
          )}
          <div className="mt-1.5 text-xs uppercase tracking-wider text-pietra-chiaro/80">
            Pubblicato il {dataFmt.format(new Date(d.created_at))}
          </div>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-none items-center justify-center gap-2 self-start border border-bordeaux px-5 py-2.5 text-xs font-medium uppercase tracking-wider !text-bordeaux !no-underline transition-colors hover:bg-bordeaux hover:!text-avorio sm:self-center"
      >
        <Download size={14} />
        {ext === 'pdf' ? 'Apri' : 'Scarica'}
      </a>
    </div>
  );
}

/** Groups documents by type, in a stable order. */
export function raggruppaPerTipo(docs: DocumentoPubblico[]): { tipo: string; label: string; docs: DocumentoPubblico[] }[] {
  const order = Object.keys(TIPI_DOCUMENTO);
  const map = new Map<string, DocumentoPubblico[]>();
  for (const d of docs) {
    const k = d.tipo || 'generico';
    map.set(k, [...(map.get(k) ?? []), d]);
  }
  return [...map.entries()]
    .sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([tipo, list]) => ({ tipo, label: TIPI_DOCUMENTO[tipo] ?? tipo, docs: list }));
}
