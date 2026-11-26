import * as React from 'react';
import Link from 'next/link';

/** Keyboard key chip. */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded border border-b-2 bg-background px-1.5 font-sans text-[11px] font-medium text-foreground">
      {children}
    </kbd>
  );
}

/** A UI label as it appears on screen, e.g. a button name. */
export function UiLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex items-center rounded-md border bg-muted/60 px-1.5 py-px text-[0.85em] font-medium text-foreground">
      {children}
    </span>
  );
}

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\{\{[^}]+\}\})/g;

/**
 * Inline markup for guide texts:
 * **grassetto** · `Etichetta` (UI label) · [testo](/admin/…) · {{⌘K}} (keys, "+"-separated)
 */
export function Rich({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((p) => p !== '');
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.startsWith('`') && p.endsWith('`')) return <UiLabel key={i}>{p.slice(1, -1)}</UiLabel>;
        if (p.startsWith('{{') && p.endsWith('}}')) {
          return (
            <span key={i} className="whitespace-nowrap">
              {p
                .slice(2, -2)
                .split('+')
                .map((k, j) => (
                  <Kbd key={j}>{k.trim()}</Kbd>
                ))}
            </span>
          );
        }
        const m = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (m) {
          const [, label, href] = m;
          const cls = 'font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary';
          return href.startsWith('/') ? (
            <Link key={i} href={href} className={cls}>
              {label}
            </Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noreferrer" className={cls}>
              {label}
            </a>
          );
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

/** Plain-text version (for search indexing). */
export function plain(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\{\{([^}]+)\}\}/g, '$1');
}
