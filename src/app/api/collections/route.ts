import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where: any = {};
    if (!all) where.isActive = true;

    const collections = await prisma.collection.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ collections });
  } catch (err: any) {
    console.error('Collections GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
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
      description,
      bannerImage,
      isFeatured = false,
      isActive = true,
      displayOrder = 0,
      startDate,
      endDate,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      productIds = [],
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const collection = await prisma.$transaction(async (tx) => {
      const created = await tx.collection.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          description: description || null,
          bannerImage: bannerImage || null,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          displayOrder: Number(displayOrder || 0),
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          seoTitle: seoTitle || name,
          seoDescription: seoDescription || description || null,
          seoKeywords: seoKeywords || null,
          ogImage: ogImage || bannerImage || null,
        },
      });

      if (Array.isArray(productIds) && productIds.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: productIds } },
          data: { collectionId: created.id },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, collection });
  } catch (err: any) {
    console.error('Collection POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create collection' }, { status: 500 });
  }
}
