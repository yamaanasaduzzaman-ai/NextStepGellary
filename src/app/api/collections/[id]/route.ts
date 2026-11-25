import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            regularPrice: true,
            images: { take: 1 },
          },
        },
        _count: { select: { products: true } },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
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
      description,
      bannerImage,
      isFeatured,
      isActive,
      displayOrder,
      startDate,
      endDate,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      productIds,
    } = body;

    const collection = await prisma.$transaction(async (tx) => {
      const updated = await tx.collection.update({
        where: { id: params.id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(slug ? { slug: slug.trim() } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(bannerImage !== undefined ? { bannerImage } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
          ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
          ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
          ...(seoTitle !== undefined ? { seoTitle } : {}),
          ...(seoDescription !== undefined ? { seoDescription } : {}),
          ...(seoKeywords !== undefined ? { seoKeywords } : {}),
          ...(ogImage !== undefined ? { ogImage } : {}),
        },
      });

      if (Array.isArray(productIds)) {
        // Disassociate existing products
        await tx.product.updateMany({
          where: { collectionId: params.id },
          data: { collectionId: null },
        });

        if (productIds.length > 0) {
          await tx.product.updateMany({
            where: { id: { in: productIds } },
            data: { collectionId: params.id },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ success: true, collection });
  } catch (err: any) {
    console.error('Collection PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update collection' }, { status: 500 });
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

    await prisma.product.updateMany({
      where: { collectionId: params.id },
      data: { collectionId: null },
    });

    await prisma.collection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Collection deleted successfully' });
  } catch (err: any) {
    console.error('Collection DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete collection' }, { status: 500 });
  }
}
