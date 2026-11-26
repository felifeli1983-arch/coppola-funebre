'use client';

import * as React from 'react';
import { Bold, Eye, Heading2, Heading3, Link2, List, Pencil, RotateCcw } from 'lucide-react';
import { renderLegaleContent } from '@/components/LegalContent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Hint } from '@/components/ui/primitives';
import { ActionForm, ConfirmAction, SubmitButton } from '@/components/admin/actions';
import { ripristinaTestoLegale, salvaTestoLegale } from '@/lib/admin/system-actions';

type Snippet = { label: string; icon: React.ElementType; before: string; after?: string; placeholder: string; line?: boolean };

const SNIPPETS: Snippet[] = [
  { label: 'Titolo di sezione', icon: Heading2, before: '## ', placeholder: 'Titolo', line: true },
  { label: 'Sottotitolo', icon: Heading3, before: '### ', placeholder: 'Sottotitolo', line: true },
  { label: 'Elenco puntato', icon: List, before: '- ', placeholder: 'Voce elenco', line: true },
  { label: 'Grassetto', icon: Bold, before: '**', after: '**', placeholder: 'testo' },
  { label: 'Link', icon: Link2, before: '[', after: '](https://)', placeholder: 'testo del link' },
];

export default function LegaleEditor({
  tipo,
  initial,
  personalizzato,
  hasDefaultChanges,
}: {
  tipo: 'privacy' | 'cookie';
  initial: string;
  personalizzato: boolean;
  /** True when the saved text differs from the built-in default. */
  hasDefaultChanges: boolean;
}) {
  const [text, setText] = React.useState(initial);
  const [view, setView] = React.useState<'edit' | 'preview'>('edit');
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const dirty = text !== initial;

  React.useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const insert = (s: Snippet) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const selected = value.slice(a, b) || s.placeholder;
    let before = s.before;
    if (s.line && a > 0 && value[a - 1] !== '\n') before = '\n\n' + before;
    const next = value.slice(0, a) + before + selected + (s.after ?? '') + value.slice(b);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const start = a + before.length;
      el.setSelectionRange(start, start + selected.length);
    });
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ActionForm action={salvaTestoLegale} className="grid gap-4">
      <input type="hidden" name="tipo" value={tipo} />

      {/* Mobile view switch */}
      <div className="inline-flex w-full rounded-lg bg-muted p-1 lg:hidden" role="tablist">
        {(
          [
            ['edit', 'Modifica', Pencil],
            ['preview', 'Anteprima', Eye],
          ] as const
        ).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card className={cn('overflow-hidden', view === 'preview' && 'hidden lg:block')}>
          <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
            {SNIPPETS.map((s) => (
              <Hint key={s.label} label={s.label}>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => insert(s)} aria-label={s.label}>
                  <s.icon />
                </Button>
              </Hint>
            ))}
            <span className="ml-auto pr-1 text-xs tabular-nums text-muted-foreground">{words.toLocaleString('it-IT')} parole</span>
          </div>
          <Textarea
            ref={ref}
            name="contenuto"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck
            className="min-h-[60vh] resize-y rounded-none border-0 font-mono text-[13px] leading-relaxed shadow-none focus-visible:ring-0 lg:min-h-[70vh]"
          />
        </Card>

        <Card className={cn('lg:sticky lg:top-20', view === 'edit' && 'hidden lg:block')}>
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm font-medium">Anteprima</span>
            <span className="text-xs text-muted-foreground">Come apparirà sul sito</span>
          </div>
          <div className="max-h-[70vh] overflow-y-auto bg-avorio px-5 py-6 sm:px-8">
            <div className="prose-coppola [&_h2]:!font-serif [&_h3]:!font-serif [&_h2]:!text-pietra [&_h3]:!text-pietra">
              {text.trim() ? (
                renderLegaleContent(text)
              ) : (
                <p className="italic">Il testo è vuoto.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        {(personalizzato || hasDefaultChanges) && (
          <ConfirmAction
            action={ripristinaTestoLegale}
            data={{ tipo }}
            title="Ripristinare il testo predefinito?"
            description="Il testo personalizzato verrà eliminato e sul sito tornerà subito il testo originale."
            confirmLabel="Ripristina"
            trigger={
              <Button type="button" variant="ghost" size="sm">
                <RotateCcw /> Ripristina testo predefinito
              </Button>
            }
          />
        )}
        <div className="ml-auto flex items-center gap-3">
          {dirty && <span className="hidden text-xs text-warning sm:inline">Modifiche non salvate</span>}
          {dirty && (
            <Button type="button" variant="outline" onClick={() => setText(initial)}>
              Annulla
            </Button>
          )}
          <SubmitButton disabled={!dirty} pendingText="Pubblicazione…">
            Salva e pubblica
          </SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
