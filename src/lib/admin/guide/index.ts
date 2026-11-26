// Lightweight topic index (id, title, which admin pages it documents).
// Loaded on every admin page for the contextual "?" help button, so it must
// stay small — the full article content lives in ./content.ts.

import type { GuideGroup } from './types';

export type GuideIndexEntry = {
  id: string;
  title: string;
  group: GuideGroup;
  icon: string;
  href?: string;
  paths: string[];
};

export const GUIDE_INDEX: GuideIndexEntry[] = [
  { id: 'primi-passi', title: 'Primi passi', group: 'inizio', icon: 'Rocket', paths: [] },
  { id: 'dashboard', title: 'La Dashboard', group: 'inizio', icon: 'LayoutDashboard', href: '/admin', paths: ['/admin'] },
  { id: 'tabelle', title: 'Tabelle, filtri ed export', group: 'inizio', icon: 'Table2', paths: [] },
  { id: 'contatti', title: 'Contatti (CRM)', group: 'crm', icon: 'Users', href: '/admin/clienti', paths: ['/admin/clienti'] },
  { id: 'pipeline', title: 'Pipeline delle trattative', group: 'crm', icon: 'KanbanSquare', href: '/admin/pipeline', paths: ['/admin/pipeline'] },
  { id: 'attivita', title: 'Attività e promemoria', group: 'crm', icon: 'BellRing', href: '/admin/attivita', paths: ['/admin/attivita'] },
  { id: 'ordini', title: 'Ordini', group: 'negozio', icon: 'ShoppingBag', href: '/admin/ordini', paths: ['/admin/ordini'] },
  { id: 'prodotti', title: 'Prodotti e foto', group: 'negozio', icon: 'Package', href: '/admin/prodotti', paths: ['/admin/prodotti'] },
  { id: 'categorie', title: 'Categorie', group: 'negozio', icon: 'FolderTree', href: '/admin/categorie', paths: ['/admin/categorie'] },
  { id: 'spedizioni', title: 'Spedizioni', group: 'negozio', icon: 'Truck', href: '/admin/spedizioni', paths: ['/admin/spedizioni'] },
  { id: 'statistiche', title: 'Visite al sito', group: 'contenuti', icon: 'BarChart3', href: '/admin/statistiche', paths: ['/admin/statistiche'] },
  { id: 'testi-legali', title: 'Privacy e Cookie Policy', group: 'contenuti', icon: 'ShieldCheck', href: '/admin/legale/privacy', paths: ['/admin/legale'] },
  { id: 'documenti', title: 'Documenti', group: 'contenuti', icon: 'FileText', href: '/admin/documenti', paths: ['/admin/documenti'] },
  { id: 'dati-attivita', title: 'Dati attività', group: 'sistema', icon: 'Store', href: '/admin/impostazioni', paths: ['/admin/impostazioni'] },
  { id: 'utenti', title: 'Utenti, accesso e password', group: 'sistema', icon: 'UserCog', href: '/admin/impostazioni/utenti', paths: ['/admin/impostazioni/utenti', '/admin/login'] },
  { id: 'domande', title: 'Domande frequenti e problemi', group: 'aiuto', icon: 'HelpCircle', paths: [] },
];

export function guideEntry(id: string): GuideIndexEntry {
  const e = GUIDE_INDEX.find((x) => x.id === id);
  if (!e) throw new Error(`Guide topic "${id}" missing from GUIDE_INDEX`);
  return e;
}

/** Guide topic that documents the given admin path (longest prefix wins). */
export function guideTopicForPath(pathname: string): GuideIndexEntry | null {
  if (pathname.startsWith('/admin/guida')) return null;
  let best: GuideIndexEntry | null = null;
  let len = -1;
  for (const e of GUIDE_INDEX) {
    for (const p of e.paths) {
      const hit = p === '/admin' ? pathname === '/admin' : pathname === p || pathname.startsWith(p + '/');
      if (hit && p.length > len) {
        best = e;
        len = p.length;
      }
    }
  }
  return best;
}
