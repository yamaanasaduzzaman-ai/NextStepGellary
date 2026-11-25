import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/services/productService';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const collectionSlug = searchParams.get('collection') || undefined;
    const gender = searchParams.get('gender') || undefined;
    const brandSlug = searchParams.get('brand') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const subcategoryId = searchParams.get('subcategoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const size = searchParams.get('size') || undefined;
    const color = searchParams.get('color') || undefined;
    const isFeatured = searchParams.get('featured') === 'true' ? true : undefined;
    const isNewArrival = searchParams.get('new') === 'true' ? true : undefined;
    const isBestSeller = searchParams.get('bestseller') === 'true' ? true : undefined;
    const sort = (searchParams.get('sort') as any) || 'newest';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;
    const adminView = searchParams.get('admin') === 'true';

    const result = await getProducts({
      query,
      categorySlug,
      collectionSlug,
      brandSlug,
      brandId,
      subcategoryId,
      gender,
      minPrice,
      maxPrice,
      size,
      color,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
      sort,
      page,
      limit,
      adminView,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Products API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      shortDescription,
      gender = 'UNISEX',
      status = 'PUBLISHED',
      productType = 'Physical',
      regularPrice,
      salePrice,
      costPrice,
      taxPercent = 0,
      saleStartDate,
      saleEndDate,
      fabric,
      fit,
      pattern,
      careInstructions,
      origin = 'Bangladesh',
      weight,
      categoryId,
      subcategoryId,
      collectionId,
      brandId,
      tags,
      lowStockThreshold = 10,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      canonicalUrl,
      noIndex = false,
      isFeatured = false,
      isNewArrival = true,
      isBestSeller = false,
      images = [],
      variants = [],
    } = body;

    if (!name || !sku || !regularPrice || !description) {
      return NextResponse.json(
        { error: 'Name, SKU, regular price, and description are required.' },
        { status: 400 }
      );
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          slug: generatedSlug,
          sku,
          description,
          shortDescription,
          gender,
          status,
          productType,
          regularPrice: Number(regularPrice),
          salePrice: salePrice ? Number(salePrice) : null,
          costPrice: costPrice ? Number(costPrice) : null,
          taxPercent: Number(taxPercent || 0),
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
          discountPercent:
            salePrice && salePrice < regularPrice
              ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
              : null,
          fabric,
          fit,
          pattern,
          careInstructions,
          origin,
          weight: weight ? Number(weight) : null,
          categoryId: categoryId || null,
          subcategoryId: subcategoryId || null,
          collectionId: collectionId || null,
          brandId: brandId || null,
          tags: Array.isArray(tags) ? tags.join(', ') : tags,
          lowStockThreshold: Number(lowStockThreshold || 10),
          seoTitle: seoTitle || name,
          seoDescription: seoDescription || shortDescription || description?.slice(0, 160),
          seoKeywords,
          ogImage: ogImage || images[0]?.url || null,
          canonicalUrl,
          noIndex: Boolean(noIndex),
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller),
          images: {
            create: images.map((img: any, idx: number) => ({
              url: img.url,
              altText: img.altText || name,
              colorTag: img.colorTag || null,
              isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
              displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx + 1,
            })),
          },
          variants: {
            create: variants.map((v: any) => ({
              sku: v.sku || `${sku}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, ''),
              size: v.size,
              color: v.color,
              colorHex: v.colorHex || '#111111',
              price: v.price ? Number(v.price) : null,
              stock: Number(v.stock || 0),
              barcode: v.barcode || null,
              imageUrl: v.imageUrl || null,
              isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
            })),
          },
        },
        include: {
          variants: true,
          images: true,
          brand: true,
          category: true,
          collection: true,
        },
      });

      // Record initial inventory movements
      for (const variant of created.variants) {
        if (variant.stock > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId: created.id,
              variantId: variant.id,
              previousStock: 0,
              newStock: variant.stock,
              quantityChange: variant.stock,
              movementType: 'MANUAL_ADDITION',
              reason: 'Initial stock intake upon product creation',
              performedBy: session.name,
            },
          });
        }
      }

      return created;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Products API POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
