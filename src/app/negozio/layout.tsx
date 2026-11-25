import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/shop/CartProvider';
import CartButton from '@/components/shop/CartButton';

export default function NegozioLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-[60vh] bg-avorio pt-28 pb-24">{children}</main>
      <Footer />
      <CartButton />
    </CartProvider>
  );
}
