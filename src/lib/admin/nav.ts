import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  BellRing,
  ShoppingBag,
  Package,
  FolderTree,
  Truck,
  BarChart3,
  ShieldCheck,
  Cookie,
  FileText,
  Store,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Key into the live counters passed to the sidebar (badges). */
  badge?: 'ordiniDaGestire' | 'promemoria';
  keywords?: string;
};

export type NavSection = { id: string; label?: string; items: NavItem[] };

export const NAV: NavSection[] = [
  {
    id: 'home',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, keywords: 'home panoramica' }],
  },
  {
    id: 'crm',
    label: 'CRM',
    items: [
      { href: '/admin/clienti', label: 'Contatti', icon: Users, keywords: 'clienti rubrica crm', exact: false },
      { href: '/admin/pipeline', label: 'Pipeline', icon: KanbanSquare, keywords: 'trattative preventivi' },
      { href: '/admin/attivita', label: 'Attività', icon: BellRing, badge: 'promemoria', keywords: 'promemoria scadenze chiamate note' },
    ],
  },
  {
    id: 'shop',
    label: 'Negozio',
    items: [
      { href: '/admin/ordini', label: 'Ordini', icon: ShoppingBag, badge: 'ordiniDaGestire', keywords: 'vendite' },
      { href: '/admin/prodotti', label: 'Prodotti', icon: Package, keywords: 'catalogo articoli' },
      { href: '/admin/categorie', label: 'Categorie', icon: FolderTree, keywords: 'catalogo' },
      { href: '/admin/spedizioni', label: 'Spedizioni', icon: Truck, keywords: 'costi consegna' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analisi',
    items: [{ href: '/admin/statistiche', label: 'Visite al sito', icon: BarChart3, keywords: 'statistiche traffico' }],
  },
  {
    id: 'content',
    label: 'Contenuti',
    items: [
      { href: '/admin/legale/privacy', label: 'Privacy Policy', icon: ShieldCheck, keywords: 'gdpr' },
      { href: '/admin/legale/cookie', label: 'Cookie Policy', icon: Cookie },
      { href: '/admin/documenti', label: 'Documenti', icon: FileText, keywords: 'file pdf allegati' },
    ],
  },
  {
    id: 'system',
    label: 'Impostazioni',
    items: [
      { href: '/admin/impostazioni', label: 'Dati attività', icon: Store, exact: true, keywords: 'negozio azienda' },
      { href: '/admin/impostazioni/utenti', label: 'Utenti e accesso', icon: UserCog, keywords: 'amministratori password' },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((s) => s.items);

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

const SEGMENT_LABELS: Record<string, string> = {
  nuovo: 'Nuovo',
  modifica: 'Modifica',
  stampa: 'Stampa',
};

/** Breadcrumb trail for a pathname, e.g. /admin/clienti/123 → Contatti › Scheda. */
export function breadcrumbsFor(pathname: string): { href: string; label: string }[] {
  const trail: { href: string; label: string }[] = [{ href: '/admin', label: 'Dashboard' }];
  if (pathname === '/admin') return trail;

  // Longest matching nav item is the "section" crumb.
  const match = [...NAV_ITEMS]
    .filter((i) => i.href !== '/admin' && (pathname === i.href || pathname.startsWith(i.href + '/')))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!match) return trail;
  trail.push({ href: match.href, label: match.label });

  const rest = pathname.slice(match.href.length).split('/').filter(Boolean);
  let acc = match.href;
  for (const seg of rest) {
    acc += '/' + seg;
    trail.push({ href: acc, label: SEGMENT_LABELS[seg] ?? 'Dettaglio' });
  }
  return trail;
}
