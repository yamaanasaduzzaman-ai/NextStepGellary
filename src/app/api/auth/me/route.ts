import { NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        customerProfile: true,
        adminProfile: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        isStaff: isStaffOrAdmin(user.role),
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
