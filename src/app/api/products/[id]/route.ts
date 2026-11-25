import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        collection: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' } },
        inventoryMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      gender,
      status,
      productType,
      regularPrice,
      salePrice,
      costPrice,
      taxPercent,
      saleStartDate,
      saleEndDate,
      fabric,
      fit,
      pattern,
      careInstructions,
      origin,
      weight,
      categoryId,
      subcategoryId,
      collectionId,
      brandId,
      tags,
      lowStockThreshold,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      canonicalUrl,
      noIndex,
      isFeatured,
      isNewArrival,
      isBestSeller,
      images,
      variants,
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true, images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update basic product fields
      const regP = regularPrice !== undefined ? Number(regularPrice) : existingProduct.regularPrice;
      const saleP = salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : existingProduct.salePrice;
      const discountPercent =
        saleP && regP && saleP < regP
          ? Math.round(((regP - saleP) / regP) * 100)
          : null;

      const product = await tx.product.update({
        where: { id: params.id },
        data: {
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(sku ? { sku } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(shortDescription !== undefined ? { shortDescription } : {}),
          ...(gender ? { gender } : {}),
          ...(status ? { status } : {}),
          ...(productType ? { productType } : {}),
          ...(regularPrice !== undefined ? { regularPrice: regP } : {}),
          ...(salePrice !== undefined ? { salePrice: saleP } : {}),
          discountPercent,
          ...(costPrice !== undefined ? { costPrice: costPrice ? Number(costPrice) : null } : {}),
          ...(taxPercent !== undefined ? { taxPercent: Number(taxPercent || 0) } : {}),
          ...(saleStartDate !== undefined ? { saleStartDate: saleStartDate ? new Date(saleStartDate) : null } : {}),
          ...(saleEndDate !== undefined ? { saleEndDate: saleEndDate ? new Date(saleEndDate) : null } : {}),
          ...(fabric !== undefined ? { fabric } : {}),
          ...(fit !== undefined ? { fit } : {}),
          ...(pattern !== undefined ? { pattern } : {}),
          ...(careInstructions !== undefined ? { careInstructions } : {}),
          ...(origin !== undefined ? { origin } : {}),
          ...(weight !== undefined ? { weight: weight ? Number(weight) : null } : {}),
          ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
          ...(subcategoryId !== undefined ? { subcategoryId: subcategoryId || null } : {}),
          ...(collectionId !== undefined ? { collectionId: collectionId || null } : {}),
          ...(brandId !== undefined ? { brandId: brandId || null } : {}),
          ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags.join(', ') : tags } : {}),
          ...(lowStockThreshold !== undefined ? { lowStockThreshold: Number(lowStockThreshold || 10) } : {}),
          ...(seoTitle !== undefined ? { seoTitle } : {}),
          ...(seoDescription !== undefined ? { seoDescription } : {}),
          ...(seoKeywords !== undefined ? { seoKeywords } : {}),
          ...(ogImage !== undefined ? { ogImage } : {}),
          ...(canonicalUrl !== undefined ? { canonicalUrl } : {}),
          ...(noIndex !== undefined ? { noIndex: Boolean(noIndex) } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
          ...(isNewArrival !== undefined ? { isNewArrival: Boolean(isNewArrival) } : {}),
          ...(isBestSeller !== undefined ? { isBestSeller: Boolean(isBestSeller) } : {}),
        },
      });

      // 2. Handle Images update if provided
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: any, idx: number) => ({
              productId: params.id,
              url: img.url,
              altText: img.altText || name || product.name,
              colorTag: img.colorTag || null,
              isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : idx === 0,
              displayOrder: img.displayOrder !== undefined ? Number(img.displayOrder) : idx + 1,
            })),
          });
        }
      }

      // 3. Handle Variants update if provided
      if (Array.isArray(variants)) {
        const existingVariantMap = new Map(existingProduct.variants.map((v) => [v.id, v]));
        const keptVariantIds = new Set<string>();

        for (const v of variants) {
          if (v.id && existingVariantMap.has(v.id)) {
            // Update existing variant
            keptVariantIds.add(v.id);
            const oldV = existingVariantMap.get(v.id)!;
            const newStock = Number(v.stock ?? oldV.stock);

            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sku: v.sku || oldV.sku,
                size: v.size || oldV.size,
                color: v.color || oldV.color,
                colorHex: v.colorHex || oldV.colorHex,
                price: v.price ? Number(v.price) : null,
                stock: newStock,
                barcode: v.barcode || null,
                imageUrl: v.imageUrl || null,
                isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
              },
            });

            // Log inventory movement if stock changed
            if (newStock !== oldV.stock) {
              await tx.inventoryMovement.create({
                data: {
                  productId: params.id,
                  variantId: v.id,
                  previousStock: oldV.stock,
                  newStock,
                  quantityChange: newStock - oldV.stock,
                  movementType: 'MANUAL_ADJUSTMENT',
                  reason: `Admin updated stock from ${oldV.stock} to ${newStock}`,
                  performedBy: session.name,
                },
              });
            }
          } else {
            // Create new variant
            const createdV = await tx.productVariant.create({
              data: {
                productId: params.id,
                sku: v.sku || `${product.sku}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, ''),
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || '#111111',
                price: v.price ? Number(v.price) : null,
                stock: Number(v.stock || 0),
                barcode: v.barcode || null,
                imageUrl: v.imageUrl || null,
                isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
              },
            });

            keptVariantIds.add(createdV.id);

            if (createdV.stock > 0) {
              await tx.inventoryMovement.create({
                data: {
                  productId: params.id,
                  variantId: createdV.id,
                  previousStock: 0,
                  newStock: createdV.stock,
                  quantityChange: createdV.stock,
                  movementType: 'MANUAL_ADDITION',
                  reason: 'Initial stock intake for new variant',
                  performedBy: session.name,
                },
              });
            }
          }
        }

        // Delete variants that were removed by admin
        for (const oldV of existingProduct.variants) {
          if (!keptVariantIds.has(oldV.id)) {
            // Check if variant is linked to orders before deleting
            const orderItemCount = await tx.orderItem.count({ where: { variantId: oldV.id } });
            if (orderItemCount === 0) {
              await tx.productVariant.delete({ where: { id: oldV.id } });
            } else {
              // Soft-disable availability instead of hard deleting
              await tx.productVariant.update({
                where: { id: oldV.id },
                data: { isAvailable: false, stock: 0 },
              });
            }
          }
        }
      }

      return tx.product.findUnique({
        where: { id: params.id },
        include: {
          category: true,
          collection: true,
          brand: true,
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
        },
      });
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Check if product is referenced in existing orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (orderItemsCount > 0) {
      // Historical order records exist: Must archive to protect financial integrity!
      await prisma.product.update({
        where: { id: params.id },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message:
          'Product is referenced in existing orders and has been safely ARCHIVED instead of permanently deleted to preserve historical order & accounting records.',
      });
    }

    if (permanent) {
      await prisma.product.delete({
        where: { id: params.id },
      });
      return NextResponse.json({
        success: true,
        message: 'Product permanently deleted from database.',
      });
    } else {
      await prisma.product.update({
        where: { id: params.id },
        data: { status: 'ARCHIVED' },
      });
      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Product archived successfully.',
      });
    }
  } catch (error: any) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete/archive product' }, { status: 500 });
  }
}
