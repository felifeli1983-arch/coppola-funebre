// Content model for the in-app user guide ("Guida all'uso").
// Text fields support light inline markup rendered by <Rich>:
//   **grassetto**   `Etichetta pulsante`   [testo](/admin/percorso)   ⌘K-style keys via {{⌘K}}

export type DemoKey =
  | 'shell' // live buttons: collapse sidebar, open search
  | 'shortcuts' // keyboard shortcuts table
  | 'order-flow' // clickable order lifecycle
  | 'pipeline' // mini kanban to practise moving a contact
  | 'glossary' // all status badges with meanings
  | 'legal-editor' // live formatting playground for legal texts
  | 'table' // practice data table with fake contacts
  | 'price' // price input playground
  | 'reminders'; // reminder due-state explainer

export type Block =
  | { type: 'p'; text: string }
  | { type: 'steps'; title?: string; items: { title: string; text?: string }[] }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'callout'; tone: 'tip' | 'warning' | 'info' | 'auto'; title?: string; text: string }
  | { type: 'fields'; title?: string; items: { label: string; text: string }[] }
  | { type: 'demo'; demo: DemoKey }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'links'; items: { label: string; href: string }[] };

export type GuideSection = { id: string; title: string; blocks: Block[] };

export type GuideGroup = 'inizio' | 'crm' | 'negozio' | 'contenuti' | 'sistema' | 'aiuto';

export type GuideTopic = {
  id: string;
  title: string;
  group: GuideGroup;
  /** lucide icon name, resolved in the UI */
  icon: string;
  summary: string;
  /** Real admin page this topic documents (for the "Apri la pagina" button). */
  href?: string;
  /** Admin path prefixes for contextual help (longest match wins). */
  paths?: string[];
  readingMinutes: number;
  keywords?: string;
  sections: GuideSection[];
};

export const GROUP_LABEL: Record<GuideGroup, string> = {
  inizio: 'Per iniziare',
  crm: 'Clienti e CRM',
  negozio: 'Negozio online',
  contenuti: 'Sito e contenuti',
  sistema: 'Impostazioni',
  aiuto: 'Aiuto',
};
