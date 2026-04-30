import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Codice Etico — Onoranze Funebri Coppola',
  description: 'Il codice etico che guida ogni nostra azione: rispetto, dignità, professionalità, discrezione.',
};

export default function CodiceEtico() {
  return (
    <LegalLayout
      title="Codice Etico"
      subtitle="L'etica professionale è il pilastro della nostra attività. Tutelare il dolente e permettergli di onorare i propri cari nel modo più sereno possibile è il nostro impegno quotidiano."
    >
      <h2>Valore fondamentale</h2>
      <p>
        L&apos;etica professionale è il pilastro dell&apos;attività delle Onoranze
        Funebre Coppola. L&apos;obiettivo è tutelare il dolente e permettergli
        di onorare i defunti nella maniera più serena possibile, con rispetto,
        dignità e discrezione.
      </p>

      <h2>Principi guida</h2>

      <h3>Soluzioni congrue</h3>
      <p>
        L&apos;azienda non propone servizi senza prima aver compreso le
        necessità e i desideri dei familiari, interpretando le loro volontà in
        un momento spesso contraddistinto da debolezza, confusione e fragilità.
        Ogni proposta è calibrata sulle reali esigenze, mai sul profitto.
      </p>

      <h3>Qualità</h3>
      <p>
        Offriamo il massimo grado di qualità in relazione alle determinate
        esigenze, necessità e possibilità di ciascuna famiglia, garantendo
        coerenza, integrità e trasparenza in ogni passaggio del servizio.
      </p>

      <h3>Assistenza</h3>
      <p>
        Forniamo supporto con discrezione e sensibilità, risolvendo problemi
        senza crearne altri, mantenendo uno staff preparato e discretamente
        presente in ogni momento del percorso.
      </p>

      <h3>Identità</h3>
      <p>
        Proteggiamo l&apos;identità culturale, religiosa ed etnica di ogni
        famiglia, rispettando la privacy e consentendo diverse forme di
        commemorazione all&apos;interno delle nostre strutture, in piena libertà
        e dignità.
      </p>

      <h3>Comportamenti dello staff</h3>
      <p>
        Il personale agisce con comprensione, umanità e rispetto della dignità
        del defunto, utilizzando linguaggio e atteggiamenti appropriati,
        ascoltando e rassicurando senza mai mostrare indifferenza. La
        formazione continua è un nostro impegno costante.
      </p>

      <h3>Trasparenza economica</h3>
      <p>
        Ogni preventivo è chiaro, dettagliato e privo di costi nascosti. La
        famiglia ha sempre piena consapevolezza di cosa sta scegliendo e
        quanto costa, senza pressioni commerciali nei momenti più difficili.
      </p>

      <h3>Riservatezza</h3>
      <p>
        Tuteliamo con rigore assoluto le informazioni personali dei nostri
        assistiti, conformemente al GDPR e ai principi deontologici della
        professione. Quanto avviene nelle nostre sale resta nelle nostre sale.
      </p>

      <h3>Non discriminazione</h3>
      <p>
        Garantiamo lo stesso livello di servizio, attenzione e rispetto a tutti
        gli assistiti, senza alcuna distinzione di censo, religione, etnia,
        orientamento o convinzione personale.
      </p>

      <h2>Il nostro impegno</h2>
      <p>
        Questi principi non sono parole su carta: sono il fondamento di ogni
        nostra giornata di lavoro. Da oltre un secolo, quattro generazioni della
        famiglia Coppola li applicano con coerenza, perché crediamo che
        l&apos;ultimo saluto a una persona cara meriti il massimo della nostra
        cura.
      </p>

      <p>
        <em>
          &ldquo;Un servizio esclusivo alla portata di tutti.&rdquo;
        </em>
      </p>
    </LegalLayout>
  );
}
