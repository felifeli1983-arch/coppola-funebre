import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — Impresa Funebre Coppola',
  description: 'Informativa estesa sull\'utilizzo dei cookie ai sensi del Provvedimento del Garante e del GDPR.',
};

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Informativa estesa sull'utilizzo dei cookie ai sensi del Provvedimento del Garante della Privacy del 10 giugno 2021 e del GDPR."
    >
      <h2>1. Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file di testo che i siti visitati inviano al
        terminale dell&apos;utente, dove vengono memorizzati per essere
        ritrasmessi agli stessi siti alla visita successiva. Permettono di
        ricordare le azioni e preferenze dell&apos;utente per migliorarne
        l&apos;esperienza di navigazione.
      </p>

      <h2>2. Tipologie di cookie utilizzate</h2>

      <h3>Cookie tecnici (sempre attivi)</h3>
      <p>
        Sono cookie strettamente necessari al corretto funzionamento del sito e
        non richiedono il consenso dell&apos;utente. Includono:
      </p>
      <ul>
        <li>Cookie di sessione per la navigazione</li>
        <li>Cookie per la memorizzazione del consenso ai cookie</li>
        <li>Cookie di sicurezza per prevenire frodi</li>
      </ul>

      <h3>Cookie analitici (previo consenso)</h3>
      <p>
        Possono essere utilizzati strumenti di analisi del traffico per
        comprendere come gli utenti utilizzano il sito e migliorarlo. Tali
        cookie raccolgono informazioni in forma aggregata e anonima.
      </p>

      <h3>Cookie di profilazione e marketing (previo consenso)</h3>
      <p>
        Attualmente il sito <strong>non utilizza cookie di profilazione o di
        marketing</strong>. Qualora in futuro venissero introdotti, l&apos;utente
        verrà informato e gli verrà richiesto il consenso esplicito.
      </p>

      <h2>3. Cookie di terze parti</h2>
      <p>
        Il sito può ospitare contenuti di terze parti (es. mappe, video, font web)
        che potrebbero rilasciare cookie autonomi. Si invita l&apos;utente a
        consultare le rispettive informative per maggiori dettagli.
      </p>
      <ul>
        <li>
          <strong>Google Fonts</strong> — utilizziamo i font web di Google.{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>
        </li>
        <li>
          <strong>Vercel</strong> — hosting del sito.{' '}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>
        </li>
      </ul>

      <h2>4. Gestione delle preferenze</h2>
      <p>
        L&apos;utente può modificare in qualsiasi momento le proprie preferenze
        sui cookie:
      </p>
      <ul>
        <li>
          Tramite il banner di consenso che appare al primo accesso al sito
        </li>
        <li>
          Disabilitando i cookie direttamente dalle impostazioni del proprio
          browser
        </li>
        <li>
          Cancellando i cookie già installati tramite le funzioni del browser
        </li>
      </ul>

      <h2>5. Come disabilitare i cookie sul browser</h2>
      <p>Di seguito le guide ufficiali per i browser più diffusi:</p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a>
        </li>
        <li>
          <a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener">Mozilla Firefox</a>
        </li>
        <li>
          <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a>
        </li>
        <li>
          <a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a>
        </li>
      </ul>

      <h2>6. Conseguenze della disabilitazione</h2>
      <p>
        La disabilitazione dei cookie tecnici può comportare il malfunzionamento
        di alcune funzionalità del sito. La disabilitazione dei cookie
        analitici non incide sulla navigazione.
      </p>

      <h2>7. Titolare e contatti</h2>
      <p>
        Il Titolare del trattamento è <strong>Impresa Funebre Coppola</strong>.
        Per qualsiasi richiesta relativa ai cookie:
      </p>
      <ul>
        <li>Email: <a href="mailto:info@eredicoppola.com">info@eredicoppola.com</a></li>
        <li>Telefono: <a href="tel:0815713888">081 571 3888</a></li>
      </ul>

      <p className="text-sm italic">Ultimo aggiornamento: aprile 2026.</p>
    </LegalLayout>
  );
}
