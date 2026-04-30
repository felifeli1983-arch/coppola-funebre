import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Onoranze Funebri Coppola',
  description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR Reg. UE 2016/679.',
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR)."
    >
      <h2>1. Titolare del trattamento</h2>
      <p>
        Il Titolare del trattamento dei dati personali è <strong>Onoranze Funebri
        Coppola</strong>, contattabile ai seguenti recapiti:
      </p>
      <ul>
        <li>Telefono: <a href="tel:0815713888">081 571 3888</a></li>
        <li>Email: <a href="mailto:info@eredicoppola.com">info@eredicoppola.com</a></li>
      </ul>

      <h2>2. Dati raccolti</h2>
      <p>Raccogliamo i seguenti dati personali:</p>
      <ul>
        <li><strong>Dati identificativi</strong>: nome, cognome, codice fiscale</li>
        <li><strong>Dati di contatto</strong>: indirizzo email, numero di telefono, indirizzo postale</li>
        <li><strong>Dati di navigazione</strong>: indirizzo IP, browser, sistema operativo, pagine visitate</li>
        <li><strong>Dati relativi al servizio</strong>: informazioni necessarie per l&apos;esecuzione delle prestazioni funebri richieste</li>
      </ul>

      <h2>3. Finalità del trattamento</h2>
      <p>I dati personali sono trattati per le seguenti finalità:</p>
      <ul>
        <li>Esecuzione del contratto di servizi funebri e adempimenti correlati</li>
        <li>Gestione delle pratiche burocratiche obbligatorie (denunce, certificati, autorizzazioni)</li>
        <li>Risposta a richieste di informazioni o preventivi inviate tramite il modulo di contatto</li>
        <li>Adempimenti di legge in materia fiscale, contabile e sanitaria</li>
        <li>Comunicazioni con consolati e ambasciate per rimpatri internazionali</li>
        <li>Pubblicazione di necrologi e manifesti previo consenso dei familiari</li>
      </ul>

      <h2>4. Base giuridica del trattamento</h2>
      <p>
        Il trattamento dei dati si fonda su: esecuzione di un contratto di cui
        l&apos;interessato è parte (art. 6.1.b GDPR), adempimento di obblighi
        di legge (art. 6.1.c GDPR), consenso esplicito dell&apos;interessato
        per finalità ulteriori (art. 6.1.a GDPR), legittimo interesse del
        Titolare (art. 6.1.f GDPR).
      </p>

      <h2>5. Modalità del trattamento</h2>
      <p>
        I dati personali sono trattati con strumenti manuali, informatici e
        telematici, con logiche strettamente correlate alle finalità sopra
        indicate e in modo da garantire la sicurezza e la riservatezza dei dati
        stessi, nel rispetto del principio di minimizzazione.
      </p>

      <h2>6. Conservazione dei dati</h2>
      <p>
        I dati personali sono conservati per il tempo strettamente necessario al
        conseguimento delle finalità per cui sono raccolti e, in ogni caso, nel
        rispetto dei termini di legge applicabili (in particolare, la normativa
        fiscale che impone la conservazione delle scritture contabili per 10
        anni).
      </p>

      <h2>7. Comunicazione e diffusione</h2>
      <p>I dati possono essere comunicati a:</p>
      <ul>
        <li>Pubbliche autorità (Comuni, ASL, Prefetture, Consolati, Tribunali)</li>
        <li>Fornitori di servizi tecnici (hosting, email, sistemi gestionali)</li>
        <li>Consulenti professionali (commercialisti, legali)</li>
        <li>Compagnie assicurative e istituti di credito quando necessario</li>
      </ul>
      <p>
        I dati non sono oggetto di diffusione né trasferiti a Paesi extra-UE
        salvo specifiche esigenze legate ai rimpatri internazionali, sempre nel
        rispetto delle garanzie previste dal GDPR.
      </p>

      <h2>8. Diritti dell&apos;interessato</h2>
      <p>
        Ai sensi degli artt. 15-22 del GDPR, l&apos;interessato ha diritto di:
      </p>
      <ul>
        <li>Accedere ai propri dati personali</li>
        <li>Richiederne la rettifica o la cancellazione</li>
        <li>Limitarne o opporsi al trattamento</li>
        <li>Ricevere i dati in formato strutturato (portabilità)</li>
        <li>Revocare il consenso prestato in qualsiasi momento</li>
        <li>Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
      </ul>
      <p>
        Per esercitare tali diritti è possibile scrivere all&apos;indirizzo{' '}
        <a href="mailto:info@eredicoppola.com">info@eredicoppola.com</a>.
      </p>

      <h2>9. Modulo di contatto</h2>
      <p>
        I dati raccolti tramite il modulo di contatto presente sul sito sono
        trattati esclusivamente per rispondere alla richiesta inviata e non sono
        utilizzati per finalità di marketing senza un esplicito consenso
        dell&apos;interessato.
      </p>

      <h2>10. Modifiche</h2>
      <p>
        La presente informativa può essere aggiornata in qualsiasi momento. Le
        modifiche verranno pubblicate su questa pagina con indicazione della
        data dell&apos;ultimo aggiornamento.
      </p>

      <p className="text-sm italic">Ultimo aggiornamento: aprile 2026.</p>
    </LegalLayout>
  );
}
