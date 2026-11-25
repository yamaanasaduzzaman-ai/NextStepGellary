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

    const body = await request.json();
    const {
      title,
      type,
      heading,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      delaySeconds,
      frequency,
      targetPages,
      startDate,
      endDate,
      isActive,
    } = body;

    const popup = await prisma.popup.update({
      where: { id: params.id },
      data: {
        ...(title ? { title } : {}),
        ...(type ? { type } : {}),
        ...(heading !== undefined ? { heading } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(ctaText !== undefined ? { ctaText } : {}),
        ...(ctaLink !== undefined ? { ctaLink } : {}),
        ...(delaySeconds !== undefined ? { delaySeconds: Number(delaySeconds) } : {}),
        ...(frequency ? { frequency } : {}),
        ...(targetPages ? { targetPages } : {}),
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, popup });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update popup' }, { status: 500 });
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

    await prisma.popup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Popup deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete popup' }, { status: 500 });
  }
}
