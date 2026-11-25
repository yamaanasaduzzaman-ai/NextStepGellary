import { NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';
import { getDashboardStats } from '@/lib/services/reportService';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as any) || '30days';

    const stats = await getDashboardStats({ period });
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
