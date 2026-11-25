import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        subcategories: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
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
      imageUrl,
      parentId,
      displayOrder,
      isActive,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
    } = body;

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(slug ? { slug: slug.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
        ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(seoTitle !== undefined ? { seoTitle } : {}),
        ...(seoDescription !== undefined ? { seoDescription } : {}),
        ...(seoKeywords !== undefined ? { seoKeywords } : {}),
        ...(ogImage !== undefined ? { ogImage } : {}),
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    console.error('Category PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update category' }, { status: 500 });
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

    // Set categoryId to null on associated products to preserve products
    await prisma.product.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: null },
    });

    // Also update any child subcategories parentId to null
    await prisma.category.updateMany({
      where: { parentId: params.id },
      data: { parentId: null },
    });

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    console.error('Category DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
