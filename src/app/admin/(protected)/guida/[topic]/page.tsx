import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GuideArticle from '@/components/admin/guide/GuideArticle';
import { GUIDE_TOPICS } from '@/lib/admin/guide/content';

export function generateMetadata({ params }: { params: { topic: string } }): Metadata {
  const t = GUIDE_TOPICS.find((x) => x.id === params.topic);
  return { title: t ? `Guida · ${t.title}` : 'Guida' };
}

export default function GuidaTopicPage({ params }: { params: { topic: string } }) {
  if (!GUIDE_TOPICS.some((t) => t.id === params.topic)) notFound();
  return <GuideArticle topicId={params.topic} />;
}
