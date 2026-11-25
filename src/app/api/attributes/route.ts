import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const attributes = await prisma.productAttribute.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ attributes });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch product attributes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, type, values } = await request.json();

    if (!name || !type || !values) {
      return NextResponse.json({ error: 'Name, type, and values are required' }, { status: 400 });
    }

    const attribute = await prisma.productAttribute.create({
      data: {
        name: name.trim(),
        type: type.toUpperCase(),
        values: typeof values === 'string' ? values : JSON.stringify(values),
      },
    });

    return NextResponse.json({ success: true, attribute });
  } catch (err: any) {
    console.error('Attribute POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create attribute' }, { status: 500 });
  }
}
