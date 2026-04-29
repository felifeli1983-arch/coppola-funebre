import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Servizi from '@/components/Servizi';
import CasaFuneraria from '@/components/CasaFuneraria';
import Previdenza from '@/components/Previdenza';
import CosaFare from '@/components/CosaFare';
import Faq from '@/components/Faq';
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
        <Servizi />
        <CasaFuneraria />
        <CosaFare />
        <Previdenza />
        <Faq />
        <Contatti />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
