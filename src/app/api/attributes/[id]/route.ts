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

    const { name, type, values } = await request.json();

    const attribute = await prisma.productAttribute.update({
      where: { id: params.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(type ? { type: type.toUpperCase() } : {}),
        ...(values !== undefined
          ? { values: typeof values === 'string' ? values : JSON.stringify(values) }
          : {}),
      },
    });

    return NextResponse.json({ success: true, attribute });
  } catch (err: any) {
    console.error('Attribute PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update attribute' }, { status: 500 });
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

    await prisma.productAttribute.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Attribute deleted successfully' });
  } catch (err: any) {
    console.error('Attribute DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete attribute' }, { status: 500 });
  }
}
