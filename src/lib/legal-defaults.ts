import 'server-only';
import { createClient } from '@/lib/supabase/server';

// Single source of truth for the legal pages. The public pages and the admin
// editor both read through `getTestoLegale`: the text saved from the admin
// (impostazioni key `legale_<tipo>` → { contenuto }) wins; otherwise the
// defaults below (the texts originally published on the site) are used.
// Format understood by renderLegaleContent (src/components/LegalContent.tsx):
// "## " headings, "### " sub-headings, "- " lists, **bold**, [testo](link).

export type LegaleTipo = 'privacy' | 'cookie';

export const LEGALE_META: Record<LegaleTipo, { titolo: string; sottotitolo: string; path: string }> = {
  privacy: {
    titolo: 'Privacy Policy',
    sottotitolo: 'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).',
    path: '/privacy-policy',
  },
  cookie: {
    titolo: 'Cookie Policy',
    sottotitolo:
      "Informativa estesa sull'utilizzo dei cookie ai sensi del Provvedimento del Garante della Privacy del 10 giugno 2021 e del GDPR.",
    path: '/cookie-policy',
  },
};

/** Date shown for the built-in texts (their original publication). */
export const DEFAULT_AGGIORNAMENTO = 'aprile 2026';

export const LEGALE_DEFAULT: Record<LegaleTipo, string> = {
  privacy: `## 1. Titolare del trattamento

Il Titolare del trattamento dei dati personali è **Onoranze Funebri Coppola**, contattabile ai seguenti recapiti:

- Telefono: [081 571 3888](tel:0815713888)
- Email: [info@eredicoppola.com](mailto:info@eredicoppola.com)

## 2. Dati raccolti

Raccogliamo i seguenti dati personali:

- **Dati identificativi**: nome, cognome, codice fiscale
- **Dati di contatto**: indirizzo email, numero di telefono, indirizzo postale
- **Dati di navigazione**: indirizzo IP, browser, sistema operativo, pagine visitate
- **Dati relativi al servizio**: informazioni necessarie per l'esecuzione delle prestazioni funebri richieste

## 3. Finalità del trattamento

I dati personali sono trattati per le seguenti finalità:

- Esecuzione del contratto di servizi funebri e adempimenti correlati
- Gestione delle pratiche burocratiche obbligatorie (denunce, certificati, autorizzazioni)
- Risposta a richieste di informazioni o preventivi inviate tramite il modulo di contatto
- Adempimenti di legge in materia fiscale, contabile e sanitaria
- Comunicazioni con consolati e ambasciate per rimpatri internazionali
- Pubblicazione di necrologi e manifesti previo consenso dei familiari

## 4. Base giuridica del trattamento

Il trattamento dei dati si fonda su: esecuzione di un contratto di cui l'interessato è parte (art. 6.1.b GDPR), adempimento di obblighi di legge (art. 6.1.c GDPR), consenso esplicito dell'interessato per finalità ulteriori (art. 6.1.a GDPR), legittimo interesse del Titolare (art. 6.1.f GDPR).

## 5. Modalità del trattamento

I dati personali sono trattati con strumenti manuali, informatici e telematici, con logiche strettamente correlate alle finalità sopra indicate e in modo da garantire la sicurezza e la riservatezza dei dati stessi, nel rispetto del principio di minimizzazione.

## 6. Conservazione dei dati

I dati personali sono conservati per il tempo strettamente necessario al conseguimento delle finalità per cui sono raccolti e, in ogni caso, nel rispetto dei termini di legge applicabili (in particolare, la normativa fiscale che impone la conservazione delle scritture contabili per 10 anni).

## 7. Comunicazione e diffusione

I dati possono essere comunicati a:

- Pubbliche autorità (Comuni, ASL, Prefetture, Consolati, Tribunali)
- Fornitori di servizi tecnici (hosting, email, sistemi gestionali)
- Consulenti professionali (commercialisti, legali)
- Compagnie assicurative e istituti di credito quando necessario

I dati non sono oggetto di diffusione né trasferiti a Paesi extra-UE salvo specifiche esigenze legate ai rimpatri internazionali, sempre nel rispetto delle garanzie previste dal GDPR.

## 8. Diritti dell'interessato

Ai sensi degli artt. 15-22 del GDPR, l'interessato ha diritto di:

- Accedere ai propri dati personali
- Richiederne la rettifica o la cancellazione
- Limitarne o opporsi al trattamento
- Ricevere i dati in formato strutturato (portabilità)
- Revocare il consenso prestato in qualsiasi momento
- Proporre reclamo al Garante per la Protezione dei Dati Personali

Per esercitare tali diritti è possibile scrivere all'indirizzo [info@eredicoppola.com](mailto:info@eredicoppola.com).

## 9. Modulo di contatto

I dati raccolti tramite il modulo di contatto presente sul sito sono trattati esclusivamente per rispondere alla richiesta inviata e non sono utilizzati per finalità di marketing senza un esplicito consenso dell'interessato.

## 10. Modifiche

La presente informativa può essere aggiornata in qualsiasi momento. Le modifiche verranno pubblicate su questa pagina con indicazione della data dell'ultimo aggiornamento.`,

  cookie: `## 1. Cosa sono i cookie

I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva. Permettono di ricordare le azioni e preferenze dell'utente per migliorarne l'esperienza di navigazione.

## 2. Tipologie di cookie utilizzate

### Cookie tecnici (sempre attivi)

Sono cookie strettamente necessari al corretto funzionamento del sito e non richiedono il consenso dell'utente. Includono:

- Cookie di sessione per la navigazione
- Cookie per la memorizzazione del consenso ai cookie
- Cookie di sicurezza per prevenire frodi

### Cookie analitici (previo consenso)

Possono essere utilizzati strumenti di analisi del traffico per comprendere come gli utenti utilizzano il sito e migliorarlo. Tali cookie raccolgono informazioni in forma aggregata e anonima.

### Cookie di profilazione e marketing (previo consenso)

Attualmente il sito **non utilizza cookie di profilazione o di marketing**. Qualora in futuro venissero introdotti, l'utente verrà informato e gli verrà richiesto il consenso esplicito.

## 3. Cookie di terze parti

Il sito può ospitare contenuti di terze parti (es. mappe, video, font web) che potrebbero rilasciare cookie autonomi. Si invita l'utente a consultare le rispettive informative per maggiori dettagli.

- **Google Fonts** — utilizziamo i font web di Google. [Privacy Policy](https://policies.google.com/privacy)
- **Vercel** — hosting del sito. [Privacy Policy](https://vercel.com/legal/privacy-policy)

## 4. Gestione delle preferenze

L'utente può modificare in qualsiasi momento le proprie preferenze sui cookie:

- Tramite il banner di consenso che appare al primo accesso al sito
- Disabilitando i cookie direttamente dalle impostazioni del proprio browser
- Cancellando i cookie già installati tramite le funzioni del browser

## 5. Come disabilitare i cookie sul browser

Di seguito le guide ufficiali per i browser più diffusi:

- [Google Chrome](https://support.google.com/chrome/answer/95647)
- [Mozilla Firefox](https://support.mozilla.org/it/kb/Gestione%20dei%20cookie)
- [Safari](https://support.apple.com/it-it/guide/safari/sfri11471/mac)
- [Microsoft Edge](https://support.microsoft.com/it-it/microsoft-edge)

## 6. Conseguenze della disabilitazione

La disabilitazione dei cookie tecnici può comportare il malfunzionamento di alcune funzionalità del sito. La disabilitazione dei cookie analitici non incide sulla navigazione.

## 7. Titolare e contatti

Il Titolare del trattamento è **Onoranze Funebri Coppola**. Per qualsiasi richiesta relativa ai cookie:

- Email: [info@eredicoppola.com](mailto:info@eredicoppola.com)
- Telefono: [081 571 3888](tel:0815713888)`,
};

export function isLegaleTipo(v: string): v is LegaleTipo {
  return v === 'privacy' || v === 'cookie';
}

export type TestoLegale = {
  contenuto: string;
  /** True when the owner has saved a custom text from the admin. */
  personalizzato: boolean;
  /** ISO timestamp of the last save, null for the built-in text. */
  aggiornatoIl: string | null;
};

/** The text currently published for a legal page (saved text, else default). */
export async function getTestoLegale(tipo: LegaleTipo): Promise<TestoLegale> {
  try {
    const s = createClient();
    const { data } = await s
      .from('impostazioni')
      .select('valore, updated_at')
      .eq('chiave', `legale_${tipo}`)
      .maybeSingle();
    const contenuto = ((data?.valore as { contenuto?: string } | null)?.contenuto ?? '').trim();
    if (contenuto) return { contenuto, personalizzato: true, aggiornatoIl: data?.updated_at ?? null };
  } catch (e) {
    console.error('getTestoLegale', e);
  }
  return { contenuto: LEGALE_DEFAULT[tipo], personalizzato: false, aggiornatoIl: null };
}

/** "12 marzo 2027" for a saved text, "aprile 2026" for the default. */
export function dataAggiornamento(t: TestoLegale): string {
  if (!t.aggiornatoIl) return DEFAULT_AGGIORNAMENTO;
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(
    new Date(t.aggiornatoIl),
  );
}

export type DocumentoPubblico = {
  id: string;
  titolo: string;
  descrizione: string | null;
  tipo: string;
  storage_path: string;
  created_at: string;
};

/** Documents marked public from the admin (RLS lets anyone read these rows). */
export async function getDocumentiPubblici(): Promise<DocumentoPubblico[]> {
  try {
    const s = createClient();
    const { data } = await s
      .from('documenti')
      .select('id, titolo, descrizione, tipo, storage_path, created_at')
      .eq('pubblico', true)
      .order('created_at', { ascending: false });
    return (data ?? []) as DocumentoPubblico[];
  } catch (e) {
    console.error('getDocumentiPubblici', e);
    return [];
  }
}

export const TIPI_DOCUMENTO: Record<string, string> = {
  generico: 'Documenti',
  privacy: 'Privacy',
  cookie: 'Cookie',
  condizioni: 'Condizioni di vendita',
  modulo: 'Moduli',
  catalogo: 'Cataloghi',
  listino: 'Listini',
};
