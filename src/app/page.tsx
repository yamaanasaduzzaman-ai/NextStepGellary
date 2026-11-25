import React from 'react';
import prisma from '@/lib/prisma';
import DynamicHomepage from '@/components/home/DynamicHomepage';

export const revalidate = 60; // Fresh cache

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { preview?: string };
}) {
  const isDraftPreview = searchParams?.preview === 'draft';

  // 1. Fetch site customization from database
  const customization = await prisma.siteCustomization.findUnique({
    where: { id: 'default' },
  });

  let rawSections: any[] = [];
  if (customization) {
    const jsonStr = isDraftPreview
      ? customization.draftHomepageSections || customization.homepageSections
      : customization.homepageSections;
    try {
      rawSections = JSON.parse(jsonStr);
    } catch {}
  }

  // 2. Fetch database records for dynamic feed insertion
  const [categories, collections, newArrivals, bestSellers, featuredProducts, reviews] =
    await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.collection.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        take: 4,
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isNewArrival: true },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
          category: true,
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isBestSeller: true },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
          category: true,
        },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isFeatured: true },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
          category: true,
        },
        take: 8,
      }),
      prisma.review.findMany({
        where: { isApproved: true },
        include: { product: true },
        take: 4,
        orderBy: { rating: 'desc' },
      }),
    ]);

  // If no sections in DB yet, fallback to default 18
  const defaultSections = [
    {
      id: 'sec-hero-1',
      type: 'hero_slider',
      title: 'Runway Hero',
      enabled: true,
      order: 1,
      props: {
        headline: 'THE CONTEMPORARY LUXURY SILHOUETTE',
        subheadline: 'SPRING / SUMMER 2026 ATELIER',
        ctaPrimaryText: 'DISCOVER THE RUNWAY',
        ctaPrimaryLink: '/shop',
        bgImage:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop',
      },
    },
    { id: 'sec-marquee-2', type: 'brand_marquee', title: 'Marquee', enabled: true, order: 2, props: {} },
    { id: 'sec-categories-3', type: 'category_grid', title: 'Categories', enabled: true, order: 3, props: {} },
    { id: 'sec-new-4', type: 'new_arrivals', title: 'New Arrivals', enabled: true, order: 4, props: {} },
    { id: 'sec-split-5', type: 'split_banner', title: 'Split Banner', enabled: true, order: 5, props: {} },
    { id: 'sec-featured-6', type: 'featured_products', title: 'Featured', enabled: true, order: 6, props: {} },
    { id: 'sec-bestsellers-7', type: 'best_sellers', title: 'Best Sellers', enabled: true, order: 7, props: {} },
    { id: 'sec-collections-8', type: 'curated_collections', title: 'Capsule', enabled: true, order: 8, props: {} },
    { id: 'sec-lookbook-9', type: 'lookbook_gallery', title: 'Lookbook', enabled: true, order: 9, props: {} },
    { id: 'sec-promo-10', type: 'promotional_banner', title: 'Promo Strip', enabled: true, order: 10, props: {} },
    { id: 'sec-story-11', type: 'brand_story', title: 'Brand Story', enabled: true, order: 11, props: {} },
    { id: 'sec-fabric-12', type: 'fabric_craft', title: 'Fabric Craft', enabled: true, order: 12, props: {} },
    { id: 'sec-trending-13', type: 'trending_now', title: 'Trending', enabled: true, order: 13, props: {} },
    { id: 'sec-reviews-14', type: 'customer_reviews', title: 'Reviews', enabled: true, order: 14, props: {} },
    { id: 'sec-values-15', type: 'value_props', title: 'Values', enabled: true, order: 15, props: {} },
    { id: 'sec-blog-16', type: 'blog_journal', title: 'Journal', enabled: true, order: 16, props: {} },
    { id: 'sec-insta-17', type: 'instagram_feed', title: 'Community', enabled: true, order: 17, props: {} },
    { id: 'sec-newsletter-18', type: 'newsletter_signup', title: 'Newsletter', enabled: true, order: 18, props: {} },
  ];

  const sectionsToRender = rawSections.length > 0 ? rawSections : defaultSections;

  return (
    <>
      {isDraftPreview && (
        <div className="bg-[#C6AE91] text-[#111111] px-4 py-2 text-center text-xs font-bold uppercase tracking-wider sticky top-0 z-50 shadow-md">
          ● PREVIEW MODE: Viewing Unpublished Administrator Draft Layout
        </div>
      )}
      <DynamicHomepage
        sections={sectionsToRender}
        categories={categories}
        collections={collections}
        newArrivals={newArrivals}
        bestSellers={bestSellers}
        featuredProducts={featuredProducts}
        reviews={reviews}
      />
    </>
  );
}
