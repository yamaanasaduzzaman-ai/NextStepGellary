import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const original = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: 'Original product not found' }, { status: 404 });
    }

    const copySuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const newSku = `${original.sku}-COPY-${copySuffix}`;
    const newSlug = `${original.slug}-copy-${copySuffix}`;
    const newName = `${original.name} (Copy)`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const copy = await tx.product.create({
        data: {
          name: newName,
          slug: newSlug,
          sku: newSku,
          description: original.description,
          shortDescription: original.shortDescription,
          gender: original.gender,
          status: 'DRAFT',
          productType: original.productType,
          regularPrice: original.regularPrice,
          salePrice: original.salePrice,
          costPrice: original.costPrice,
          discountPercent: original.discountPercent,
          taxPercent: original.taxPercent,
          fabric: original.fabric,
          fit: original.fit,
          pattern: original.pattern,
          careInstructions: original.careInstructions,
          origin: original.origin,
          weight: original.weight,
          categoryId: original.categoryId,
          subcategoryId: original.subcategoryId,
          collectionId: original.collectionId,
          brandId: original.brandId,
          tags: original.tags,
          lowStockThreshold: original.lowStockThreshold,
          seoTitle: original.seoTitle,
          seoDescription: original.seoDescription,
          seoKeywords: original.seoKeywords,
          ogImage: original.ogImage,
          canonicalUrl: original.canonicalUrl,
          noIndex: original.noIndex,
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: false,
          images: {
            create: original.images.map((img) => ({
              url: img.url,
              altText: img.altText,
              colorTag: img.colorTag,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
            })),
          },
          variants: {
            create: original.variants.map((v) => ({
              sku: `${v.sku}-CP${copySuffix}`,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              price: v.price,
              stock: v.stock,
              barcode: v.barcode ? `${v.barcode}-${copySuffix}` : null,
              imageUrl: v.imageUrl,
              isAvailable: v.isAvailable,
            })),
          },
        },
        include: {
          variants: true,
          images: true,
        },
      });

      // Record initial inventory movements for duplicated variants
      for (const variant of copy.variants) {
        if (variant.stock > 0) {
          await tx.inventoryMovement.create({
            data: {
              productId: copy.id,
              variantId: variant.id,
              previousStock: 0,
              newStock: variant.stock,
              quantityChange: variant.stock,
              movementType: 'MANUAL_ADDITION',
              reason: `Initial stock intake for duplicated product (copied from ${original.sku})`,
              performedBy: session.name,
            },
          });
        }
      }

      return copy;
    });

    return NextResponse.json({
      success: true,
      message: `Product successfully duplicated as draft: ${newName}`,
      product: duplicated,
    });
  } catch (error: any) {
    console.error('Duplicate product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to duplicate product' },
      { status: 500 }
    );
  }
}
