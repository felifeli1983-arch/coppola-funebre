import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Storia from '@/components/Storia';
import Servizi from '@/components/Servizi';
import CasaFuneraria from '@/components/CasaFuneraria';
import Flotta from '@/components/Flotta';
import Previdenza from '@/components/Previdenza';
import CosaFare from '@/components/CosaFare';
import Contatti from '@/components/Contatti';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/motion/ScrollProgress';
import SmoothScroll from '@/components/SmoothScroll';

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Storia />
        <Servizi />
        <CasaFuneraria />
        <Flotta />
        <Previdenza />
        <CosaFare />
        <Contatti />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
