import { NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';
import { adjustVariantStock } from '@/lib/services/inventoryService';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { variantId, quantityChange, reason } = body;

    if (!variantId || quantityChange === undefined) {
      return NextResponse.json(
        { error: 'Variant ID and quantity change are required.' },
        { status: 400 }
      );
    }

    const result = await adjustVariantStock({
      variantId,
      quantityChange: Number(quantityChange),
      reason: reason || 'Manual stock reconciliation',
      performedBy: session.name || session.email,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Inventory adjust error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust stock' },
      { status: 400 }
    );
  }
}
