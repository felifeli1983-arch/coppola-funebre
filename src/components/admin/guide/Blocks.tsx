'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Bot, ChevronDown, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/primitives';
import type { Block } from '@/lib/admin/guide/types';
import { Rich } from './Rich';
import { Demo } from './demos';

const CALLOUT = {
  tip: { icon: Lightbulb, cls: 'border-success/25 bg-success/[0.06]', iconCls: 'text-success', title: 'Consiglio' },
  warning: { icon: AlertTriangle, cls: 'border-warning/30 bg-warning/[0.07]', iconCls: 'text-warning', title: 'Attenzione' },
  info: { icon: Info, cls: 'border-info/25 bg-info/[0.06]', iconCls: 'text-info', title: 'Da sapere' },
  auto: { icon: Bot, cls: 'border-primary/20 bg-primary/[0.04]', iconCls: 'text-primary', title: 'Succede da solo' },
} as const;

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="my-3 text-[15px] leading-7 text-foreground/85">
          <Rich text={block.text} />
        </p>
      );

    case 'steps':
      return (
        <div className="my-5">
          {block.title && <div className="mb-3 text-sm font-semibold">{block.title}</div>}
          <ol className="relative grid gap-4">
            {block.items.map((s, i) => (
              <li key={i} className="relative flex gap-3.5">
                {i < block.items.length - 1 && (
                  <span className="absolute left-[13px] top-8 h-[calc(100%-12px)] w-px bg-border" aria-hidden />
                )}
                <span className="z-[1] flex size-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="text-[15px] font-medium leading-6">
                    <Rich text={s.title} />
                  </div>
                  {s.text && (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      <Rich text={s.text} />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'list':
      return (
        <div className="my-4">
          {block.title && <div className="mb-2 text-sm font-semibold">{block.title}</div>}
          <ul className="grid gap-2">
            {block.items.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-7 text-foreground/85">
                <span className="mt-[11px] size-1.5 flex-none rounded-full bg-primary/60" />
                <span className="min-w-0">
                  <Rich text={t} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'callout': {
      const c = CALLOUT[block.tone];
      const Icon = c.icon;
      return (
        <div className={cn('my-5 flex gap-3 rounded-lg border p-4', c.cls)}>
          <Icon className={cn('mt-0.5 size-5 flex-none', c.iconCls)} />
          <div className="min-w-0 text-sm leading-6">
            <div className="font-semibold">{block.title ?? c.title}</div>
            <div className="mt-0.5 text-foreground/80">
              <Rich text={block.text} />
            </div>
          </div>
        </div>
      );
    }

    case 'fields':
      return (
        <div className="my-5 overflow-hidden rounded-lg border">
          {block.title && <div className="border-b bg-muted/40 px-4 py-2 text-sm font-semibold">{block.title}</div>}
          <dl className="divide-y">
            {block.items.map((f) => (
              <div key={f.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                <dt className="text-sm font-medium">{f.label}</dt>
                <dd className="text-sm leading-6 text-muted-foreground">
                  <Rich text={f.text} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case 'demo':
      return <Demo demo={block.demo} />;

    case 'faq':
      return (
        <div className="my-4 grid gap-2">
          {block.items.map((f) => (
            <Collapsible key={f.q} className="rounded-lg border bg-card">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-medium">
                <span className="min-w-0">{f.q}</span>
                <ChevronDown className="size-4 flex-none text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t px-4 py-3 text-sm leading-6 text-muted-foreground">
                  <Rich text={f.a} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      );

    case 'links':
      return (
        <div className="my-4 flex flex-wrap gap-2">
          {block.items.map((l) => (
            <Button key={l.href} asChild variant="outline" size="sm">
              <Link href={l.href}>
                {l.label}
                <ArrowRight />
              </Link>
            </Button>
          ))}
        </div>
      );
  }
}
