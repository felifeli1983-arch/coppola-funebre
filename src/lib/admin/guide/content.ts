// Full guide content. Titles/paths come from ./index.ts (single source).
// Inline markup: **grassetto** · `Etichetta` (testo come appare a schermo) ·
// [testo](/admin/percorso) · {{⌘+K}} (tasti).
import { guideEntry } from './index';
import type { GuideTopic } from './types';

type TopicBody = Omit<GuideTopic, 'id' | 'title' | 'group' | 'icon' | 'href' | 'paths'>;

function topic(id: string, body: TopicBody): GuideTopic {
  const e = guideEntry(id);
  return { id, title: e.title, group: e.group, icon: e.icon, href: e.href, paths: e.paths, ...body };
}

export const GUIDE_TOPICS: GuideTopic[] = [
  // ─────────────────────────────────────────────────────────────────────────
  topic('primi-passi', {
    summary:
      'Come entrare, come è fatto lo schermo, il menu laterale, la ricerca rapida e le scorciatoie che fanno risparmiare tempo.',
    readingMinutes: 5,
    keywords: 'accedere login entrare menu sidebar barra tema scuro telefono',
    sections: [
      {
        id: 'cos-e',
        title: 'Che cos’è il gestionale',
        blocks: [
          {
            type: 'p',
            text: 'Il gestionale è il pannello riservato di **Eredi Coppola**: da qui si seguono i **contatti** (famiglie, clienti, fornitori), gli **ordini** del negozio online, il **catalogo** dei prodotti e i **contenuti del sito** come Privacy Policy, Cookie Policy e documenti scaricabili.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Tutto quello che salvi qui è subito attivo: se nascondi un prodotto sparisce dal negozio, se modifichi la Privacy Policy il sito si aggiorna immediatamente.',
          },
        ],
      },
      {
        id: 'accesso',
        title: 'Entrare e uscire',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Apri **eredicoppola.com/admin** dal browser (computer, tablet o telefono).' },
              {
                title: 'Inserisci `Email` e `Password` e premi `Accedi`.',
                text: 'Con l’icona a forma di occhio puoi mostrare la password mentre la scrivi.',
              },
              {
                title: 'Per uscire, clicca il cerchio con le tue iniziali in alto a destra e scegli `Esci`.',
                text: 'Fallo sempre quando usi un computer condiviso.',
              },
            ],
          },
          {
            type: 'fields',
            title: 'Se l’accesso non riesce',
            items: [
              { label: 'Email o password non corretti', text: 'Controlla di aver scritto bene, maiuscole comprese. Se l’hai dimenticata, chiedi a un altro amministratore di reimpostarti l’accesso (vedi [Utenti e accesso](/admin/guida/utenti)).' },
              { label: 'Troppi tentativi', text: 'Per sicurezza l’accesso si blocca per qualche minuto: attendi e riprova.' },
              { label: 'Impossibile collegarsi al server', text: 'Di solito è la connessione internet: controlla il Wi‑Fi o i dati del telefono e riprova.' },
            ],
          },
        ],
      },
      {
        id: 'schermo',
        title: 'Com’è fatto lo schermo',
        blocks: [
          {
            type: 'list',
            items: [
              '**Menu laterale (a sinistra)**: tutte le sezioni, raggruppate per argomento — CRM, Negozio, Analisi, Contenuti, Impostazioni, Aiuto. Puoi chiudere un gruppo cliccando sulla freccina accanto al suo nome.',
              '**Numeri rossi nel menu**: accanto a `Ordini` vedi quanti ordini sono da gestire (in attesa o pagati), accanto ad `Attività` quanti promemoria sono scaduti o per oggi.',
              '**Barra in alto**: a sinistra il **percorso** (es. Dashboard › Contatti › Dettaglio) — clicca un passaggio per tornare indietro. A destra: ricerca, apri il sito, **?** per l’aiuto della pagina, tema chiaro/scuro e il tuo menu personale.',
              '**Il pulsante ?** apre sempre la parte di questa guida che spiega la pagina in cui ti trovi.',
            ],
          },
          { type: 'demo', demo: 'shell' },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Più spazio sullo schermo',
            text: 'Con `Riduci menu` (in fondo al menu laterale) o con {{⌘+B}} (su Windows {{Ctrl+B}}) il menu diventa una sottile colonna di icone: passa sopra un’icona per vederne il nome. La scelta viene ricordata.',
          },
        ],
      },
      {
        id: 'telefono',
        title: 'Da telefono e tablet',
        blocks: [
          {
            type: 'list',
            items: [
              'Il menu si apre con l’icona a tre righe in alto a sinistra e **si chiude da solo** quando scegli una pagina.',
              'Le tabelle diventano **schede** facili da toccare: tocca una scheda per aprirla.',
              'Nei moduli lunghi (contatti, prodotti) i pulsanti `Annulla` e `Salva` restano **fissi in basso**, così non devi scorrere.',
            ],
          },
        ],
      },
      {
        id: 'ricerca',
        title: 'La ricerca rapida',
        blocks: [
          {
            type: 'p',
            text: 'Dalla casella `Cerca…` in alto (o premendo {{⌘+K}}, su Windows {{Ctrl+K}}) trovi in un attimo qualsiasi cosa senza passare dal menu.',
          },
          {
            type: 'fields',
            items: [
              { label: 'Contatti', text: 'Scrivi nome, email, telefono o ragione sociale.' },
              { label: 'Ordini', text: 'Scrivi il numero con il cancelletto, es. **#12**, oppure l’email del cliente.' },
              { label: 'Prodotti', text: 'Scrivi una parte del nome, es. “urna”.' },
              { label: 'Pagine e guida', text: 'Scrivi il nome di una sezione (“spedizioni”, “password”…) per andarci o per aprirne la guida.' },
              { label: 'Azioni rapide', text: '`Nuovo contatto`, `Nuova attività o promemoria`, `Nuovo prodotto`.' },
            ],
          },
          { type: 'callout', tone: 'tip', text: 'Servono almeno 2 caratteri. Usa le frecce {{↑}} {{↓}} per scegliere e {{Invio}} per aprire.' },
        ],
      },
      {
        id: 'scorciatoie',
        title: 'Scorciatoie da tastiera',
        blocks: [{ type: 'demo', demo: 'shortcuts' }],
      },
      {
        id: 'notifiche',
        title: 'Conferme e messaggi',
        blocks: [
          {
            type: 'p',
            text: 'Dopo ogni salvataggio compare in basso a destra un piccolo messaggio: **verde** se è andato tutto bene, **rosso** se qualcosa non ha funzionato (in quel caso il messaggio spiega cosa correggere). Le operazioni che non si possono annullare, come le eliminazioni, chiedono sempre una conferma.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('dashboard', {
    summary: 'La pagina iniziale: i numeri importanti, le vendite, i promemoria del giorno e cosa richiede attenzione.',
    readingMinutes: 3,
    keywords: 'home panoramica riepilogo fatturato',
    sections: [
      {
        id: 'numeri',
        title: 'I quattro numeri in alto',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: 'Fatturato · 30 giorni', text: 'Somma degli ordini **pagati, spediti o consegnati** negli ultimi 30 giorni, con il confronto con i 30 giorni precedenti.' },
              { label: 'Ordini da gestire', text: 'Ordini **in attesa** o **pagati** (quindi ancora da spedire). Cliccalo per aprire gli ordini. “Tutto in ordine” significa che non c’è nulla in sospeso.' },
              { label: 'Nuovi contatti · 30 giorni', text: 'Persone e aziende entrate in rubrica nell’ultimo mese, anche quelle arrivate dagli ordini.' },
              { label: 'Visite al sito · 7 giorni', text: 'Quante visite ha ricevuto il sito nell’ultima settimana, confrontate con quella prima.' },
            ],
          },
        ],
      },
      {
        id: 'riquadri',
        title: 'I riquadri',
        blocks: [
          {
            type: 'list',
            items: [
              '**Vendite e ordini**: grafico degli ultimi 30 giorni — l’area è il fatturato, le colonne il numero di ordini. Passa con il mouse (o tocca) per vedere il dettaglio del giorno.',
              '**Promemoria**: i promemoria scaduti e quelli dei prossimi 7 giorni, con l’etichetta `Scaduto`, `Oggi` o “tra N giorni”. Toccane uno per aprire il contatto.',
              '**Ultimi ordini** e **Ultimi contatti**: gli ultimi 5, con lo stato. `Tutti →` apre l’elenco completo.',
              '**Scorte basse**: prodotti visibili nel negozio con **3 pezzi o meno**. Clicca per aggiornare la quantità.',
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Una buona abitudine',
            text: 'Inizia la giornata dalla Dashboard: controlla i promemoria scaduti e gli ordini da gestire. I pulsanti in alto (`Nuova attività`, `Nuovo prodotto`, `Nuovo contatto`) sono le scorciatoie per le cose più frequenti.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('tabelle', {
    summary: 'Contatti, ordini, prodotti e documenti usano le stesse tabelle: cercare, filtrare, ordinare, selezionare più righe ed esportare in Excel.',
    readingMinutes: 3,
    keywords: 'filtri ricerca esporta excel csv colonne selezione massa',
    sections: [
      {
        id: 'come-funzionano',
        title: 'Come funzionano',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: 'Cerca', text: 'La casella a sinistra filtra mentre scrivi.' },
              { label: 'Filtri ⊕', text: 'I pulsanti tratteggiati (es. `Stato`, `Fonte`) aprono un elenco di opzioni con accanto quanti elementi ci sono. Puoi sceglierne più di una. `Azzera` toglie ricerca e filtri.' },
              { label: 'Ordinare', text: 'Clicca il titolo di una colonna con le freccine (es. `Prezzo`) per ordinare; clicca di nuovo per invertire.' },
              { label: 'Colonne', text: 'Su computer, `Colonne` permette di mostrare o nascondere colonne (es. Email e Telefono nei contatti sono nascoste all’inizio).' },
              { label: 'Aprire una riga', text: 'Clicca la riga. Tenendo premuto {{⌘}} (su Windows {{Ctrl}}) si apre in una nuova scheda.' },
              { label: 'Pagine', text: 'In fondo: quanti elementi vedi (es. “1–20 di 54”), le frecce per cambiare pagina e quante righe mostrare.' },
            ],
          },
        ],
      },
      {
        id: 'selezione',
        title: 'Azioni su più righe insieme',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Spunta la casella a sinistra delle righe che ti interessano.', text: 'La casella in cima seleziona tutte le righe della pagina.' },
              { title: 'Compare una barra con le azioni disponibili.', text: 'Ad esempio `Cambia stato` nei contatti e negli ordini, `Pubblica` / `Nascondi` nei prodotti, `Elimina` dove previsto.' },
              { title: 'Scegli l’azione: le eliminazioni e gli annullamenti chiedono conferma.', text: '`Deseleziona` toglie la selezione.' },
            ],
          },
        ],
      },
      {
        id: 'export',
        title: 'Esportare in Excel',
        blocks: [
          {
            type: 'p',
            text: '`Esporta` scarica un file che si apre direttamente con Excel. Contiene **le righe selezionate** oppure, se non ne hai selezionate, **tutte quelle che corrispondono a ricerca e filtri** — anche quelle nelle altre pagine.',
          },
          { type: 'callout', tone: 'tip', text: 'Esempio: filtra i contatti per `Stato: Cliente` e premi `Esporta` per avere l’elenco dei clienti in Excel.' },
          { type: 'demo', demo: 'table' },
        ],
      },
      {
        id: 'telefono',
        title: 'Su telefono',
        blocks: [
          { type: 'p', text: 'Su schermi piccoli le tabelle diventano **schede**: ricerca, filtri, selezione ed esportazione funzionano allo stesso modo.' },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('contatti', {
    summary: 'La rubrica di famiglie, clienti, aziende e fornitori: schede complete, cronologia, chiamate e WhatsApp con un tocco.',
    readingMinutes: 7,
    keywords: 'crm clienti rubrica scheda famiglia azienda fornitore tag etichette',
    sections: [
      {
        id: 'elenco',
        title: 'L’elenco dei contatti',
        blocks: [
          {
            type: 'p',
            text: 'In [Contatti](/admin/clienti) trovi tutte le persone e le aziende con cui siete in contatto. In alto quattro numeri: `Contatti totali`, `Clienti`, `In trattativa` (contattati o con preventivo) e `Nuovi (30 giorni)`.',
          },
          {
            type: 'list',
            items: [
              'Cerca per nome, email, telefono, etichetta, codice fiscale o partita IVA.',
              'Filtra per `Stato` (fase della trattativa), `Tipo` (privato o azienda) e `Fonte` (come vi ha conosciuto).',
              'Le colonne `Ordini` e `Speso` mostrano quanti ordini ha fatto e quanto ha speso nel negozio online (solo ordini pagati, spediti o consegnati).',
              '`Ultima attività` indica quando avete avuto l’ultimo contatto registrato.',
            ],
          },
          {
            type: 'callout',
            tone: 'auto',
            text: 'Quando qualcuno ordina dal negozio online **viene aggiunto da solo** ai contatti (o aggiornato, se esiste già con la stessa email), con fase **Cliente** e provenienza **Negozio online**. Non serve ricopiare nulla.',
          },
        ],
      },
      {
        id: 'nuovo',
        title: 'Aggiungere un contatto',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Clicca `Nuovo contatto`.' },
              { title: 'Scegli `Privato` o `Azienda`.', text: 'Per un’azienda compaiono `Ragione sociale` e `Partita IVA`, e il nome diventa il `Referente`.' },
              { title: 'Compila almeno un dato tra nome, email e telefono.', text: 'Gli altri campi sono facoltativi: puoi completarli in seguito.' },
              { title: 'In `Classificazione` imposta la fase, come vi ha conosciuto e le etichette.' },
              { title: 'Premi `Crea contatto`: si apre subito la sua scheda.' },
            ],
          },
          {
            type: 'fields',
            title: 'I campi',
            items: [
              { label: 'Codice fiscale', text: 'Viene salvato in maiuscolo automaticamente.' },
              { label: 'Email', text: 'Deve essere corretta ed è **unica**: due contatti non possono avere la stessa email (se compare “Esiste già un contatto con questa email”, cercalo con la ricerca rapida).' },
              { label: 'Provincia', text: 'Sigla di 2 lettere, es. NA.' },
              { label: 'Stato', text: 'La fase della trattativa: Nuovo, Contattato, Preventivo, Cliente, Non interessato. Vedi [Pipeline](/admin/guida/pipeline).' },
              { label: 'Come ci ha conosciuto', text: 'Negozio online, Sito web, Telefono, Passaparola, Social, In sede, Altro. Utile per capire da dove arrivano i clienti.' },
              { label: 'Etichette', text: 'Parole libere per raggruppare i contatti (es. “previdenza”, “fornitore”, “ricorrenza”). Scrivi e premi {{Invio}} o la virgola; la × toglie un’etichetta.' },
              { label: 'Note', text: 'Informazioni utili e fisse (preferenze, ricorrenze, persone di riferimento). Per gli eventi con una data usa invece le **attività**.' },
            ],
          },
        ],
      },
      {
        id: 'scheda',
        title: 'La scheda del contatto',
        blocks: [
          {
            type: 'list',
            items: [
              '**In alto**: nome, fase, tipo, provenienza ed etichette, con i pulsanti `Chiama`, `WhatsApp` e `Email` (compaiono se il numero o l’email sono presenti). `WhatsApp` aggiunge da solo il prefisso +39.',
              '**Stato**: il menu a tendina cambia la fase al volo.',
              '**I numeri**: `Ordini`, `Totale speso`, `Ultimo ordine`, `In rubrica dal`.',
              '**Scheda Attività**: la cronologia di tutto quello che è successo e il riquadro per registrare una nuova attività o un promemoria (vedi [Attività e promemoria](/admin/guida/attivita)).',
              '**Scheda Ordini**: gli ordini del negozio di questo contatto; clicca il numero per aprirlo.',
              '**Dettagli**: tutti i dati anagrafici e le note (su schermi larghi sono nel riquadro a destra).',
            ],
          },
        ],
      },
      {
        id: 'modificare',
        title: 'Modificare o eliminare',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Dalla scheda premi `Modifica`, cambia i dati e premi `Salva modifiche`.' },
              { title: 'Per eliminare usa il pulsante `⋯` → `Elimina contatto` e conferma.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Eliminando un contatto si cancellano anche **le sue note e i suoi promemoria**. Gli ordini restano nello storico degli ordini. L’operazione non si può annullare.',
          },
          {
            type: 'p',
            text: 'Dall’elenco puoi anche selezionare più contatti e usare `Cambia stato` (per spostarli tutti in una fase) o `Elimina`.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('pipeline', {
    summary: 'Le trattative a colpo d’occhio: ogni contatto è una scheda da spostare tra le fasi, dal primo contatto all’acquisto.',
    readingMinutes: 3,
    keywords: 'trattative kanban fasi preventivo colonne',
    sections: [
      {
        id: 'fasi',
        title: 'Le cinque fasi',
        blocks: [
          {
            type: 'p',
            text: 'La [Pipeline](/admin/pipeline) mostra i contatti divisi in colonne, una per fase. Così vedete subito chi va richiamato e chi aspetta un preventivo.',
          },
          {
            type: 'fields',
            items: [
              { label: 'Nuovo', text: 'Contatto appena acquisito: non l’avete ancora sentito.' },
              { label: 'Contattato', text: 'C’è stato un primo contatto (telefonata, incontro, email).' },
              { label: 'Preventivo', text: 'Avete inviato un preventivo e siete in attesa di risposta.' },
              { label: 'Cliente', text: 'Ha scelto un vostro servizio o ha acquistato. Chi ordina dal negozio online diventa Cliente in automatico.' },
              { label: 'Non interessato', text: 'La trattativa si è chiusa senza esito. Resta in rubrica.' },
            ],
          },
        ],
      },
      {
        id: 'spostare',
        title: 'Spostare un contatto',
        blocks: [
          {
            type: 'list',
            items: [
              '**Su computer**: trascina la scheda nella colonna giusta.',
              '**Su telefono e tablet**: tocca `⋯` sulla scheda e scegli `Sposta in…`. Le colonne si scorrono di lato.',
              'Clicca sul nome per aprire la scheda completa del contatto.',
              '`Filtra contatti…` in alto mostra solo le schede che contengono quello che scrivi (nome, azienda, email, telefono, etichette).',
            ],
          },
          { type: 'demo', demo: 'pipeline' },
          {
            type: 'callout',
            tone: 'tip',
            text: 'Quando sposti un contatto in `Preventivo`, registra anche un **promemoria** per ricordarti di richiamarlo: lo trovi poi in [Attività](/admin/attivita) e nella Dashboard.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('attivita', {
    summary: 'Chiamate, incontri, preventivi e note, con promemoria che vi ricordano cosa fare e quando.',
    readingMinutes: 5,
    keywords: 'promemoria scadenze richiamare note chiamata cronologia',
    sections: [
      {
        id: 'cosa-sono',
        title: 'Attività e promemoria',
        blocks: [
          {
            type: 'p',
            text: 'Un’**attività** è qualcosa che è successo con un contatto (una chiamata, un incontro, un preventivo, una nota). Un **promemoria** è un’attività con una **data e un’ora**: il gestionale ve la ricorda finché non la segnate come fatta.',
          },
          {
            type: 'callout',
            tone: 'auto',
            text: 'Alcune voci si scrivono da sole nella cronologia: **Ordine #N ricevuto** quando arriva un ordine, e un **Aggiornamento** ogni volta che cambia lo stato dell’ordine (con il codice di tracking quando viene spedito). Queste voci non si possono eliminare.',
          },
        ],
      },
      {
        id: 'registrare',
        title: 'Registrare un’attività o un promemoria',
        blocks: [
          {
            type: 'steps',
            title: 'Dalla scheda del contatto (scheda Attività):',
            items: [
              { title: 'Scegli il `Tipo`: Nota, Chiamata, Email, WhatsApp, Incontro o Preventivo.' },
              { title: 'Scrivi un `Titolo` (es. “Chiamata per il preventivo”) e, se vuoi, i `Dettagli`.' },
              { title: 'Per un promemoria spunta `Imposta un promemoria` e scegli giorno e ora.', text: 'La data è obbligatoria per i promemoria.' },
              { title: 'Premi `Registra attività` (o `Aggiungi promemoria`).' },
            ],
          },
          {
            type: 'p',
            text: 'Puoi farlo anche dalla pagina [Attività](/admin/attivita) con `Nuova attività`: prima scegli il contatto (cercandolo per nome, email o telefono), poi compili lo stesso modulo. Se il contatto non esiste ancora, `Creane uno`.',
          },
        ],
      },
      {
        id: 'scadenze',
        title: 'Scadenze e numero rosso',
        blocks: [
          { type: 'demo', demo: 'reminders' },
          {
            type: 'list',
            items: [
              'Il **numero rosso** accanto ad `Attività` nel menu conta i promemoria **scaduti o in scadenza oggi** non ancora fatti.',
              'Quando hai fatto la cosa, **spunta la casella** accanto al promemoria: diventa barrato e il numero scende. Se ti sei sbagliato, ricliccala per riaprirlo.',
              'Le attività scritte a mano si eliminano con `⋯` → `Elimina`.',
            ],
          },
        ],
      },
      {
        id: 'pagina',
        title: 'La pagina Attività',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: 'Da fare', text: 'Tutti i promemoria non ancora fatti, compresi gli scaduti.' },
              { label: 'Scadute', text: 'Solo quelli con la data già passata: da recuperare per primi.' },
              { label: 'Oggi', text: 'Quelli in scadenza oggi.' },
              { label: 'Prossimi 7 giorni', text: 'Cosa vi aspetta in settimana.' },
              { label: 'Completate', text: 'I promemoria già fatti.' },
              { label: 'Tutte', text: 'Tutta la cronologia: anche le note senza data e le voci automatiche degli ordini.' },
            ],
          },
          { type: 'p', text: 'Le voci sono raggruppate per giorno (Oggi, Domani, Ieri…) e ognuna porta al contatto a cui si riferisce.' },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('ordini', {
    summary: 'Dal momento in cui il cliente ordina sul sito fino alla consegna: stati, tracking, distinta di spedizione e cosa succede in automatico.',
    readingMinutes: 7,
    keywords: 'vendite stato tracking spedire distinta stampa pagamento annullare',
    sections: [
      {
        id: 'viaggio',
        title: 'Il viaggio di un ordine',
        blocks: [
          { type: 'demo', demo: 'order-flow' },
          {
            type: 'callout',
            tone: 'info',
            title: 'Pagamenti online',
            text: 'Finché il pagamento con carta sul sito non è attivo, gli ordini arrivano **In attesa** e il cliente legge che lo ricontatterete. Contattatelo per confermare e concordare il pagamento, poi portate l’ordine su **Pagato**.',
          },
        ],
      },
      {
        id: 'elenco',
        title: 'L’elenco degli ordini',
        blocks: [
          {
            type: 'list',
            items: [
              'In alto: `Da gestire` (in attesa o pagati), `In attesa di pagamento`, `In consegna` (spediti) e `Incassato`.',
              'Cerca per **numero** (es. 12 o #12), nome del cliente o email; filtra per `Stato`.',
              'Il nome del cliente porta alla sua scheda nei [Contatti](/admin/clienti).',
              'Seleziona più ordini e usa `Cambia stato` per segnarli tutti insieme come pagati, spediti o consegnati. `Annulla ordini` chiede conferma.',
            ],
          },
        ],
      },
      {
        id: 'gestire',
        title: 'Gestire un ordine',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Apri l’ordine dall’elenco.', text: 'In alto vedi i passaggi Ricevuto → Pagato → Spedito → Consegnato, con quelli già fatti spuntati.' },
              { title: 'Controlla `Articoli`, `Indirizzo di spedizione` ed eventuale `Nota del cliente`.' },
              { title: 'Nel riquadro `Gestisci ordine` scegli il nuovo `Stato dell’ordine`.' },
              { title: 'Quando spedisci, inserisci il `Codice di tracciamento` del corriere.', text: 'Insieme allo stato “Spedito”, il codice viene annotato anche nella cronologia del cliente.' },
              { title: 'Premi `Salva modifiche`.' },
            ],
          },
          {
            type: 'list',
            title: 'Altri riquadri',
            items: [
              '`Cliente`: email e telefono cliccabili e `Apri scheda cliente`.',
              '`Pagamento`: il riferimento del pagamento online, quando presente.',
            ],
          },
        ],
      },
      {
        id: 'stampa',
        title: 'Stampare la distinta',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Nell’ordine premi `Stampa distinta`.' },
              { title: 'Controlla l’anteprima: destinatario, articoli, totali, tracking e nota del cliente.' },
              { title: 'Premi `Stampa` e mettila nel pacco.', text: 'In stampa compare solo il documento, senza menu né pulsanti.' },
            ],
          },
          { type: 'callout', tone: 'tip', text: 'Nome, telefono ed email in testa alla distinta vengono da [Dati attività](/admin/impostazioni): tienili aggiornati.' },
        ],
      },
      {
        id: 'automatico',
        title: 'Cosa succede in automatico',
        blocks: [
          {
            type: 'list',
            items: [
              'Ogni nuovo ordine **crea o aggiorna il cliente** nei Contatti (riconosciuto dall’email) e lo porta nella fase **Cliente**.',
              'Nella cronologia del cliente compare **Ordine #N ricevuto**, e poi una voce a ogni cambio di stato.',
              'Il **numero rosso** accanto a `Ordini` conta gli ordini in attesa o pagati.',
              'Con il pagamento con carta attivo, un ordine pagato online diventa **Pagato** da solo e le **scorte scendono** automaticamente.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Magazzino e annullamenti',
            text: 'Se segni un ordine come **Pagato a mano**, le scorte **non** scendono: aggiorna i `Pezzi disponibili` del prodotto. Allo stesso modo **Annullato** e **Rimborsato** sono solo etichette: non rimettono i pezzi in magazzino e non restituiscono il denaro, che va gestito a parte.',
          },
        ],
      },
      {
        id: 'stati',
        title: 'Significato dei colori',
        blocks: [{ type: 'demo', demo: 'glossary' }],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('prodotti', {
    summary: 'Creare e modificare i prodotti del negozio: titolo, descrizione, foto, prezzo, magazzino e visibilità.',
    readingMinutes: 6,
    keywords: 'catalogo articoli foto immagini prezzo magazzino giacenza visibile nascosto',
    sections: [
      {
        id: 'elenco',
        title: 'L’elenco dei prodotti',
        blocks: [
          {
            type: 'list',
            items: [
              'In alto: `Prodotti`, `Visibili nel negozio`, `Scorte basse` (3 pezzi o meno) e `Valore magazzino` (prezzo × pezzi).',
              'L’interruttore `Nel negozio` **pubblica o nasconde** il prodotto al volo, senza aprirlo.',
              'Filtri: `Categoria`, `Stato` (visibile o nascosto) e `Disponibilità` (disponibile, in esaurimento, esaurito).',
              'Selezionando più prodotti puoi `Pubblica`, `Nascondi` o `Elimina` tutti insieme.',
            ],
          },
        ],
      },
      {
        id: 'nuovo',
        title: 'Creare un prodotto',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Clicca `Nuovo prodotto`.' },
              { title: 'Scrivi `Titolo` e `Descrizione`.', text: 'Nella descrizione indica materiali, dimensioni, finiture e cosa include (massimo 2000 caratteri).' },
              { title: 'Aggiungi le foto trascinandole nel riquadro `Immagini` o con `sfoglia`.' },
              { title: 'Imposta `Prezzo di vendita`, `Pezzi disponibili` e la `Categoria`.' },
              { title: 'Lascia acceso `Visibile nel negozio` se deve essere subito in vendita, poi premi `Crea prodotto`.' },
            ],
          },
          { type: 'demo', demo: 'price' },
          {
            type: 'callout',
            tone: 'info',
            text: 'L’indirizzo della pagina del prodotto sul sito (es. /negozio/urna-marmo) viene creato dal titolo **al momento della creazione** e poi non cambia, anche se modifichi il titolo: così i link già condivisi continuano a funzionare.',
          },
        ],
      },
      {
        id: 'foto',
        title: 'Le foto',
        blocks: [
          {
            type: 'list',
            items: [
              'Formati: **JPG, PNG o WEBP**, fino a **10 MB** ciascuna. Puoi caricarne più di una insieme.',
              'La **prima foto è la copertina**: è quella che si vede nel negozio. Ha l’etichetta `Copertina`.',
              'Su ogni foto (al passaggio del mouse; su telefono sono sempre visibili): frecce per **spostarla**, la **stella** per farla diventare copertina, il **cestino** per eliminarla.',
              'Su un prodotto già salvato le modifiche alle foto valgono **subito**; su un prodotto nuovo vengono caricate quando premi `Crea prodotto`.',
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Foto che vendono',
            text: 'Sfondo chiaro e uniforme, buona luce naturale, il prodotto intero e centrato, almeno 2–3 angolazioni. Le foto fatte con il telefono vanno benissimo: se sono in formato HEIC (iPhone), impostate la fotocamera su “Più compatibile” per ottenere JPG.',
          },
        ],
      },
      {
        id: 'magazzino',
        title: 'Prezzo, magazzino e visibilità',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: 'Prezzo di vendita', text: 'IVA inclusa. Puoi scrivere 12,50 oppure 12.50.' },
              { label: 'Pezzi disponibili', text: 'Con **0 pezzi** il negozio mostra “Non disponibile” e il prodotto non si può acquistare; con **1–3 pezzi** mostra “Ultimi N pezzi”. Il cliente non può ordinarne più di quanti ce ne sono.' },
              { label: 'Peso (g)', text: 'Facoltativo, utile per le spedizioni.' },
              { label: 'Visibile nel negozio', text: 'Spento = **bozza**: il prodotto resta salvato ma sparisce da elenco, ricerca e pagina del negozio.' },
              { label: 'Categoria', text: 'Dove compare nel negozio. Le categorie si gestiscono in [Categorie](/admin/categorie).' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '`Elimina prodotto` (in fondo alla pagina del prodotto) lo cancella **definitivamente insieme alle foto**. Gli ordini già ricevuti non cambiano. Se vuoi solo toglierlo dalla vendita, **nascondilo** invece di eliminarlo.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('categorie', {
    summary: 'Organizzare il catalogo in gruppi principali e sottocategorie, e scegliere cosa mostrare nel negozio.',
    readingMinutes: 3,
    keywords: 'catalogo gruppi sottocategorie ordine posizione',
    sections: [
      {
        id: 'struttura',
        title: 'Gruppi e sottocategorie',
        blocks: [
          {
            type: 'p',
            text: 'Le categorie hanno **due livelli**: gruppi principali (es. “Urne”) e sottocategorie (es. “Urne in marmo”). Accanto a ogni categoria vedi quanti prodotti contiene — per un gruppo principale sono inclusi quelli delle sue sottocategorie.',
          },
          {
            type: 'steps',
            title: 'Creare una categoria',
            items: [
              { title: 'Clicca `Nuova categoria` (oppure `⋯` → `Aggiungi sottocategoria` su un gruppo).' },
              { title: 'Scrivi il `Nome` e, se vuoi, una `Descrizione` mostrata nel negozio.' },
              { title: 'In `Gruppo principale` scegli “Nessuno” per creare un gruppo, oppure il gruppo a cui appartiene.' },
              { title: '`Posizione` decide l’ordine: numero più basso = più in alto.' },
            ],
          },
        ],
      },
      {
        id: 'visibilita',
        title: 'Mostrare o nascondere',
        blocks: [
          {
            type: 'p',
            text: 'L’interruttore `Nel negozio` nasconde una categoria: sparisce dal menu del negozio **insieme ai suoi prodotti**. Utile, ad esempio, per prodotti stagionali.',
          },
        ],
      },
      {
        id: 'eliminare',
        title: 'Eliminare',
        blocks: [
          {
            type: 'list',
            items: [
              'Una categoria con **sottocategorie** non si può eliminare: prima spostale o eliminale.',
              'Eliminando una categoria **i prodotti non vengono cancellati**: restano “senza categoria” e puoi riassegnarli.',
            ],
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('spedizioni', {
    summary: 'Quanto costa la spedizione e da quale importo diventa gratuita, con l’anteprima di cosa vede il cliente.',
    readingMinutes: 2,
    keywords: 'costo consegna gratuita soglia corriere',
    sections: [
      {
        id: 'impostare',
        title: 'Impostare i costi',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: 'Spedizione a pagamento', text: 'Acceso: il costo viene aggiunto al totale. Spento: la spedizione è **sempre gratuita**.' },
              { label: 'Costo di spedizione', text: 'Una tariffa fissa per ordine (es. 7,00 €).' },
              { label: 'Gratuita a partire da', text: 'Se il **totale dei prodotti** (spedizione esclusa) raggiunge questa cifra, la spedizione è gratuita. Metti 0 per non offrirla mai.' },
            ],
          },
          {
            type: 'p',
            text: 'Il riquadro **Anteprima** mostra esempi di ordini e quanto pagherebbe il cliente. Premi `Salva impostazioni`: le modifiche valgono **subito** per i nuovi ordini, nel carrello e al checkout.',
          },
          {
            type: 'callout',
            tone: 'tip',
            text: 'Nel carrello il cliente vede anche quanto manca per la spedizione gratuita: una soglia ragionevole invoglia ad aggiungere un articolo.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('statistiche', {
    summary: 'Quante persone visitano il sito, da dove arrivano, cosa guardano e con quale dispositivo.',
    readingMinutes: 3,
    keywords: 'visite traffico analytics provenienza google paesi dispositivi campagne utm',
    sections: [
      {
        id: 'leggere',
        title: 'Come leggere i dati',
        blocks: [
          {
            type: 'p',
            text: 'Scegli il periodo in alto: `7 giorni`, `30 giorni` o `90 giorni`. I numeri in alto riassumono visite totali, visite di oggi, media giornaliera e quante pagine diverse sono state viste; il grafico mostra l’andamento giorno per giorno.',
          },
          {
            type: 'fields',
            items: [
              { label: 'Da dove arrivano', text: 'I siti da cui arrivano i visitatori (es. Google, Facebook). “Accesso diretto” = hanno scritto l’indirizzo o usato un preferito.' },
              { label: 'Pagine più viste', text: 'Le pagine del sito più visitate.' },
              { label: 'Campagne', text: 'Visite arrivate da link “tracciati” usati in pubblicità o newsletter.' },
              { label: 'Paesi', text: 'Da quale Paese si collegano.' },
              { label: 'Dispositivi', text: 'Computer, smartphone o tablet.' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Le visite sono contate in modo **anonimo e senza cookie**: non si sa chi è il visitatore. Le visite fatte dal gestionale non vengono contate.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('testi-legali', {
    summary: 'Modificare Privacy Policy e Cookie Policy pubblicate sul sito, con anteprima dal vivo.',
    readingMinutes: 4,
    keywords: 'privacy cookie gdpr informativa testo legale',
    sections: [
      {
        id: 'modificare',
        title: 'Modificare il testo',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Apri `Privacy Policy` o `Cookie Policy` dal menu, sezione Contenuti.', text: 'L’editor contiene **il testo attualmente pubblicato**: modifichi quello, non un foglio bianco.' },
              { title: 'Scrivi a sinistra e controlla a destra l’`Anteprima`, che mostra come apparirà sul sito.', text: 'Su telefono passa da `Modifica` ad `Anteprima` con le due linguette.' },
              { title: 'Premi `Salva e pubblica`: la pagina del sito si aggiorna subito.' },
            ],
          },
          {
            type: 'list',
            items: [
              'In alto l’etichetta dice se il testo è `Testo personalizzato` o `Testo predefinito`, con la data dell’ultimo aggiornamento (visibile anche sul sito).',
              '`Modifiche non salvate` ti avvisa se hai cambiato qualcosa senza salvare; `Annulla` torna all’ultima versione salvata.',
              '`Ripristina testo predefinito` cancella il testo personalizzato e rimette quello originale.',
              '`Vedi pagina pubblica` apre la pagina sul sito.',
            ],
          },
        ],
      },
      {
        id: 'formattare',
        title: 'Titoli, elenchi, grassetto e link',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: '## Titolo', text: 'Una riga che inizia con due cancelletti e uno spazio diventa un **titolo di sezione**.' },
              { label: '### Sottotitolo', text: 'Tre cancelletti = sottotitolo.' },
              { label: '- punto', text: 'Le righe che iniziano con trattino e spazio formano un **elenco puntato**.' },
              { label: '**testo**', text: 'Due asterischi prima e dopo = grassetto.' },
              { label: '[testo](indirizzo)', text: 'Un link. L’indirizzo deve iniziare con https://, mailto: (email) o tel: (telefono).' },
              { label: 'Riga vuota', text: 'Separa i paragrafi.' },
            ],
          },
          { type: 'p', text: 'I pulsanti sopra l’editor inseriscono questi elementi per te. Prova qui sotto, senza rischi:' },
          { type: 'demo', demo: 'legal-editor' },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Sono testi legali: fate verificare le modifiche importanti a un consulente. Non sono supportati corsivo, sottolineato, immagini ed elenchi numerati.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('documenti', {
    summary: 'Caricare informative, moduli, cataloghi e listini, e decidere quali mostrare nella pagina pubblica del sito.',
    readingMinutes: 3,
    keywords: 'file pdf allegati moduli scaricare pubblico interno',
    sections: [
      {
        id: 'caricare',
        title: 'Caricare un documento',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Clicca `Carica documento`.' },
              { title: 'Trascina il file nel riquadro o cliccalo per sceglierlo.', text: 'PDF, Word, immagini o fogli di calcolo, fino a 25 MB. Un file alla volta.' },
              { title: 'Controlla il `Titolo` (viene proposto dal nome del file), scegli il `Tipo` e aggiungi una `Descrizione` se serve.' },
              { title: 'Scegli la `Visibilità`: `Visibile sul sito` oppure `Solo uso interno`.' },
              { title: 'Premi `Carica`.' },
            ],
          },
        ],
      },
      {
        id: 'sito',
        title: 'Cosa compare sul sito',
        blocks: [
          {
            type: 'list',
            items: [
              'I documenti **visibili sul sito** compaiono nella pagina pubblica **Documenti** (link nel piè di pagina del sito), raggruppati per tipo, e in fondo alla Privacy Policy.',
              'L’interruttore `Sul sito` nell’elenco li pubblica o li ritira **all’istante**.',
              'I documenti **Solo uso interno** restano consultabili solo dal gestionale.',
            ],
          },
          {
            type: 'fields',
            title: 'Azioni su ogni documento',
            items: [
              { label: 'Apri o scarica', text: 'Apre il file.' },
              { label: 'Copia link', text: 'Copia l’indirizzo del documento pubblico, da incollare in un’email o su WhatsApp.' },
              { label: 'Modifica', text: 'Cambia titolo, tipo, visibilità e descrizione. Per sostituire il file, caricane uno nuovo ed elimina il vecchio.' },
              { label: 'Elimina', text: 'Lo cancella definitivamente, anche dal sito.' },
            ],
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('dati-attivita', {
    summary: 'Nome, recapiti, sede e dati fiscali dell’impresa.',
    readingMinutes: 1,
    keywords: 'azienda impresa partita iva pec indirizzo telefono email',
    sections: [
      {
        id: 'campi',
        title: 'Cosa inserire',
        blocks: [
          {
            type: 'fields',
            items: [
              { label: 'Attività', text: 'Nome dell’attività (obbligatorio) e sito web.' },
              { label: 'Contatti', text: 'Email, telefono e PEC.' },
              { label: 'Sede', text: 'Indirizzo, città, CAP e provincia.' },
              { label: 'Dati fiscali', text: 'Partita IVA e codice fiscale.' },
            ],
          },
          {
            type: 'p',
            text: 'Premi `Salva modifiche`. Nome, telefono ed email compaiono nella **distinta di spedizione** degli ordini: tenerli aggiornati evita errori.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('utenti', {
    summary: 'Dare l’accesso ai collaboratori, togliere l’accesso e cambiare la propria password.',
    readingMinutes: 3,
    keywords: 'amministratori collaboratori password accesso account sicurezza',
    sections: [
      {
        id: 'aggiungere',
        title: 'Aggiungere un collaboratore',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Vai in [Utenti e accesso](/admin/impostazioni/utenti) e clicca `Aggiungi amministratore`.' },
              { title: 'Inserisci l’`Email` del collaboratore e una `Password` di almeno 8 caratteri, ripetuta in `Conferma password`.' },
              { title: 'Premi `Aggiungi`: la persona può entrare subito.' },
              { title: 'Comunica le credenziali **di persona** e chiedile di cambiare la password al primo accesso.' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Ogni amministratore ha **accesso completo** al gestionale. Date a ciascuno il proprio accesso: nella cronologia dei contatti resta traccia di chi ha fatto cosa.',
          },
        ],
      },
      {
        id: 'rimuovere',
        title: 'Togliere l’accesso',
        blocks: [
          {
            type: 'p',
            text: 'Clicca il cestino accanto alla persona e conferma `Rimuovi accesso`: non potrà più entrare e il suo account viene eliminato. Non puoi rimuovere te stesso e deve sempre restare almeno un amministratore.',
          },
        ],
      },
      {
        id: 'password',
        title: 'Cambiare la propria password',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Dal cerchio con le tue iniziali scegli `Account e password` (o vai in Utenti e accesso).' },
              { title: 'Nel riquadro `La tua password` scrivi la nuova password due volte.' },
              { title: 'Premi `Aggiorna password`.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Password dimenticata?',
            text: 'Chiedi a un altro amministratore: può toglierti e ridarti l’accesso con una password nuova. Non comunicate mai le password per email o messaggio.',
          },
        ],
      },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────
  topic('domande', {
    summary: 'Le risposte rapide ai dubbi più comuni e cosa fare quando qualcosa non va.',
    readingMinutes: 4,
    keywords: 'faq problemi aiuto errore non funziona',
    sections: [
      {
        id: 'faq',
        title: 'Domande frequenti',
        blocks: [
          {
            type: 'faq',
            items: [
              {
                q: 'Un cliente ha ordinato: devo inserirlo nei contatti?',
                a: 'No, viene aggiunto (o aggiornato) da solo, con l’ordine nella sua cronologia. Puoi completare la sua scheda con note ed etichette.',
              },
              {
                q: 'Come trovo velocemente un ordine?',
                a: 'Premi {{⌘+K}} (su Windows {{Ctrl+K}}) e scrivi il numero con il cancelletto, es. #12.',
              },
              {
                q: 'Ho segnato un ordine come pagato: perché il magazzino non è sceso?',
                a: 'Le scorte scendono da sole solo con il pagamento con carta sul sito. Se lo segni tu, aggiorna i `Pezzi disponibili` del prodotto.',
              },
              {
                q: 'Voglio togliere un prodotto dalla vendita senza perderlo.',
                a: 'Spegni l’interruttore `Nel negozio` (o `Visibile nel negozio` nella sua pagina): resta salvato come bozza e puoi ripubblicarlo quando vuoi.',
              },
              {
                q: 'Ho modificato la Privacy Policy: quando si aggiorna il sito?',
                a: 'Subito, appena premi `Salva e pubblica`. Se non lo vedi, ricarica la pagina del sito.',
              },
              {
                q: 'Posso usare il gestionale dal telefono?',
                a: 'Sì, funziona su telefono e tablet: il menu si apre con l’icona a tre righe in alto a sinistra.',
              },
              {
                q: 'Un collaboratore ha dimenticato la password.',
                a: 'In [Utenti e accesso](/admin/impostazioni/utenti) togli il suo accesso e aggiungilo di nuovo con una password provvisoria, poi chiedigli di cambiarla.',
              },
              {
                q: 'Cosa vuol dire “Non interessato”?',
                a: 'È la fase delle trattative chiuse senza esito. Il contatto resta in rubrica; se in futuro ordina, torna Cliente da solo.',
              },
              {
                q: 'Il tema scuro: come lo tolgo?',
                a: 'Clicca l’icona sole/luna nella barra in alto. La scelta viene ricordata su quel dispositivo.',
              },
            ],
          },
        ],
      },
      {
        id: 'problemi',
        title: 'Se qualcosa non funziona',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Leggi il messaggio rosso in basso a destra: di solito dice cosa correggere.' },
              { title: 'Ricarica la pagina (su computer {{⌘+R}} o {{F5}}).' },
              { title: 'Controlla la connessione internet.' },
              { title: 'Esci e rientra: se la sessione è scaduta, l’accesso si rinnova.' },
              { title: 'Se il problema resta, annota pagina, ora e messaggio comparso e segnalalo a chi gestisce il sito.' },
            ],
          },
        ],
      },
      {
        id: 'glossario',
        title: 'Glossario dei colori',
        blocks: [{ type: 'demo', demo: 'glossary' }],
      },
    ],
  }),
];
