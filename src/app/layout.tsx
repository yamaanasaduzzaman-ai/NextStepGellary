import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CustomizationProvider } from '@/context/CustomizationContext';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Nexstep Gallery | Luxury Fashion, Clothing & Lifestyle Atelier',
  description:
    'Discover minimalist luxury fashion by Nexstep Gallery. Impeccable tailoring, pure mulberry silks, fine Egyptian cottons, and architectural silhouettes handcrafted in Bangladesh.',
  keywords: [
    'Nexstep Gallery',
    'Luxury Fashion Bangladesh',
    'Panjabi',
    'Silk Panjabi Dhaka',
    'Designer Clothing',
    'Minimalist Fashion',
    'Men Shirts Dhaka',
    'Luxury Pret',
  ],
  openGraph: {
    title: 'Nexstep Gallery | Luxury Fashion & Lifestyle',
    description: 'Minimalist luxury tailoring and artisanal South Asian craftsmanship.',
    type: 'website',
    locale: 'en_BD',
    siteName: 'Nexstep Gallery',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#111111]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CustomizationProvider>
                <AnnouncementBar />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <CartDrawer />
              </CustomizationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
