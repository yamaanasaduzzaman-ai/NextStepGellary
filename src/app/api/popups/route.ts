import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where: any = {};
    if (!all) where.isActive = true;

    const popups = await prisma.popup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ popups });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch popups' }, { status: 500 });
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
      title,
      type = 'WELCOME',
      heading,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      delaySeconds = 3,
      frequency = 'ONCE_PER_SESSION',
      targetPages = 'ALL',
      startDate,
      endDate,
      isActive = true,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Popup title is required' }, { status: 400 });
    }

    const popup = await prisma.popup.create({
      data: {
        title,
        type,
        heading,
        description,
        imageUrl,
        ctaText,
        ctaLink,
        delaySeconds: Number(delaySeconds || 3),
        frequency,
        targetPages,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, popup });
  } catch (err: any) {
    console.error('Popup POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create popup' }, { status: 500 });
  }
}
