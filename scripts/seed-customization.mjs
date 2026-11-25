import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Nexstep Gallery Brands, Customization, Menus, and Attributes...');

  // 1. Brands
  const brands = [
    {
      name: 'Nexstep Atelier',
      slug: 'nexstep-atelier',
      description: 'In-house luxury bespoke tailoring crafted with the finest Italian & British wools.',
      logoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=200&auto=format&fit=crop',
      website: 'https://nexstepgallery.com',
      isActive: true,
    },
    {
      name: 'Aura Studio',
      slug: 'aura-studio',
      description: 'Minimalist everyday essentials engineered for high-comfort versatility.',
      logoUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=200&auto=format&fit=crop',
      website: 'https://nexstepgallery.com/brands/aura-studio',
      isActive: true,
    },
    {
      name: 'Solstice Luxe',
      slug: 'solstice-luxe',
      description: 'Evening wear and seasonal runway pieces crafted in pure mulberry silk and linen.',
      logoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop',
      website: 'https://nexstepgallery.com/brands/solstice-luxe',
      isActive: true,
    },
    {
      name: 'Monochrome Heritage',
      slug: 'monochrome-heritage',
      description: 'Architectural streetwear and heavyweight structured silhouettes.',
      logoUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=200&auto=format&fit=crop',
      website: 'https://nexstepgallery.com/brands/monochrome-heritage',
      isActive: true,
    },
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
  }
  console.log(`✓ Seeded ${brands.length} brands`);

  // 2. Subcategories
  const menCat = await prisma.category.findUnique({ where: { slug: 'men' } });
  const womenCat = await prisma.category.findUnique({ where: { slug: 'women' } });
  const accCat = await prisma.category.findUnique({ where: { slug: 'accessories' } });

  const subcats = [
    { name: 'Shirts & Polos', slug: 'men-shirts', parentId: menCat?.id, displayOrder: 1 },
    { name: 'Trousers & Chinos', slug: 'men-trousers', parentId: menCat?.id, displayOrder: 2 },
    { name: 'Blazers & Outerwear', slug: 'men-outerwear', parentId: menCat?.id, displayOrder: 3 },
    { name: 'Dresses & Gowns', slug: 'women-dresses', parentId: womenCat?.id, displayOrder: 1 },
    { name: 'Tops & Blouses', slug: 'women-tops', parentId: womenCat?.id, displayOrder: 2 },
    { name: 'Pants & Tailoring', slug: 'women-tailoring', parentId: womenCat?.id, displayOrder: 3 },
    { name: 'Leather Goods', slug: 'acc-leather', parentId: accCat?.id, displayOrder: 1 },
    { name: 'Scarves & Silk', slug: 'acc-scarves', parentId: accCat?.id, displayOrder: 2 },
  ];

  for (const sc of subcats) {
    if (sc.parentId) {
      await prisma.category.upsert({
        where: { slug: sc.slug },
        update: { name: sc.name, parentId: sc.parentId, displayOrder: sc.displayOrder },
        create: {
          name: sc.name,
          slug: sc.slug,
          parentId: sc.parentId,
          displayOrder: sc.displayOrder,
          description: `Premium curated ${sc.name}`,
        },
      });
    }
  }
  console.log('✓ Seeded subcategories');

  // 3. Product Attributes
  const attributes = [
    {
      name: 'Size',
      type: 'SIZE',
      values: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Fit']),
    },
    {
      name: 'Color',
      type: 'COLOR',
      values: JSON.stringify([
        { name: 'Charcoal Black', hex: '#111111' },
        { name: 'Off White', hex: '#F8F7F4' },
        { name: 'Warm Beige', hex: '#C6AE91' },
        { name: 'Deep Navy', hex: '#1B263B' },
        { name: 'Olive Drab', hex: '#556B2F' },
        { name: 'Terracotta', hex: '#B85D3B' },
        { name: 'Smoke Grey', hex: '#707070' },
      ]),
    },
    {
      name: 'Fabric',
      type: 'FABRIC',
      values: JSON.stringify([
        '100% Egyptian Giza Cotton',
        'Pure Mulberry Silk',
        'Super 130s Merino Wool',
        'Pure French Linen',
        'Raw Selvedge Denim',
        'Cashmere Blend',
      ]),
    },
    {
      name: 'Fit',
      type: 'FIT',
      values: JSON.stringify(['Slim Fit', 'Regular Tailored', 'Relaxed Contemporary', 'Oversized Editorial']),
    },
  ];

  for (const attr of attributes) {
    const existing = await prisma.productAttribute.findFirst({ where: { name: attr.name } });
    if (existing) {
      await prisma.productAttribute.update({ where: { id: existing.id }, data: attr });
    } else {
      await prisma.productAttribute.create({ data: attr });
    }
  }
  console.log('✓ Seeded product attributes');

  // 4. Navigation Menus
  const headerMenuItems = JSON.stringify([
    { label: 'Shop All', url: '/shop' },
    {
      label: 'Men',
      url: '/category/men',
      children: [
        { label: 'Shirts & Polos', url: '/category/men?sub=men-shirts' },
        { label: 'Trousers & Chinos', url: '/category/men?sub=men-trousers' },
        { label: 'Blazers & Outerwear', url: '/category/men?sub=men-outerwear' },
      ],
    },
    {
      label: 'Women',
      url: '/category/women',
      children: [
        { label: 'Dresses & Gowns', url: '/category/women?sub=women-dresses' },
        { label: 'Tops & Blouses', url: '/category/women?sub=women-tops' },
        { label: 'Pants & Tailoring', url: '/category/women?sub=women-tailoring' },
      ],
    },
    { label: 'Collections', url: '/collections' },
    { label: 'About', url: '/about' },
    { label: 'Editorial Journal', url: '/blog' },
  ]);

  const footerMenuItems = JSON.stringify([
    { label: 'Shop All', url: '/shop' },
    { label: 'New Arrivals', url: '/shop?filter=new' },
    { label: 'Collections', url: '/collections' },
    { label: 'About Us', url: '/about' },
    { label: 'Fashion Journal', url: '/blog' },
    { label: 'Size Guide', url: '/size-guide' },
    { label: 'Shipping & Delivery', url: '/shipping' },
    { label: 'Returns & Exchanges', url: '/returns' },
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy' },
  ]);

  const existingHeader = await prisma.navigationMenu.findFirst({ where: { location: 'HEADER' } });
  if (existingHeader) {
    await prisma.navigationMenu.update({
      where: { id: existingHeader.id },
      data: { name: 'Main Header Navigation', items: headerMenuItems, isActive: true },
    });
  } else {
    await prisma.navigationMenu.create({
      data: { name: 'Main Header Navigation', location: 'HEADER', items: headerMenuItems, isActive: true },
    });
  }

  const existingFooter = await prisma.navigationMenu.findFirst({ where: { location: 'FOOTER' } });
  if (existingFooter) {
    await prisma.navigationMenu.update({
      where: { id: existingFooter.id },
      data: { name: 'Footer Quick Links', items: footerMenuItems, isActive: true },
    });
  } else {
    await prisma.navigationMenu.create({
      data: { name: 'Footer Quick Links', location: 'FOOTER', items: footerMenuItems, isActive: true },
    });
  }
  console.log('✓ Seeded navigation menus');

  // 5. Popup
  const welcomePopup = {
    title: 'VIP Welcome Privilege',
    type: 'WELCOME',
    heading: 'THE PRIVILEGE CIRCLE',
    description: 'Subscribe to receive complimentary bespoke tailoring advice, invitations to private showroom events, and 10% off your premier order.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    ctaText: 'Unlock 10% Privileges',
    ctaLink: '/shop',
    delaySeconds: 4,
    frequency: 'ONCE_PER_SESSION',
    targetPages: 'ALL',
    isActive: true,
  };

  const existingPopup = await prisma.popup.findFirst({ where: { title: welcomePopup.title } });
  if (existingPopup) {
    await prisma.popup.update({ where: { id: existingPopup.id }, data: welcomePopup });
  } else {
    await prisma.popup.create({ data: welcomePopup });
  }
  console.log('✓ Seeded welcome popup');

  // 6. Site Customization (Theme, Header, Footer, 18 Homepage Sections, SEO)
  const themeSettings = {
    primaryColor: '#111111',
    secondaryColor: '#F8F7F4',
    accentColor: '#C6AE91',
    textColor: '#252525',
    mutedColor: '#858585',
    borderColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    fontHeading: 'Cinzel, Georgia, serif',
    fontBody: 'Plus Jakarta Sans, -apple-system, sans-serif',
    borderRadius: '2px', // Minimalist luxury sharp/subtle
    containerWidth: '1280px',
  };

  const headerSettings = {
    brandName: 'NEXSTEP GALLERY',
    logoUrl: '',
    announcementBar: {
      enabled: true,
      text: 'COMPLIMENTARY EXPRESS NATIONWIDE SHIPPING ON ALL ORDERS OVER ৳3,000',
      link: '/shop',
      bgColor: '#111111',
      textColor: '#FFFFFF',
    },
    sticky: true,
    showSearch: true,
    showWishlist: true,
    showCart: true,
    height: '80px',
  };

  const footerSettings = {
    brandName: 'NEXSTEP GALLERY',
    brandTagline: 'Curating modern luxury and timeless architectural silhouettes for the discerning wardrobe.',
    copyright: '© 2026 NEXSTEP GALLERY. All Rights Reserved. Handcrafted in Dhaka, Bangladesh.',
    newsletterTitle: 'THE FASHION JOURNAL & PRIVATE ACCESS',
    newsletterDescription: 'Join our inner circle for seasonal lookbooks, exclusive drops, and private salon invitations.',
    showPaymentIcons: true,
    socialLinks: {
      instagram: 'https://instagram.com/nexstepgallery',
      facebook: 'https://facebook.com/nexstepgallery',
      pinterest: 'https://pinterest.com/nexstepgallery',
      linkedin: 'https://linkedin.com/company/nexstepgallery',
    },
  };

  // 18 Fully Configured Homepage Sections
  const homepageSections = [
    {
      id: 'sec-hero-1',
      type: 'hero_slider',
      title: 'Editorial Runway Hero',
      enabled: true,
      order: 1,
      props: {
        headline: 'THE CONTEMPORARY LUXURY SILHOUETTE',
        subheadline: 'SPRING / SUMMER 2026 COLLECTION',
        ctaPrimaryText: 'DISCOVER THE RUNWAY',
        ctaPrimaryLink: '/shop',
        ctaSecondaryText: 'VIEW THE LOOKBOOK',
        ctaSecondaryLink: '/lookbook',
        bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop',
        overlayOpacity: 35,
      },
    },
    {
      id: 'sec-brand-marquee-2',
      type: 'brand_marquee',
      title: 'Partner Showcase & Press',
      enabled: true,
      order: 2,
      props: {
        items: ['VOGUE SCANDINAVIA', 'GQ INTERNATIONAL', 'HARPERS BAZAAR', 'ELLE EDITORIAL', 'L\'OFFICIEL'],
      },
    },
    {
      id: 'sec-categories-3',
      type: 'category_grid',
      title: 'Curated Category Grid',
      enabled: true,
      order: 3,
      props: {
        title: 'CURATED DISCIPLINES',
        subtitle: 'Explore our master categories designed for effortless coordination.',
        categories: ['men', 'women', 'accessories'],
      },
    },
    {
      id: 'sec-new-arrivals-4',
      type: 'new_arrivals',
      title: 'New Arrivals Showcase',
      enabled: true,
      order: 4,
      props: {
        title: 'FRESH OFF THE ATELIER',
        subtitle: 'The latest minimalist pieces cut from premium organic textiles.',
        itemLimit: 4,
      },
    },
    {
      id: 'sec-split-banner-5',
      type: 'split_banner',
      title: 'Dual Editorial Split Banner',
      enabled: true,
      order: 5,
      props: {
        left: {
          title: 'THE TAILORED SUITING',
          subtitle: 'Italian Super 130s Pure Wool',
          link: '/category/men',
          ctaText: 'DISCOVER MENSWEAR',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        },
        right: {
          title: 'THE SILK SILHOUETTES',
          subtitle: 'Mulberry Silk & Drape Shirting',
          link: '/category/women',
          ctaText: 'DISCOVER WOMENSWEAR',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        },
      },
    },
    {
      id: 'sec-featured-6',
      type: 'featured_products',
      title: 'Featured Collection Showcase',
      enabled: true,
      order: 6,
      props: {
        title: 'ICONIC SILHOUETTES',
        subtitle: 'The pieces that define the modern Nexstep aesthetic.',
        itemLimit: 4,
      },
    },
    {
      id: 'sec-best-sellers-7',
      type: 'best_sellers',
      title: 'Best Selling Wardrobe Staples',
      enabled: true,
      order: 7,
      props: {
        title: 'MOST COVETED',
        subtitle: 'Celebrated by our patrons across Dhaka, Chittagong, and globally.',
        itemLimit: 4,
      },
    },
    {
      id: 'sec-curated-coll-8',
      type: 'curated_collections',
      title: 'Curated Seasonal Collections',
      enabled: true,
      order: 8,
      props: {
        title: 'SEASONAL ARCHIVES',
        subtitle: 'Limited run capsule drops engineered around specific textiles and moments.',
      },
    },
    {
      id: 'sec-lookbook-9',
      type: 'lookbook_gallery',
      title: 'Shoppable Editorial Lookbook',
      enabled: true,
      order: 9,
      props: {
        title: 'THE RUNWAY LOOKBOOK',
        subtitle: 'Full styled ensembles captured on location in Saint Martin and Dhaka.',
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        ],
      },
    },
    {
      id: 'sec-promo-strip-10',
      type: 'promotional_banner',
      title: 'Full-Width Architectural Strip',
      enabled: true,
      order: 10,
      props: {
        headline: 'THE ART OF BESPOKE MEASUREMENT',
        subheadline: 'Schedule a private consultation at our Banani Salon for made-to-measure tailoring.',
        ctaText: 'BOOK PRIVATE APPOINTMENT',
        ctaLink: '/contact',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1600&auto=format&fit=crop',
      },
    },
    {
      id: 'sec-brand-story-11',
      type: 'brand_story',
      title: 'Brand Philosophy & Atelier Craft',
      enabled: true,
      order: 11,
      props: {
        tagline: 'THE NEXSTEP ATELIER',
        title: 'ARCHITECTURAL RIGOR MEETS REFINED DRAPERY',
        bodyText: 'Founded with a clear vision: to strip away superfluous fashion noise and create garments of quiet confidence, exceptional tactile quality, and lasting emotional resonance.',
        ctaText: 'EXPLORE OUR PHILOSOPHY',
        ctaLink: '/about',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
      },
    },
    {
      id: 'sec-fabric-craft-12',
      type: 'fabric_craft',
      title: 'Fabric Craftsmanship & Textile Science',
      enabled: true,
      order: 12,
      props: {
        title: 'TACTILE EXCELLENCE',
        subtitle: 'We source exclusively from certified sustainable mills in Biella, Como, and Okayama.',
        fabrics: [
          { name: 'Giza 87 Egyptian Cotton', description: 'Long-staple breathability with unmatched silky handfeel.' },
          { name: 'Super 130s Merino Wool', description: 'Crease-resistant natural thermo-regulation for year-round luxury.' },
          { name: 'Mulberry Silk 22mm', description: 'Weighty drape with subtle organic luster and hypoallergenic touch.' },
        ],
      },
    },
    {
      id: 'sec-trending-13',
      type: 'trending_now',
      title: 'Trending Outfits & Pairings',
      enabled: true,
      order: 13,
      props: {
        title: 'TRENDING IN DHAKA & BEYOND',
        subtitle: 'Pieces currently inspiring our street and salon community.',
        itemLimit: 4,
      },
    },
    {
      id: 'sec-reviews-14',
      type: 'customer_reviews',
      title: 'Client Reviews & Endorsements',
      enabled: true,
      order: 14,
      props: {
        title: 'VOICES OF OUR PATRONS',
        subtitle: 'Authentic words from our valued clients across the country.',
        reviews: [
          {
            author: 'Farhan Rahman',
            city: 'Dhaka',
            quote: 'The cut of the Minimalist Linen Blazer is indistinguishable from Savile Row tailoring. An absolute revelation.',
            stars: 5,
          },
          {
            author: 'Sabrina Islam',
            city: 'Chittagong',
            quote: 'Nexstep Gallery has completely elevated modern Bangladeshi fashion. The Mulberry Silk Dress is sublime.',
            stars: 5,
          },
          {
            author: 'Zubair Ahmed',
            city: 'Sylhet',
            quote: 'Packaging, presentation, customer care, and fabric quality are peerless. Express shipping arrived next day.',
            stars: 5,
          },
        ],
      },
    },
    {
      id: 'sec-value-props-15',
      type: 'value_props',
      title: 'Value Propositions',
      enabled: true,
      order: 15,
      props: {
        items: [
          { icon: 'Truck', title: 'COMPLIMENTARY EXPRESS DELIVERY', description: 'Free delivery in Bangladesh on all orders over ৳3,000.' },
          { icon: 'ShieldCheck', title: 'CERTIFIED ATELIER AUTHENTICITY', description: 'Every textile is mill-certified for pure origin and ethical sourcing.' },
          { icon: 'RotateCcw', title: 'EASY 7-DAY SALON EXCHANGES', description: 'Hassle-free size replacement and courier return pickup.' },
          { icon: 'Lock', title: 'BANK-GRADE SECURE PAYMENTS', description: 'Encrypted checkout via bKash, Nagad, Visa, Mastercard & COD.' },
        ],
      },
    },
    {
      id: 'sec-blog-16',
      type: 'blog_journal',
      title: 'Fashion Journal & Editorial Columns',
      enabled: true,
      order: 16,
      props: {
        title: 'THE FASHION JOURNAL',
        subtitle: 'Dispatches on style, architecture, textile care, and modern lifestyle.',
        limit: 3,
      },
    },
    {
      id: 'sec-instagram-17',
      type: 'instagram_feed',
      title: 'Community Look Gallery',
      enabled: true,
      order: 17,
      props: {
        handle: '@nexstepgallery',
        title: 'WORN BY YOU',
        subtitle: 'Tag #NexstepGallery on Instagram to be featured on our digital salon.',
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop',
        ],
      },
    },
    {
      id: 'sec-newsletter-18',
      type: 'newsletter_signup',
      title: 'VIP Newsletter Circle',
      enabled: true,
      order: 18,
      props: {
        title: 'ENTER THE PRIVATE SALON',
        description: 'Subscribe to receive private invitations to runway debuts, early access to new collections, and sartorial guides.',
        buttonText: 'BECOME A PATRON',
      },
    },
  ];

  const seoSettings = {
    metaTitle: 'Nexstep Gallery | Modern Luxury Fashion & Contemporary Apparel',
    metaDescription: 'Nexstep Gallery curates minimal luxury fashion, tailored menswear, effortless womenswear, and bespoke craftsmanship in Bangladesh.',
    keywords: 'luxury fashion, nexstep gallery, menswear dhaka, womenswear, minimal fashion, silk dresses, tailoring bangladesh',
    ogImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    canonicalBase: 'https://nexstepgallery.com',
    googleAnalyticsId: '',
    facebookPixelId: '',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://nexstepgallery.com/sitemap.xml',
  };

  await prisma.siteCustomization.upsert({
    where: { id: 'default' },
    update: {
      themeSettings: JSON.stringify(themeSettings),
      headerSettings: JSON.stringify(headerSettings),
      footerSettings: JSON.stringify(footerSettings),
      homepageSections: JSON.stringify(homepageSections),
      seoSettings: JSON.stringify(seoSettings),
      draftThemeSettings: JSON.stringify(themeSettings),
      draftHeaderSettings: JSON.stringify(headerSettings),
      draftFooterSettings: JSON.stringify(footerSettings),
      draftHomepageSections: JSON.stringify(homepageSections),
      draftSeoSettings: JSON.stringify(seoSettings),
    },
    create: {
      id: 'default',
      themeSettings: JSON.stringify(themeSettings),
      headerSettings: JSON.stringify(headerSettings),
      footerSettings: JSON.stringify(footerSettings),
      homepageSections: JSON.stringify(homepageSections),
      seoSettings: JSON.stringify(seoSettings),
      draftThemeSettings: JSON.stringify(themeSettings),
      draftHeaderSettings: JSON.stringify(headerSettings),
      draftFooterSettings: JSON.stringify(footerSettings),
      draftHomepageSections: JSON.stringify(homepageSections),
      draftSeoSettings: JSON.stringify(seoSettings),
    },
  });
  console.log('✓ Seeded SiteCustomization with 18 homepage sections, theme, header, footer & SEO');

  console.log('--- ALL CUSTOMIZATION & CATALOG DATA SEEDED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
