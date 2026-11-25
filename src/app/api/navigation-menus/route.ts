import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    const where: any = {};
    if (location) where.location = location;

    const menus = await prisma.navigationMenu.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ menus });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch navigation menus' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, location = 'HEADER', items, isActive = true } = await request.json();

    if (!name || !items) {
      return NextResponse.json({ error: 'Name and items are required' }, { status: 400 });
    }

    const menu = await prisma.navigationMenu.create({
      data: {
        name,
        location,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, menu });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create navigation menu' }, { status: 500 });
  }
}
