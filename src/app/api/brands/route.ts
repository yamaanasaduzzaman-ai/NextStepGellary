import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where: any = {};
    if (!all) where.isActive = true;

    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ brands });
  } catch (err: any) {
    console.error('Brands GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, logoUrl, website, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description || null,
        logoUrl: logoUrl || null,
        website: website || null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, brand });
  } catch (err: any) {
    console.error('Brand POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create brand' }, { status: 500 });
  }
}
