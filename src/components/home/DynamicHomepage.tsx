'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  Instagram,
  CheckCircle2,
} from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';

interface DynamicHomepageProps {
  sections: Array<{
    id: string;
    type: string;
    title: string;
    enabled: boolean;
    order: number;
    props: Record<string, any>;
  }>;
  categories: any[];
  collections: any[];
  newArrivals: any[];
  bestSellers: any[];
  featuredProducts: any[];
  reviews: any[];
}

export default function DynamicHomepage({
  sections,
  categories,
  collections,
  newArrivals,
  bestSellers,
  featuredProducts,
  reviews,
}: DynamicHomepageProps) {
  // Sort enabled sections by order
  const activeSections = [...sections]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col min-h-screen">
      {activeSections.map((sec) => {
        const { type, props = {} } = sec;

        switch (type) {
          // 1. HERO SLIDER
          case 'hero_slider':
            return (
              <section
                key={sec.id}
                className="relative w-full h-[85vh] sm:h-[90vh] bg-[#111111] overflow-hidden"
              >
                <Image
                  src={
                    props.bgImage ||
                    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop'
                  }
                  alt={props.headline || 'Runway Hero'}
                  fill
                  priority
                  className="object-cover object-center opacity-65"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-black/30" />
                <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 sm:pb-28">
                  <div className="max-w-2xl space-y-4 animate-slideUp">
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
                      {props.subheadline || 'Spring / Summer 2026 Collection'}
                    </span>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light text-white tracking-tight leading-tight">
                      {props.headline || 'THE CONTEMPORARY LUXURY SILHOUETTE'}
                    </h1>
                    <div className="pt-4 flex flex-wrap gap-4">
                      <Link
                        href={props.ctaPrimaryLink || '/shop'}
                        className="px-8 py-3.5 bg-[#F8F7F4] text-[#111111] text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] transition-all duration-300 flex items-center gap-2"
                      >
                        <span>{props.ctaPrimaryText || 'DISCOVER THE RUNWAY'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      {props.ctaSecondaryText && (
                        <Link
                          href={props.ctaSecondaryLink || '/category/men'}
                          className="px-8 py-3.5 border border-white/60 text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-white hover:text-[#111111] transition-all duration-300"
                        >
                          {props.ctaSecondaryText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );

          // 2. BRAND MARQUEE
          case 'brand_marquee':
            const items = props.items || [
              'VOGUE SCANDINAVIA',
              'GQ INTERNATIONAL',
              'HARPERS BAZAAR',
              'ELLE EDITORIAL',
              "L'OFFICIEL",
            ];
            return (
              <section
                key={sec.id}
                className="bg-[#111111] py-4 border-y border-neutral-800 overflow-hidden"
              >
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-around flex-wrap gap-6 text-[10px] font-serif tracking-[0.3em] uppercase text-neutral-400">
                  {items.map((it: string, i: number) => (
                    <span key={i} className="hover:text-[#C6AE91] transition-colors">
                      {it}
                    </span>
                  ))}
                </div>
              </section>
            );

          // 3. CATEGORY GRID
          case 'category_grid':
            return (
              <section
                key={sec.id}
                className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                      Curated Disciplines
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] mt-1 tracking-tight">
                      {props.title || 'Shop By Category'}
                    </h2>
                  </div>
                  <Link
                    href="/shop"
                    className="mt-4 md:mt-0 text-xs font-semibold tracking-luxury uppercase text-[#111111] hover:text-[#C6AE91] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>View All Categories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="group relative aspect-[4/5] overflow-hidden bg-[#ECE8E1] rounded-sm block"
                    >
                      <Image
                        src={
                          cat.imageUrl ||
                          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800'
                        }
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute inset-x-4 bottom-5 flex flex-col items-center text-center">
                        <h3 className="text-sm sm:text-base font-serif font-medium text-white tracking-wider uppercase group-hover:text-[#C6AE91] transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] font-sans tracking-[0.2em] text-neutral-300 uppercase mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Explore →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );

          // 4. NEW ARRIVALS
          case 'new_arrivals':
            return (
              <section
                key={sec.id}
                className="py-20 bg-[#F4EFEA] border-y border-[#EAEAEA]"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                      <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                        Fresh Off Atelier
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] mt-1 tracking-tight">
                        {props.title || 'New Arrivals'}
                      </h2>
                    </div>
                    <Link
                      href="/shop?filter=new"
                      className="mt-4 md:mt-0 text-xs font-semibold tracking-luxury uppercase text-[#111111] hover:text-[#C6AE91] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Explore All New Arrivals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {newArrivals.slice(0, props.itemLimit || 4).map((product) => (
                      <ProductCard key={product.id} product={product as any} />
                    ))}
                  </div>
                </div>
              </section>
            );

          // 5. SPLIT BANNER
          case 'split_banner':
            const left = props.left || {
              title: 'THE TAILORED SUITING',
              subtitle: 'Italian Super 130s Pure Wool',
              link: '/category/men',
              ctaText: 'DISCOVER MENSWEAR',
              image:
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
            };
            const right = props.right || {
              title: 'THE SILK SILHOUETTES',
              subtitle: 'Mulberry Silk & Drape Shirting',
              link: '/category/women',
              ctaText: 'DISCOVER WOMENSWEAR',
              image:
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
            };
            return (
              <section
                key={sec.id}
                className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {[left, right].map((banner, i) => (
                  <div
                    key={i}
                    className="relative aspect-[4/3] rounded-sm overflow-hidden group bg-[#111111]"
                  >
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-6 bottom-8 space-y-2 text-white">
                      <span className="text-[10px] tracking-[0.25em] text-[#C6AE91] uppercase">
                        {banner.subtitle}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-light tracking-wide">
                        {banner.title}
                      </h3>
                      <div className="pt-2">
                        <Link
                          href={banner.link || '/shop'}
                          className="text-xs font-semibold uppercase tracking-wider text-white hover:text-[#C6AE91] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>{banner.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            );

          // 6. FEATURED PRODUCTS
          case 'featured_products':
            return (
              <section
                key={sec.id}
                className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                  <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                    Timeless Classics
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] tracking-tight">
                    {props.title || 'Featured Iconics'}
                  </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {featuredProducts.slice(0, props.itemLimit || 4).map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
              </section>
            );

          // 7. BEST SELLERS
          case 'best_sellers':
            return (
              <section
                key={sec.id}
                className="py-20 bg-[#F4EFEA] border-y border-[#EAEAEA]"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                      <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                        Most Coveted
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] mt-1 tracking-tight">
                        {props.title || 'Best Selling Wardrobe Staples'}
                      </h2>
                    </div>
                    <Link
                      href="/shop"
                      className="mt-4 md:mt-0 text-xs font-semibold tracking-luxury uppercase text-[#111111] hover:text-[#C6AE91] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Explore All Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {bestSellers.slice(0, props.itemLimit || 4).map((product) => (
                      <ProductCard key={product.id} product={product as any} />
                    ))}
                  </div>
                </div>
              </section>
            );

          // 8. CURATED COLLECTIONS CAPSULE
          case 'curated_collections':
            return collections.length > 0 ? (
              <section
                key={sec.id}
                className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-sm overflow-hidden bg-[#111111]">
                  <Image
                    src={
                      collections[0].bannerImage ||
                      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'
                    }
                    alt={collections[0].name}
                    fill
                    className="object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-center px-8 sm:px-16 max-w-xl space-y-4">
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
                      Special Capsule
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-serif font-light text-white tracking-tight">
                      {collections[0].name}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                      {collections[0].description}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/shop?collection=${collections[0].slug}`}
                        className="px-7 py-3 bg-[#F8F7F4] text-[#111111] text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] transition-colors inline-flex items-center gap-2"
                      >
                        <span>Explore Capsule</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : null;

          // 9. LOOKBOOK GALLERY
          case 'lookbook_gallery':
            const lookbookImages = props.images || [
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
            ];
            return (
              <section
                key={sec.id}
                className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                  <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                    Runway Moments
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111]">
                    {props.title || 'The Runway Lookbook'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {lookbookImages.map((img: string, i: number) => (
                    <div
                      key={i}
                      className="relative aspect-[3/4] overflow-hidden rounded-sm group bg-neutral-100"
                    >
                      <Image
                        src={img}
                        alt={`Lookbook ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );

          // 10. PROMOTIONAL BANNER
          case 'promotional_banner':
            return (
              <section
                key={sec.id}
                className="relative py-24 bg-[#111111] text-white overflow-hidden my-12"
              >
                {props.image && (
                  <Image
                    src={props.image}
                    alt="Promo"
                    fill
                    className="object-cover opacity-40"
                  />
                )}
                <div className="relative max-w-4xl mx-auto px-4 text-center space-y-4">
                  <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
                    {props.subheadline || 'ATELIER PRIVILEGES'}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-serif font-light tracking-wide leading-snug">
                    {props.headline || 'THE ART OF BESPOKE MEASUREMENT'}
                  </h2>
                  <div className="pt-4">
                    <Link
                      href={props.ctaLink || '/contact'}
                      className="px-8 py-3.5 bg-white text-[#111111] text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] transition-colors inline-block"
                    >
                      {props.ctaText || 'BOOK CONSULTATION'}
                    </Link>
                  </div>
                </div>
              </section>
            );

          // 11. BRAND STORY
          case 'brand_story':
            return (
              <section
                key={sec.id}
                className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-100">
                    <Image
                      src={
                        props.image ||
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop'
                      }
                      alt="Brand Atelier"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-6">
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
                      {props.tagline || 'THE NEXSTEP ATELIER'}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-serif font-light text-[#111111] tracking-tight leading-snug">
                      {props.title || 'ARCHITECTURAL RIGOR MEETS REFINED DRAPERY'}
                    </h2>
                    <p className="text-sm text-[#858585] leading-relaxed">
                      {props.bodyText ||
                        'Founded with a clear vision: to strip away superfluous fashion noise and create garments of quiet confidence, exceptional tactile quality, and lasting emotional resonance.'}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={props.ctaLink || '/about'}
                        className="text-xs font-semibold uppercase tracking-wider text-[#111111] hover:text-[#C6AE91] inline-flex items-center gap-1.5 transition-colors border-b border-[#111111] pb-1"
                      >
                        <span>{props.ctaText || 'EXPLORE OUR PHILOSOPHY'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );

          // 12. FABRIC CRAFT
          case 'fabric_craft':
            const fabrics = props.fabrics || [
              {
                name: 'Giza 87 Egyptian Cotton',
                description: 'Long-staple breathability with unmatched silky handfeel.',
              },
              {
                name: 'Super 130s Merino Wool',
                description: 'Crease-resistant natural thermo-regulation for year-round luxury.',
              },
              {
                name: 'Mulberry Silk 22mm',
                description: 'Weighty drape with subtle organic luster and hypoallergenic touch.',
              },
            ];
            return (
              <section
                key={sec.id}
                className="py-20 bg-[#181818] text-[#F8F7F4] border-y border-neutral-800"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
                      Textile Science
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide">
                      {props.title || 'TACTILE EXCELLENCE'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {fabrics.map((f: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 border border-neutral-800 rounded-sm bg-neutral-900/60 space-y-2"
                      >
                        <h4 className="text-base font-serif font-semibold text-[#C6AE91]">
                          {f.name}
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {f.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          // 13. TRENDING NOW
          case 'trending_now':
            return (
              <section
                key={sec.id}
                className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                      Currently Trending
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] mt-1 tracking-tight">
                      {props.title || 'TRENDING IN DHAKA & BEYOND'}
                    </h2>
                  </div>
                  <Link
                    href="/shop"
                    className="mt-4 md:mt-0 text-xs font-semibold tracking-luxury uppercase text-[#111111] hover:text-[#C6AE91] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>View All Styles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {newArrivals.slice(0, props.itemLimit || 4).map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
              </section>
            );

          // 14. CUSTOMER REVIEWS
          case 'customer_reviews':
            const clientReviews = props.reviews || reviews || [];
            return (
              <section
                key={sec.id}
                className="py-20 bg-[#F4EFEA] border-y border-[#EAEAEA]"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
                    <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                      Client Voices
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111]">
                      {props.title || 'VOICES OF OUR PATRONS'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {clientReviews.slice(0, 3).map((r: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 bg-white border border-[#EAEAEA] rounded-sm space-y-4 shadow-xs"
                      >
                        <div className="flex items-center gap-1 text-[#C6AE91]">
                          {[...Array(5)].map((_, si) => (
                            <Star key={si} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-[#252525] italic leading-relaxed">
                          &ldquo;{r.quote || r.comment || 'Impeccable tailoring and fast courier delivery.'}&rdquo;
                        </p>
                        <div className="pt-2 border-t border-[#EAEAEA] text-[11px]">
                          <strong className="text-[#111111] block">
                            {r.author || r.userName || 'Verified Patron'}
                          </strong>
                          <span className="text-[#858585]">{r.city || 'Dhaka, Bangladesh'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          // 15. VALUE PROPOSITIONS
          case 'value_props':
            return (
              <section
                key={sec.id}
                className="bg-[#181818] text-[#F8F7F4] py-8 border-y border-neutral-800"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Truck className="w-5 h-5 text-[#C6AE91]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">
                      Nationwide Delivery
                    </h4>
                    <p className="text-[11px] text-neutral-400">Doorstep delivery across all 64 districts</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Sparkles className="w-5 h-5 text-[#C6AE91]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">
                      Artisanal Fabrics
                    </h4>
                    <p className="text-[11px] text-neutral-400">Mulberry Silk, Giza Cotton & Pure Wool</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <RotateCcw className="w-5 h-5 text-[#C6AE91]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">
                      7-Day Easy Returns
                    </h4>
                    <p className="text-[11px] text-neutral-400">Complimentary exchange service</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Lock className="w-5 h-5 text-[#C6AE91]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">
                      Bank-Grade Security
                    </h4>
                    <p className="text-[11px] text-neutral-400">bKash, Nagad, Visa & Cash On Delivery</p>
                  </div>
                </div>
              </section>
            );

          // 16. BLOG JOURNAL
          case 'blog_journal':
            return (
              <section
                key={sec.id}
                className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
                      Editorial Dispatches
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] mt-1 tracking-tight">
                      {props.title || 'THE FASHION JOURNAL'}
                    </h2>
                  </div>
                  <Link
                    href="/blog"
                    className="mt-4 md:mt-0 text-xs font-semibold tracking-luxury uppercase text-[#111111] hover:text-[#C6AE91] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Read All Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'The Architecture of the Modern Linen Suit',
                      category: 'Tailoring & Craft',
                      date: 'Spring 2026',
                      image:
                        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
                    },
                    {
                      title: 'Organic Silk Draping in Tropical Climates',
                      category: 'Textile Science',
                      date: 'February 2026',
                      image:
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
                    },
                    {
                      title: 'Minimalist Wardrobe Foundations for South Asia',
                      category: 'Sartorial Guide',
                      date: 'January 2026',
                      image:
                        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
                    },
                  ].map((post, pi) => (
                    <div key={pi} className="space-y-3 group cursor-pointer">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-neutral-100">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C6AE91]">
                          {post.category} • {post.date}
                        </span>
                        <h3 className="text-sm font-semibold text-[#111111] group-hover:text-[#C6AE91] transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          // 17. INSTAGRAM FEED
          case 'instagram_feed':
            const instaImages = props.images || [
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop',
            ];
            return (
              <section
                key={sec.id}
                className="py-20 border-t border-[#EAEAEA] bg-white"
              >
                <div className="max-w-7xl mx-auto px-4 text-center mb-10 space-y-1">
                  <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase flex items-center justify-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5" />
                    <span>{props.handle || '@nexstepgallery'}</span>
                  </span>
                  <h2 className="text-2xl font-serif font-light text-[#111111]">
                    {props.title || 'WORN BY OUR COMMUNITY'}
                  </h2>
                </div>
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {instaImages.map((img: string, i: number) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-xs group bg-neutral-100"
                    >
                      <Image
                        src={img}
                        alt={`Instagram look ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );

          // 18. NEWSLETTER SIGNUP
          case 'newsletter_signup':
            return (
              <section
                key={sec.id}
                className="py-20 bg-[#111111] text-white text-center"
              >
                <div className="max-w-xl mx-auto px-4 space-y-4">
                  <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
                    Privilege Circle
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide">
                    {props.title || 'ENTER THE PRIVATE SALON'}
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    {props.description ||
                      'Subscribe to receive private invitations to runway debuts, early access to new collections, and sartorial guides.'}
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert('Thank you for joining the Nexstep Private Salon.');
                    }}
                    className="flex max-w-md mx-auto gap-2 pt-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      className="flex-1 bg-neutral-900 border border-neutral-700 text-xs px-4 py-2.5 rounded-sm text-white focus:outline-hidden focus:border-[#C6AE91]"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C6AE91] text-[#111111] text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                    >
                      {props.buttonText || 'JOIN'}
                    </button>
                  </form>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
