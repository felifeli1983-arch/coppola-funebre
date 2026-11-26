import Link from 'next/link';
import type { Metadata } from 'next';
import { Building2, Landmark, Mail, MapPin, Truck, UserCog } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DEFAULTS } from '@/lib/shop/settings';
import { salvaDatiAttivita } from '@/lib/admin/system-actions';
import { PageHeader } from '@/components/admin/kit';
import { ActionForm, SubmitButton } from '@/components/admin/actions';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dati attività' };

type Negozio = Partial<
  Record<
    'nome' | 'email' | 'telefono' | 'indirizzo' | 'citta' | 'cap' | 'provincia' | 'partita_iva' | 'codice_fiscale' | 'pec' | 'sito',
    string
  >
>;

export default async function DatiAttivitaPage() {
  const s = createClient();
  const { data } = await s.from('impostazioni').select('valore').eq('chiave', 'negozio').maybeSingle();
  const n: Negozio = { ...DEFAULTS.negozio, ...((data?.valore as Negozio | null) ?? {}) };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5">
      <PageHeader
        title="Dati attività"
        description="Le informazioni ufficiali dell’impresa: nome, recapiti, sede e dati fiscali."
        className="mb-0"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
        <ActionForm action={salvaDatiAttivita} className="grid min-w-0 gap-5">
          <Card>
            <CardHeaderRow title="Attività" icon={<Building2 />} />
            <CardContent className="grid items-start gap-4 sm:grid-cols-2">
              <Field label="Nome dell’attività" htmlFor="nome" required className="sm:col-span-2">
                <Input id="nome" name="nome" defaultValue={n.nome} required maxLength={120} />
              </Field>
              <Field label="Sito web" htmlFor="sito" className="sm:col-span-2" hint="Es. www.eredicoppola.com">
                <Input id="sito" name="sito" defaultValue={n.sito} maxLength={120} inputMode="url" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow title="Contatti" icon={<Mail />} />
            <CardContent className="grid items-start gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" hint="Mostrata ai clienti per assistenza">
                <Input id="email" name="email" type="email" defaultValue={n.email} maxLength={120} />
              </Field>
              <Field label="Telefono" htmlFor="telefono">
                <Input id="telefono" name="telefono" type="tel" defaultValue={n.telefono} maxLength={40} />
              </Field>
              <Field label="PEC" htmlFor="pec" className="sm:col-span-2">
                <Input id="pec" name="pec" type="email" defaultValue={n.pec} maxLength={120} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow title="Sede" icon={<MapPin />} />
            <CardContent className="grid items-start gap-4 sm:grid-cols-6">
              <Field label="Indirizzo" htmlFor="indirizzo" className="sm:col-span-6">
                <Input id="indirizzo" name="indirizzo" defaultValue={n.indirizzo} maxLength={160} />
              </Field>
              <Field label="Città" htmlFor="citta" className="sm:col-span-3">
                <Input id="citta" name="citta" defaultValue={n.citta} maxLength={80} />
              </Field>
              <Field label="CAP" htmlFor="cap" className="sm:col-span-1">
                <Input id="cap" name="cap" defaultValue={n.cap} maxLength={10} inputMode="numeric" />
              </Field>
              <Field label="Provincia" htmlFor="provincia" className="sm:col-span-2">
                <Input id="provincia" name="provincia" defaultValue={n.provincia} maxLength={40} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow title="Dati fiscali" icon={<Landmark />} />
            <CardContent className="grid items-start gap-4 sm:grid-cols-2">
              <Field label="Partita IVA" htmlFor="partita_iva">
                <Input id="partita_iva" name="partita_iva" defaultValue={n.partita_iva} maxLength={20} />
              </Field>
              <Field label="Codice fiscale" htmlFor="codice_fiscale">
                <Input
                  id="codice_fiscale"
                  name="codice_fiscale"
                  defaultValue={n.codice_fiscale}
                  maxLength={20}
                  className="uppercase"
                />
              </Field>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
            <SubmitButton pendingText="Salvataggio…">Salva modifiche</SubmitButton>
          </div>
        </ActionForm>

        <aside className="grid gap-4">
          <Card className="p-4">
            <div className="text-sm font-medium">Altre impostazioni</div>
            <div className="mt-3 grid gap-1">
              <Button variant="ghost" size="sm" className="justify-start" asChild>
                <Link href="/admin/spedizioni">
                  <Truck /> Spedizioni e costi
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" asChild>
                <Link href="/admin/impostazioni/utenti">
                  <UserCog /> Utenti e accesso
                </Link>
              </Button>
            </div>
          </Card>
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            Nome, telefono ed email compaiono nella distinta di spedizione degli ordini. Tieni questi dati
            aggiornati.
          </p>
        </aside>
      </div>
    </div>
  );
}
