import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/shop/CartProvider';
import CartButton from '@/components/shop/CartButton';
import CartDrawer from '@/components/shop/CartDrawer';

export default function NegozioLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header actions={<CartButton />} />
      {/* contain:none — the global `main { contain: layout }` would trap position:fixed bars (mobile checkout/add-to-cart). */}
      <main className="min-h-[60vh] bg-avorio pb-28 pt-24 [contain:none] md:pt-28 lg:pb-24">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
