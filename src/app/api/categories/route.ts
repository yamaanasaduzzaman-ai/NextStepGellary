import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const parentOnly = searchParams.get('parentOnly') === 'true';

    const where: any = {};
    if (!all) where.isActive = true;
    if (parentOnly) where.parentId = null;

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        subcategories: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('Categories GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
      imageUrl,
      parentId,
      displayOrder = 0,
      isActive = true,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        displayOrder: Number(displayOrder || 0),
        isActive: Boolean(isActive),
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || description || null,
        seoKeywords: seoKeywords || null,
        ogImage: ogImage || imageUrl || null,
      },
      include: {
        parent: true,
        subcategories: true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('Category POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create category' }, { status: 500 });
  }
}
