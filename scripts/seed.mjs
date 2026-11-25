import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Nexstep Gallery database...');

  // 1. Initial Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Nexstep Gallery',
      currency: 'BDT',
      currencySymbol: '৳',
      contactEmail: 'support@nexstepgallery.com',
      contactPhone: '+880 1700-112233',
      address: 'Plot 14, Road 11, Banani / Gulshan, Dhaka 1213, Bangladesh',
      insideDhakaShipping: 70,
      outsideDhakaShipping: 130,
      freeShippingThreshold: 3000,
      enableCod: true,
      enableBkash: true,
      enableNagad: true,
      enableSslcommerz: true,
      vatPercent: 0,
    },
  });

  // 2. Initial Super Admin & Demo Customer
  const adminPasswordHash = await bcrypt.hash('AdminPassword2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexstepgallery.com' },
    update: {},
    create: {
      email: 'admin@nexstepgallery.com',
      passwordHash: adminPasswordHash,
      name: 'Nexstep Super Admin',
      phone: '+8801700000001',
      role: 'SUPER_ADMIN',
      isActive: true,
      adminProfile: {
        create: {
          department: 'Executive Operations',
          title: 'Managing Director & Platform Architect',
          permissions: 'ALL',
        },
      },
    },
  });

  const customerPasswordHash = await bcrypt.hash('CustomerPassword2026!', 10);
  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@nexstepgallery.com' },
    update: {},
    create: {
      email: 'customer@nexstepgallery.com',
      passwordHash: customerPasswordHash,
      name: 'Tanvir Hossain',
      phone: '+8801811223344',
      role: 'CUSTOMER',
      isActive: true,
      customerProfile: {
        create: {
          gender: 'MEN',
          loyaltyPoints: 120,
        },
      },
      addresses: {
        create: {
          name: 'Tanvir Hossain',
          phone: '+8801811223344',
          street: 'House 42, Road 7, Sector 3',
          area: 'Uttara',
          district: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1230',
          isDefault: true,
          addressType: 'SHIPPING',
        },
      },
    },
  });

  // 3. Categories
  const categoriesData = [
    {
      name: 'Men',
      slug: 'men',
      description: 'Sophisticated contemporary apparel tailored for modern gentlemen.',
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
      displayOrder: 1,
    },
    {
      name: 'Women',
      slug: 'women',
      description: 'Refined modern luxury silhouettes for effortless elegance.',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      displayOrder: 2,
    },
    {
      name: 'Panjabi',
      slug: 'panjabi',
      description: 'Heritage craftsmanship fused with minimalist modern tailoring.',
      imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800&auto=format&fit=crop',
      displayOrder: 3,
    },
    {
      name: 'Shirts',
      slug: 'shirts',
      description: 'Crisp luxury cotton and breathable linen shirting.',
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
      displayOrder: 4,
    },
    {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Heavyweight organic cotton staples with architectural drape.',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      displayOrder: 5,
    },
    {
      name: 'Trousers',
      slug: 'trousers',
      description: 'Precision-cut trousers engineered for sharp poise and comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
      displayOrder: 6,
    },
    {
      name: 'Jackets',
      slug: 'jackets',
      description: 'Tailored blazers, light trench coats, and luxury outerwear.',
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
      displayOrder: 7,
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Handcrafted leather goods and sculptural lifestyle essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      displayOrder: 8,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = record.id;
  }

  // 4. Collections
  const collectionsData = [
    {
      name: 'The Monochrome Edition 2026',
      slug: 'monochrome-edition-2026',
      description: 'Purity of form in deep obsidian black, off-white, and warm beige tones.',
      bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1400&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: 'Heritage Silk & Linen Collection',
      slug: 'heritage-silk-linen',
      description: 'Intricate loom textures and artisanal finishes designed for celebrations.',
      bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1400&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: 'Architectural Tailoring',
      slug: 'architectural-tailoring',
      description: 'Structured silhouettes and understated opulence.',
      bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop',
      isFeatured: false,
    },
  ];

  const collectionMap = {};
  for (const col of collectionsData) {
    const record = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: col,
      create: col,
    });
    collectionMap[col.slug] = record.id;
  }

  // 5. Products & Product Variants
  const products = [
    {
      name: 'The Obsidian Silk-Cotton Panjabi',
      slug: 'the-obsidian-silk-cotton-panjabi',
      sku: 'NXG-PAN-001',
      shortDescription: 'Luxurious raw silk and Supima cotton blend with handcrafted minimalist collar.',
      description: 'The Obsidian Panjabi reimagines classical South Asian tailoring through a strictly contemporary architectural lens. Spun from a sumptuous blend of mulberry silk and long-staple Supima cotton, this piece features an unembellished mandarin band collar, covered placket with matte gunmetal buttons, and a razor-sharp straight cut that drapes effortlessly. Designed for festive gatherings and evening poise.',
      gender: 'MEN',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      regularPrice: 6850,
      salePrice: 5950,
      costPrice: 2800,
      discountPercent: 13,
      fabric: '70% Mulberry Silk, 30% Supima Cotton',
      fit: 'Tailored Slim Fit',
      pattern: 'Solid Matte Weave',
      careInstructions: 'Dry clean only. Cool iron over damp cloth.',
      origin: 'Bangladesh',
      weight: 0.45,
      categoryId: categoryMap['panjabi'],
      collectionId: collectionMap['heritage-silk-linen'],
      tags: 'Panjabi, Silk, Men, Festive, Minimalist',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop',
          altText: 'Obsidian Silk-Cotton Panjabi Front View',
          isPrimary: true,
          displayOrder: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
          altText: 'Obsidian Silk-Cotton Panjabi Detail View',
          isPrimary: false,
          displayOrder: 2,
        },
      ],
      variants: [
        { sku: 'NXG-PAN-001-BLK-M', size: 'M (40)', color: 'Obsidian Black', colorHex: '#111111', stock: 25 },
        { sku: 'NXG-PAN-001-BLK-L', size: 'L (42)', color: 'Obsidian Black', colorHex: '#111111', stock: 30 },
        { sku: 'NXG-PAN-001-BLK-XL', size: 'XL (44)', color: 'Obsidian Black', colorHex: '#111111', stock: 15 },
        { sku: 'NXG-PAN-001-IVR-M', size: 'M (40)', color: 'Ivory White', colorHex: '#F8F7F4', stock: 20 },
        { sku: 'NXG-PAN-001-IVR-L', size: 'L (42)', color: 'Ivory White', colorHex: '#F8F7F4', stock: 18 },
      ],
    },
    {
      name: 'Egyptian Giza Cotton Formal Shirt',
      slug: 'egyptian-giza-cotton-formal-shirt',
      sku: 'NXG-SHT-002',
      shortDescription: 'Single-needle stitched 120s 2-ply Egyptian cotton dress shirt.',
      description: 'Tailored from prized 120-thread-count Egyptian Giza cotton, this dress shirt exhibits unrivaled softness, natural luster, and enduring resilience. Precision semi-spread collar reinforced with removable mother-of-pearl stays. French-cuff finishing and split back yoke ensure unrestricted movement from boardrooms to twilight galas.',
      gender: 'MEN',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      regularPrice: 4250,
      salePrice: 3850,
      costPrice: 1650,
      discountPercent: 9,
      fabric: '100% Egyptian Giza Cotton',
      fit: 'Custom Modern Fit',
      pattern: 'Micro-Twill Weave',
      careInstructions: 'Machine wash warm, hang dry, medium steam iron.',
      origin: 'Bangladesh',
      weight: 0.35,
      categoryId: categoryMap['shirts'],
      collectionId: collectionMap['monochrome-edition-2026'],
      tags: 'Formal, Shirt, Giza Cotton, Premium',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
          altText: 'Egyptian Giza Cotton Formal Shirt in Off-White',
          isPrimary: true,
          displayOrder: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop',
          altText: 'Collar and Cuff Detail',
          isPrimary: false,
          displayOrder: 2,
        },
      ],
      variants: [
        { sku: 'NXG-SHT-002-WHT-S', size: 'S (15)', color: 'Crisp White', colorHex: '#FFFFFF', stock: 15 },
        { sku: 'NXG-SHT-002-WHT-M', size: 'M (15.5)', color: 'Crisp White', colorHex: '#FFFFFF', stock: 35 },
        { sku: 'NXG-SHT-002-WHT-L', size: 'L (16)', color: 'Crisp White', colorHex: '#FFFFFF', stock: 28 },
        { sku: 'NXG-SHT-002-WHT-XL', size: 'XL (16.5)', color: 'Crisp White', colorHex: '#FFFFFF', stock: 12 },
        { sku: 'NXG-SHT-002-SKY-M', size: 'M (15.5)', color: 'Subtle Sky Blue', colorHex: '#D6E4EE', stock: 22 },
        { sku: 'NXG-SHT-002-SKY-L', size: 'L (16)', color: 'Subtle Sky Blue', colorHex: '#D6E4EE', stock: 19 },
      ],
    },
    {
      name: 'Architectural Heavyweight Boxy T-Shirt',
      slug: 'architectural-heavyweight-boxy-tshirt',
      sku: 'NXG-TSH-003',
      shortDescription: '280 GSM heavyweight organic combed cotton with dropped shoulders.',
      description: 'A masterclass in proportions. Crafted from custom-knitted 280 GSM combed organic jersey that retains its sculptural silhouette wash after wash. Seamless ribbed mock neck band, high-density stitching, and drop-shoulder profile create an effortless luxury streetwear profile.',
      gender: 'UNISEX',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      regularPrice: 1950,
      salePrice: 1650,
      costPrice: 750,
      discountPercent: 15,
      fabric: '100% Organic Combed Cotton (280 GSM)',
      fit: 'Boxy Relaxed Oversized',
      pattern: 'Solid Vintage Enzyme Wash',
      careInstructions: 'Machine wash cold inside out. Do not tumble dry.',
      origin: 'Bangladesh',
      weight: 0.38,
      categoryId: categoryMap['t-shirts'],
      collectionId: collectionMap['monochrome-edition-2026'],
      tags: 'T-Shirt, Heavyweight, Streetwear, Oversized',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
          altText: 'Heavyweight T-Shirt Front View',
          isPrimary: true,
          displayOrder: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
          altText: 'Heavyweight T-Shirt Fabric Texture',
          isPrimary: false,
          displayOrder: 2,
        },
      ],
      variants: [
        { sku: 'NXG-TSH-003-BLK-S', size: 'S', color: 'Deep Charcoal Black', colorHex: '#181818', stock: 40 },
        { sku: 'NXG-TSH-003-BLK-M', size: 'M', color: 'Deep Charcoal Black', colorHex: '#181818', stock: 50 },
        { sku: 'NXG-TSH-003-BLK-L', size: 'L', color: 'Deep Charcoal Black', colorHex: '#181818', stock: 45 },
        { sku: 'NXG-TSH-003-BGE-M', size: 'M', color: 'Warm Alabaster Beige', colorHex: '#E8E2D7', stock: 30 },
        { sku: 'NXG-TSH-003-BGE-L', size: 'L', color: 'Warm Alabaster Beige', colorHex: '#E8E2D7', stock: 25 },
      ],
    },
    {
      name: 'Single-Pleated Italian Wool-Blend Trousers',
      slug: 'single-pleated-italian-wool-blend-trousers',
      sku: 'NXG-TRS-004',
      shortDescription: 'Mid-rise tailored trousers with forward single pleat and side tab adjusters.',
      description: 'Crafted with fine tropical-weight wool blended with stretch elastane for thermal elegance across seasons. Designed with traditional gurkha side waist adjusters eliminating the need for a belt, crisp front pleats, and a gently tapered silhouette ending in a clean ankle break.',
      gender: 'MEN',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      regularPrice: 4850,
      salePrice: 4400,
      costPrice: 1950,
      discountPercent: 9,
      fabric: '65% Fine Wool, 33% Viscose, 2% Elastane',
      fit: 'Relaxed Tapered Fit',
      pattern: 'Solid Micro Weave',
      careInstructions: 'Dry clean recommended.',
      origin: 'Bangladesh',
      weight: 0.55,
      categoryId: categoryMap['trousers'],
      collectionId: collectionMap['architectural-tailoring'],
      tags: 'Trousers, Tailored, Wool, Gurkha, Formal',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
          altText: 'Pleated Trousers Front View',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
      variants: [
        { sku: 'NXG-TRS-004-CHR-30', size: '30 Waist', color: 'Heather Charcoal', colorHex: '#333333', stock: 14 },
        { sku: 'NXG-TRS-004-CHR-32', size: '32 Waist', color: 'Heather Charcoal', colorHex: '#333333', stock: 28 },
        { sku: 'NXG-TRS-004-CHR-34', size: '34 Waist', color: 'Heather Charcoal', colorHex: '#333333', stock: 22 },
        { sku: 'NXG-TRS-004-SND-32', size: '32 Waist', color: 'Sahara Sand', colorHex: '#D2B48C', stock: 16 },
        { sku: 'NXG-TRS-004-SND-34', size: '34 Waist', color: 'Sahara Sand', colorHex: '#D2B48C', stock: 12 },
      ],
    },
    {
      name: 'Double-Breasted Cashmere Blend Overcoat',
      slug: 'double-breasted-cashmere-blend-overcoat',
      sku: 'NXG-JKT-005',
      shortDescription: 'Hand-tailored double-breasted coat in insulating cashmere and melton wool.',
      description: 'An iconic cold-weather investment. Cut in a dramatic peak-lapel double-breasted stance with horn buttons, fully lined with silk cupro, and featuring hand-finished bound interior seams. Sculpted shoulders convey authority while maintaining fluid drape.',
      gender: 'UNISEX',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      regularPrice: 12500,
      salePrice: 11200,
      costPrice: 5100,
      discountPercent: 10,
      fabric: '85% Melton Wool, 15% Cashmere',
      fit: 'Structured Editorial Fit',
      pattern: 'Solid Melton Weave',
      careInstructions: 'Specialist dry clean only.',
      origin: 'Bangladesh',
      weight: 1.4,
      categoryId: categoryMap['jackets'],
      collectionId: collectionMap['architectural-tailoring'],
      tags: 'Overcoat, Cashmere, Luxury, Outerwear',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
          altText: 'Cashmere Blend Overcoat Editorial Stance',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
      variants: [
        { sku: 'NXG-JKT-005-MID-M', size: 'M (38-40)', color: 'Midnight Onyx', colorHex: '#0B0B0C', stock: 8 },
        { sku: 'NXG-JKT-005-MID-L', size: 'L (42)', color: 'Midnight Onyx', colorHex: '#0B0B0C', stock: 10 },
        { sku: 'NXG-JKT-005-CML-M', size: 'M (38-40)', color: 'Raw Camel', colorHex: '#C19A6B', stock: 6 },
        { sku: 'NXG-JKT-005-CML-L', size: 'L (42)', color: 'Raw Camel', colorHex: '#C19A6B', stock: 7 },
      ],
    },
    {
      name: 'Pure Mulberry Silk Evening Ensemble',
      slug: 'pure-mulberry-silk-evening-ensemble',
      sku: 'NXG-WMN-007',
      shortDescription: 'Exquisite handwoven mulberry silk coordinates with delicate zardozi border.',
      description: 'Designed exclusively for festive luxury. Hand-spun mulberry silk woven on traditional pit looms, featuring an understated self-embossed texture and finished with hand-embroidered metallic thread borders. Ethereal, shimmering, and timelessly graceful.',
      gender: 'WOMEN',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      regularPrice: 14500,
      salePrice: 13200,
      costPrice: 6200,
      discountPercent: 9,
      fabric: '100% Handloom Mulberry Silk',
      fit: 'Fluid Draped Fit',
      pattern: 'Handwoven Self Jacquard',
      careInstructions: 'Dry clean only. Store wrapped in muslin cloth.',
      origin: 'Bangladesh',
      weight: 0.8,
      categoryId: categoryMap['women'],
      collectionId: collectionMap['heritage-silk-linen'],
      tags: 'Women, Silk, Festive, Luxury, Handloom',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
          altText: 'Mulberry Silk Evening Ensemble',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
      variants: [
        { sku: 'NXG-WMN-007-CHA-FS', size: 'Standard Size', color: 'Champagne Gold', colorHex: '#E5D3B3', stock: 12 },
        { sku: 'NXG-WMN-007-ROS-FS', size: 'Standard Size', color: 'Dusty Rose Quartz', colorHex: '#D8A0A6', stock: 9 },
      ],
    },
    {
      name: 'Handcrafted Full-Grain Leather Attache',
      slug: 'handcrafted-full-grain-leather-attache',
      sku: 'NXG-ACC-008',
      shortDescription: 'Vegetable-tanned full-grain cowhide briefcase with antique brass hardware.',
      description: 'Meticulously crafted by master leather artisans using 100% vegetable-tanned full-grain cowhide that develops a rich, individual patina with age. Padded compartment fits up to 16-inch laptops, equipped with Swiss-engineered YKK Excella zippers, suede lining, and a detachable ergonomic leather strap.',
      gender: 'UNISEX',
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      regularPrice: 8500,
      salePrice: 7800,
      costPrice: 3400,
      discountPercent: 8,
      fabric: '100% Full Grain Vegetable-Tanned Leather',
      fit: 'Structured Luggage',
      pattern: 'Natural Full Grain',
      careInstructions: 'Condition with natural beeswax leather balm periodically.',
      origin: 'Bangladesh',
      weight: 1.2,
      categoryId: categoryMap['accessories'],
      collectionId: collectionMap['monochrome-edition-2026'],
      tags: 'Leather, Briefcase, Handcrafted, Accessories',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
          altText: 'Full Grain Leather Attache',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
      variants: [
        { sku: 'NXG-ACC-008-ESP-OS', size: 'One Size (16" L x 12" H)', color: 'Espresso Brown', colorHex: '#3D2817', stock: 15 },
        { sku: 'NXG-ACC-008-BLK-OS', size: 'One Size (16" L x 12" H)', color: 'Onyx Black', colorHex: '#141414', stock: 18 },
      ],
    },
  ];

  for (const prod of products) {
    const { images, variants, ...prodData } = prod;
    const existing = await prisma.product.findUnique({ where: { slug: prodData.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...prodData,
          images: {
            create: images,
          },
          variants: {
            create: variants,
          },
        },
      });

      // Record initial inventory movement for each variant
      const createdVariants = await prisma.productVariant.findMany({ where: { productId: created.id } });
      for (const v of createdVariants) {
        await prisma.inventoryMovement.create({
          data: {
            productId: created.id,
            variantId: v.id,
            previousStock: 0,
            newStock: v.stock,
            quantityChange: v.stock,
            movementType: 'PURCHASE',
            reason: 'Initial stock intake from factory atelier',
            performedBy: 'Nexstep Inventory Admin',
          },
        });
      }

      // Add a couple of initial verified reviews
      await prisma.review.create({
        data: {
          productId: created.id,
          userId: demoCustomer.id,
          authorName: 'Tanvir H.',
          rating: 5,
          title: 'Unmatched drape and tailored perfection',
          comment: 'The craftsmanship on this piece is truly international standard. The fabric feels luxurious and the finishing is immaculate. Highly recommended!',
          isVerifiedPurchase: true,
          isApproved: true,
        },
      });
    }
  }

  // 6. Promotional Banners
  const banners = [
    {
      title: 'THE MONOCHROME EDIT 2026',
      subtitle: 'Sculptural silhouettes, unyielding craftsmanship, and pure luxury fabrics.',
      ctaText: 'EXPLORE COLLECTION',
      ctaLink: '/shop?filter=featured',
      desktopImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop',
      placement: 'HERO',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'HERITAGE FESTIVE CRAFT',
      subtitle: 'Pure mulberry silks and handloom linens tailored for unforgettable moments.',
      ctaText: 'SHOP FESTIVE',
      ctaLink: '/shop?category=panjabi',
      desktopImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
      placement: 'HERO',
      displayOrder: 2,
      isActive: true,
    },
    {
      title: 'COMPLIMENTARY SHIPPING ACROSS BANGLADESH',
      subtitle: 'Enjoy express doorstep delivery on all orders above ৳3,000.',
      ctaText: 'SHOP NEW ARRIVALS',
      ctaLink: '/shop?filter=new',
      desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      placement: 'PROMOTIONAL',
      displayOrder: 1,
      isActive: true,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  // 7. Announcements
  const announcements = [
    { text: 'ELEVATE YOUR WARDROBE — ENJOY FREE EXPRESS DELIVERY OVER ৳3,000', link: '/shop', displayOrder: 1 },
    { text: 'NEW ARRIVALS: MONOCHROME 2026 COLLECTION NOW LIVE', link: '/shop?filter=new', displayOrder: 2 },
    { text: 'USE COUPON "NEXSTEP10" FOR 10% OFF YOUR FIRST ORDER', link: '/shop', displayOrder: 3 },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }

  // 8. Coupons
  await prisma.coupon.upsert({
    where: { code: 'NEXSTEP10' },
    update: {},
    create: {
      code: 'NEXSTEP10',
      description: '10% off on your entire purchase (up to ৳1,000 off)',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 2000,
      maxDiscount: 1000,
      totalUsageLimit: 500,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT500' },
    update: {},
    create: {
      code: 'FLAT500',
      description: 'Flat ৳500 discount on orders above ৳4,000',
      discountType: 'FIXED_AMOUNT',
      discountValue: 500,
      minOrderAmount: 4000,
      totalUsageLimit: 200,
      perUserLimit: 1,
      isActive: true,
    },
  });

  // 9. Blog / Fashion Journal
  const blogs = [
    {
      title: 'The Art of Modern Minimalist Dressing',
      slug: 'art-of-modern-minimalist-dressing',
      summary: 'Why restrained palettes, impeccable proportions, and architectural drape define the new era of luxury.',
      coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
      content: `In a world inundated with fleeting micro-trends, quiet luxury speaks the loudest. True sophistication lies in the confidence of simplicity—where the quality of the fabric, the precision of the seam, and the natural posture of the wearer take precedence over ostentatious logos.

When selecting wardrobe cornerstones, focus on fiber authenticity: Mulberry silk that catches ambient light with a whisper rather than a glare, long-staple Egyptian cotton that softens gracefully with each wear, and tropical-weight wool with natural drape.

At Nexstep Gallery, every garment begins with an architectural study of silhouette. We craft pieces designed not just for a season, but as enduring companions in your personal journey of taste.`,
      author: 'Nexstep Atelier',
    },
    {
      title: 'Caring for Fine Silk & Handloom Textiles',
      slug: 'caring-for-fine-silk-handloom-textiles',
      summary: 'A curated guide to preserving the luster, structure, and heritage of your investment garments.',
      coverImage: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop',
      content: `Handcrafted and silk textiles are living artifacts of human dexterity. Caring for them requires deliberate, gentle rituals.

1. Avoid Direct Sunlight: Silk fibers are susceptible to UV discoloration. Store in breathable muslin bags rather than synthetic plastic.
2. Steam Over Direct Iron: Never apply a scorched hot flat iron directly to raw silk. Use a gentle vertical garment steamer or iron inside out over a cotton pressing cloth.
3. Rotation: Allow natural fibers 24 to 48 hours of rest between wears to regain their inherent elastic memory.`,
      author: 'Nexstep Atelier',
    },
  ];

  for (const bl of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: bl.slug },
      update: bl,
      create: bl,
    });
  }

  // 10. FAQs
  const faqs = [
    {
      question: 'What are your delivery charges and timelines in Bangladesh?',
      answer: 'We provide Standard Delivery inside Dhaka within 24-48 hours for ৳70, and across all other 63 districts within 48-72 hours for ৳130. Orders exceeding ৳3,000 qualify for complimentary delivery.',
      category: 'SHIPPING',
      displayOrder: 1,
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support Cash on Delivery (COD), bKash, Nagad, and all major debit/credit cards (Visa, MasterCard, American Express) via secure SSLCommerz encryption.',
      category: 'PAYMENTS',
      displayOrder: 2,
    },
    {
      question: 'What is your Return & Exchange policy?',
      answer: 'We offer a hassle-free 7-day return and exchange policy for unworn, unwashed items in their original packaging with tags intact. You can initiate a request directly from your Customer Account dashboard.',
      category: 'RETURNS',
      displayOrder: 3,
    },
    {
      question: 'How do I determine my correct size?',
      answer: 'Each product page features an in-depth Size Guide with chest, waist, length, and shoulder measurements in both inches and centimeters. If you are between sizes, we recommend sizing up for our relaxed silhouettes or reaching out to our stylists via WhatsApp.',
      category: 'SIZING',
      displayOrder: 4,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  // 11. Initial Sample Real Order (to give dashboard instant authentic metrics)
  const panjabiVariant = await prisma.productVariant.findFirst({
    where: { sku: 'NXG-PAN-001-BLK-M' },
    include: { product: true },
  });

  if (panjabiVariant) {
    const existingOrder = await prisma.order.findUnique({ where: { orderNumber: 'NXG-2026-1001' } });
    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'NXG-2026-1001',
          userId: demoCustomer.id,
          customerName: 'Tanvir Hossain',
          customerEmail: 'customer@nexstepgallery.com',
          customerPhone: '+8801811223344',
          subtotal: 5950,
          discountAmount: 500,
          shippingCost: 0,
          taxAmount: 0,
          totalAmount: 5450,
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
          paymentMethod: 'BKASH',
          shippingMethod: 'STANDARD',
          shippingStreet: 'House 42, Road 7, Sector 3',
          shippingArea: 'Uttara',
          shippingDistrict: 'Dhaka',
          shippingDivision: 'Dhaka',
          shippingPostal: '1230',
          items: {
            create: [
              {
                productId: panjabiVariant.productId,
                variantId: panjabiVariant.id,
                productName: panjabiVariant.product.name,
                productSku: panjabiVariant.sku,
                size: panjabiVariant.size,
                color: panjabiVariant.color,
                unitPrice: 5950,
                quantity: 1,
                totalPrice: 5950,
                imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop',
              },
            ],
          },
          payments: {
            create: {
              amount: 5450,
              gateway: 'BKASH',
              status: 'SUCCESS',
              transactionId: 'TRX-BKASH-88291039',
              verifiedAt: new Date(),
            },
          },
          shipment: {
            create: {
              courierProvider: 'STEADFAST',
              consignmentId: 'ST-902148',
              trackingCode: 'TRACK-BD-9021',
              status: 'DELIVERED',
              deliveredAt: new Date(),
            },
          },
          orderTimeline: {
            create: [
              {
                status: 'CONFIRMED',
                title: 'Order Placed & Verified',
                description: 'Payment authorized via bKash Merchant Gateway.',
                actor: 'System',
              },
              {
                status: 'SHIPPED',
                title: 'Dispatched via Steadfast Courier',
                description: 'Consignment ID: ST-902148',
                actor: 'Store Manager',
              },
              {
                status: 'DELIVERED',
                title: 'Delivered to Customer',
                description: 'Handed over to customer with signature confirmation.',
                actor: 'Courier',
              },
            ],
          },
        },
      });

      // Update customer metrics
      await prisma.customerProfile.update({
        where: { userId: demoCustomer.id },
        data: {
          totalOrders: 1,
          totalSpent: 5450,
        },
      });
    }
  }

  console.log('Database seeded successfully with luxury catalog, demo customer, admin, and initial data!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
