import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
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
    const { name, slug, description, logoUrl, website, isActive } = body;

    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(slug ? { slug: slug.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(website !== undefined ? { website } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, brand });
  } catch (err: any) {
    console.error('Brand PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update brand' }, { status: 500 });
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
      where: { brandId: params.id },
      data: { brandId: null },
    });

    await prisma.brand.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (err: any) {
    console.error('Brand DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete brand' }, { status: 500 });
  }
}
