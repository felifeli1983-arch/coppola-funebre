'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ActionForm, SubmitButton } from '@/components/admin/actions';
import { saveContatto } from '@/lib/admin/crm-actions';
import { CONTACT_SOURCE, CONTACT_STAGE, CONTACT_STAGE_KEYS } from '@/lib/admin/meta';
import type { Contatto } from '@/lib/admin/crm';

export default function ContattoForm({ contatto }: { contatto?: Contatto }) {
  const editing = !!contatto;
  const [tipo, setTipo] = React.useState<'privato' | 'azienda'>(contatto?.tipo ?? 'privato');
  const [tags, setTags] = React.useState<string[]>(contatto?.tags ?? []);
  const [tagInput, setTagInput] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const ind = contatto?.indirizzo ?? {};
  const cancelHref = editing ? `/admin/clienti/${contatto!.id}` : '/admin/clienti';

  const addTag = (raw: string) => {
    const parts = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setTags((prev) => Array.from(new Set([...prev, ...parts.map((p) => p.slice(0, 40))])).slice(0, 20));
    setTagInput('');
  };

  return (
    <ActionForm
      action={saveContatto}
      redirectTo={(res) => (res && res.id ? `/admin/clienti/${res.id}` : null)}
      className="pb-24 md:pb-0"
    >
      {editing && <input type="hidden" name="id" value={contatto!.id} />}
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="tags" value={tags.join(',')} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-5">
          <Card>
            <CardHeaderRow title="Anagrafica" description="Chi è questo contatto." />
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 sm:inline-grid sm:w-fit">
                {(
                  [
                    ['privato', 'Privato', User],
                    ['azienda', 'Azienda', Building2],
                  ] as const
                ).map(([v, label, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTipo(v)}
                    className={cn(
                      'flex h-8 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors',
                      tipo === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-pressed={tipo === v}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>

              {tipo === 'azienda' && (
                <Field label="Ragione sociale" htmlFor="azienda">
                  <Input id="azienda" name="azienda" defaultValue={contatto?.azienda ?? ''} placeholder="Es. Fiori Rossi S.r.l." />
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={tipo === 'azienda' ? 'Referente' : 'Nome e cognome'} htmlFor="nome" className="sm:col-span-2">
                  <Input id="nome" name="nome" defaultValue={contatto?.nome ?? ''} placeholder="Es. Maria Esposito" autoComplete="off" />
                </Field>
                <Field label="Codice fiscale" htmlFor="codice_fiscale">
                  <Input
                    id="codice_fiscale"
                    name="codice_fiscale"
                    defaultValue={contatto?.codice_fiscale ?? ''}
                    className="uppercase"
                    maxLength={16}
                    autoComplete="off"
                  />
                </Field>
                {tipo === 'azienda' && (
                  <Field label="Partita IVA" htmlFor="partita_iva">
                    <Input id="partita_iva" name="partita_iva" defaultValue={contatto?.partita_iva ?? ''} inputMode="numeric" maxLength={13} />
                  </Field>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow title="Recapiti" description="Serve almeno un nome, un’email o un telefono." />
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={emailError}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  defaultValue={contatto?.email ?? ''}
                  placeholder="nome@esempio.it"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    setEmailError(v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? 'Controlla l’indirizzo email.' : null);
                  }}
                />
              </Field>
              <Field label="Telefono" htmlFor="telefono">
                <Input id="telefono" name="telefono" type="tel" inputMode="tel" defaultValue={contatto?.telefono ?? ''} placeholder="Es. 333 123 4567" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow title="Indirizzo" />
            <CardContent className="grid gap-4 sm:grid-cols-6">
              <Field label="Via e numero civico" htmlFor="via" className="sm:col-span-6">
                <Input id="via" name="via" defaultValue={ind.via ?? ''} />
              </Field>
              <Field label="Città" htmlFor="citta" className="sm:col-span-3">
                <Input id="citta" name="citta" defaultValue={ind.citta ?? ''} />
              </Field>
              <Field label="CAP" htmlFor="cap" className="sm:col-span-1">
                <Input id="cap" name="cap" defaultValue={ind.cap ?? ''} inputMode="numeric" maxLength={5} />
              </Field>
              <Field label="Provincia" htmlFor="provincia" className="sm:col-span-2">
                <Input id="provincia" name="provincia" defaultValue={ind.provincia ?? ''} className="uppercase" maxLength={2} placeholder="NA" />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <Card>
            <CardHeaderRow title="Classificazione" />
            <CardContent className="grid gap-4">
              <Field label="Stato" htmlFor="stato" hint={undefined}>
                <NativeSelect id="stato" name="stato" defaultValue={contatto?.stato ?? 'nuovo'}>
                  {CONTACT_STAGE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {CONTACT_STAGE[k].label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Come ci ha conosciuto" htmlFor="fonte">
                <NativeSelect id="fonte" name="fonte" defaultValue={contatto?.fonte ?? ''}>
                  <option value="">Non indicato</option>
                  {Object.entries(CONTACT_SOURCE).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Etichette" htmlFor="tag-input" hint="Scrivi e premi Invio o la virgola.">
                <div className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 pr-1 font-normal">
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags((p) => p.filter((x) => x !== t))}
                        className="rounded-sm p-0.5 hover:bg-background"
                        aria-label={`Rimuovi ${t}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    id="tag-input"
                    value={tagInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.includes(',')) addTag(v);
                      else setTagInput(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      } else if (e.key === 'Backspace' && !tagInput && tags.length) {
                        setTags((p) => p.slice(0, -1));
                      }
                    }}
                    onBlur={() => addTag(tagInput)}
                    placeholder={tags.length ? '' : 'Es. previdenza, fornitore'}
                    className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow title="Note" />
            <CardContent>
              <Textarea name="note" rows={5} defaultValue={contatto?.note ?? ''} placeholder="Informazioni utili, preferenze, ricorrenze…" />
            </CardContent>
          </Card>

          <div className="hidden gap-2 md:flex">
            <SubmitButton className="flex-1" pendingText="Salvataggio…">
              {editing ? 'Salva modifiche' : 'Crea contatto'}
            </SubmitButton>
            <Button variant="outline" asChild>
              <Link href={cancelHref}>Annulla</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky action bar on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        <Button variant="outline" asChild className="flex-1">
          <Link href={cancelHref}>Annulla</Link>
        </Button>
        <SubmitButton className="flex-[2]" pendingText="Salvataggio…">
          {editing ? 'Salva' : 'Crea contatto'}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
