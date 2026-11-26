'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GROUP_LABEL, type GuideTopic } from '@/lib/admin/guide/types';
import { GUIDE_TOPICS } from '@/lib/admin/guide/content';
import { guideIcon } from './icons';
import { BlockView } from './Blocks';
import { Rich } from './Rich';
import { markGuideDone } from './progress';

function useScrollSpy(ids: string[]) {
  const [active, setActive] = React.useState(ids[0]);
  React.useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

export default function GuideArticle({ topicId }: { topicId: string }) {
  const index = GUIDE_TOPICS.findIndex((t) => t.id === topicId);
  const topic = GUIDE_TOPICS[index] as GuideTopic;
  const prev = GUIDE_TOPICS[index - 1];
  const next = GUIDE_TOPICS[index + 1];
  const ids = React.useMemo(() => topic.sections.map((s) => s.id), [topic]);
  const active = useScrollSpy(ids);
  const Icon = guideIcon(topic.icon);

  React.useEffect(() => markGuideDone(`letto:${topic.id}`), [topic.id]);

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/guida"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Tutta la guida
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 border-b pb-7 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex size-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="muted">{GROUP_LABEL[topic.group]}</Badge>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {topic.readingMinutes} min di lettura
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{topic.title}</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              <Rich text={topic.summary} />
            </p>
          </div>
        </div>
        {topic.href && (
          <Button asChild className="flex-none self-start md:self-auto">
            <Link href={topic.href}>
              Apri la pagina <ArrowUpRight />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* Mobile TOC */}
        {topic.sections.length > 1 && (
          <details className="group rounded-lg border bg-card lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
              <ListTree className="size-4 text-muted-foreground" /> In questa pagina
              <span className="ml-auto text-xs text-muted-foreground">{topic.sections.length} sezioni</span>
            </summary>
            <nav className="grid border-t p-2">
              {topic.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  {s.title}
                </a>
              ))}
            </nav>
          </details>
        )}

        <article className="min-w-0">
          {topic.sections.map((s, i) => (
            <div key={s.id} id={s.id} className={cn('scroll-mt-20', i > 0 && 'mt-12')}>
              <h2 className="group flex items-center gap-2 text-xl font-semibold tracking-tight">
                {s.title}
                <a href={`#${s.id}`} className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Link a questa sezione">
                  #
                </a>
              </h2>
              {s.blocks.map((b, j) => (
                <BlockView key={j} block={b} />
              ))}
            </div>
          ))}

          {/* Prev / next */}
          <div className="mt-14 grid gap-3 border-t pt-6 sm:grid-cols-2">
            {prev ? (
              <Link href={`/admin/guida/${prev.id}`} className="group min-w-0">
                <Card className="h-full p-4 transition-colors group-hover:bg-muted/40">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" /> Precedente
                  </div>
                  <div className="mt-1 truncate font-medium">{prev.title}</div>
                </Card>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/admin/guida/${next.id}`} className="group min-w-0">
                <Card className="h-full p-4 text-right transition-colors group-hover:bg-muted/40">
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    Successivo <ArrowRight className="size-3.5" />
                  </div>
                  <div className="mt-1 truncate font-medium">{next.title}</div>
                </Card>
              </Link>
            )}
          </div>
        </article>

        {/* Desktop TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 grid gap-0.5 border-l pl-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">In questa pagina</div>
            {topic.sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  '-ml-[17px] border-l-2 py-1.5 pl-4 text-sm transition-colors',
                  active === s.id
                    ? 'border-primary font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {s.title}
              </a>
            ))}
            {topic.href && (
              <Link href={topic.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Apri la pagina <ArrowUpRight className="size-3.5" />
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
