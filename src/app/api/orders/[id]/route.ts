import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/services/orderService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        items: true,
        orderTimeline: { orderBy: { createdAt: 'desc' } },
        payments: true,
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security: Only allow owner of order or staff/admin to view details
    if (order.userId && (!session || (session.userId !== order.userId && !isStaffOrAdmin(session.role)))) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await updateOrderStatus(params.id, status, session.name, note);
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
