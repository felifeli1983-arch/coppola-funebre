import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeartHandshake, MessageCircle, Phone, ShieldCheck, Truck } from 'lucide-react';
import { getActiveCategorie, getProdottoBySlug, getRelatedProdotti } from '@/lib/shop/queries';
import { formatPrice, productImageUrl } from '@/lib/shop/format';
import ProductGallery from '@/components/shop/ProductGallery';
import BuyBox from '@/components/shop/BuyBox';
import ProductCard, { Availability } from '@/components/shop/ProductCard';
import Breadcrumb, { type Crumb } from '@/components/shop/Breadcrumb';

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProdottoBySlug(params.slug);
  if (!p) return { title: 'Prodotto non trovato · Onoranze Funebri Coppola' };
  const desc = (p.descrizione ?? '').replace(/\s+/g, ' ').slice(0, 155) || `${p.titolo} — Onoranze Funebri Coppola`;
  const cover = p.immagini?.[0]?.storage_path;
  return {
    title: `${p.titolo} · Negozio Coppola`,
    description: desc,
    alternates: { canonical: `/negozio/${p.slug}` },
    openGraph: cover ? { images: [productImageUrl(cover)] } : undefined,
  };
}

export default async function ProdottoPage({ params }: Params) {
  const p = await getProdottoBySlug(params.slug);
  if (!p) notFound();

  const [categorie, related] = await Promise.all([getActiveCategorie(), getRelatedProdotti(p, 4)]);
  const cat = p.categoria ?? null;
  const parent = cat?.parent_id ? categorie.find((c) => c.id === cat.parent_id) : undefined;

  const crumbs: Crumb[] = [{ label: 'Negozio', href: '/negozio' }];
  if (parent) crumbs.push({ label: parent.nome, href: `/negozio?cat=${parent.slug}` });
  if (cat) crumbs.push({ label: cat.nome, href: `/negozio?cat=${cat.slug}` });
  crumbs.push({ label: p.titolo });

  const paragraphs = (p.descrizione ?? '')
    .split(/\n{2,}|\r\n\r\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const waText = encodeURIComponent(`Buongiorno, vorrei informazioni sul prodotto "${p.titolo}".`);

  return (
    <div className="container-custom pt-4">
      <Breadcrumb items={crumbs} />

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div className="min-w-0 md:sticky md:top-28 md:self-start">
          <ProductGallery images={p.immagini ?? []} title={p.titolo} />
        </div>

        <div className="flex min-w-0 flex-col">
          {cat && <div className="text-[11px] uppercase tracking-widest text-oro">{cat.nome}</div>}
          <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-pietra md:text-4xl lg:text-[2.75rem]">
            {p.titolo}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-serif text-3xl tabular-nums text-bordeaux">{formatPrice(p.prezzo_cent, p.valuta)}</span>
            <Availability giacenza={p.giacenza} className="text-sm" />
          </div>

          <div className="mt-6 border-t border-pietra/10 pt-6">
            <BuyBox
              slug={p.slug}
              titolo={p.titolo}
              prezzo_cent={p.prezzo_cent}
              valuta={p.valuta}
              giacenza={p.giacenza}
              img={p.immagini?.[0]?.storage_path}
            />
          </div>

          <ul className="mt-6 grid gap-3 border-y border-pietra/10 py-5 text-sm">
            <li className="flex items-start gap-3">
              <Truck size={18} strokeWidth={1.6} className="mt-0.5 flex-none text-oro" />
              <span>
                <span className="font-medium text-pietra">Spedizione in tutta Italia</span>
                <span className="block text-pietra-chiaro">Imballaggio accurato e protetto.</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck size={18} strokeWidth={1.6} className="mt-0.5 flex-none text-oro" />
              <span>
                <span className="font-medium text-pietra">Acquisto sicuro</span>
                <span className="block text-pietra-chiaro">I tuoi dati sono trattati con riservatezza.</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <HeartHandshake size={18} strokeWidth={1.6} className="mt-0.5 flex-none text-oro" />
              <span>
                <span className="font-medium text-pietra">Assistenza dedicata</span>
                <span className="block text-pietra-chiaro">Ti aiutiamo a scegliere con cura e discrezione.</span>
              </span>
            </li>
          </ul>

          {paragraphs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-serif text-2xl text-pietra">Descrizione</h2>
              <div className="measure mt-3 grid gap-4 text-base font-light leading-relaxed text-pietra-chiaro">
                {paragraphs.map((t, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {t}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 bg-white p-5">
            <div className="font-serif text-xl text-pietra">Hai bisogno di un consiglio?</div>
            <p className="mt-1 text-sm text-pietra-chiaro">
              Siamo a disposizione per ogni informazione sul prodotto e sulla consegna.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="tel:+390815713888"
                className="inline-flex min-h-11 items-center gap-2 border border-pietra/20 px-4 text-sm text-pietra transition-colors hover:border-bordeaux hover:text-bordeaux"
              >
                <Phone size={15} /> 081 571 3888
              </a>
              <a
                href={`https://wa.me/390815713888?text=${waText}`}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center gap-2 border border-pietra/20 px-4 text-sm text-pietra transition-colors hover:border-bordeaux hover:text-bordeaux"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20 border-t border-pietra/10 pt-12">
          <div className="flex items-center gap-3">
            <span className="divider-line" />
            <span className="eyebrow">Potrebbe interessarti</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl text-pietra md:text-4xl">Articoli correlati</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
