# Impresa Funebre Coppola

Landing page ufficiale dell'Impresa Funebre Coppola — onoranze funebri con oltre un secolo di servizio nella provincia di Napoli.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animazioni cinematografiche)
- **Lucide React** (icone)

## Setup

```bash
npm install
npm run dev
```

Il sito sarà disponibile su `http://localhost:3000`.

## Build di produzione

```bash
npm run build
npm start
```

## Struttura

- `src/app/` — App Router (layout, page, globals)
- `src/components/` — Sezioni della landing
  - `Header.tsx` · `Hero.tsx` · `Storia.tsx` · `Servizi.tsx`
  - `CasaFuneraria.tsx` · `Flotta.tsx` · `Previdenza.tsx`
  - `CosaFare.tsx` · `Sedi.tsx` · `Contatti.tsx` · `Footer.tsx`
  - `StickyCTA.tsx` (mobile call-to-action fisso)
- `src/components/motion/` — Primitive animazioni
  - `Reveal.tsx` (scroll-reveal con varianti word/image)
  - `Counter.tsx` (counter animati)
  - `ScrollProgress.tsx` (progress bar oro)
  - `MagneticButton.tsx` (hover magnetico)
- `public/img/` — Asset immagini

## Design

- **Palette**: bordeaux storico `#7F1518`, avorio caldo `#FAF6F0`, grigio pietra `#3C3A37`, oro sobrio `#B8935A`
- **Tipografia**: Cormorant Garamond (serif elegante) + Inter (UI)
- **Approccio**: eleganza classica contemporanea, rispetto del settore

## Contatti business

- **Tel 24h**: 081 571 3888
- **WhatsApp**: +39 349 335 6728
- **Email**: info@impresacoppola.it
- **8 sedi** in provincia di Napoli (Mugnano, Giugliano, Villaricca, Qualiano, Melito, Lago Patria, Licola)
