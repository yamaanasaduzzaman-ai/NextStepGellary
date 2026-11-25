import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, location, items, isActive } = await request.json();

    const menu = await prisma.navigationMenu.update({
      where: { id: params.id },
      data: {
        ...(name ? { name } : {}),
        ...(location ? { location } : {}),
        ...(items !== undefined ? { items: typeof items === 'string' ? items : JSON.stringify(items) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, menu });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update navigation menu' }, { status: 500 });
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

    await prisma.navigationMenu.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Navigation menu deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete navigation menu' }, { status: 500 });
  }
}
