import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'District',
      'Division',
      'Subtotal',
      'Discount',
      'Shipping',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString().slice(0, 10),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      o.customerEmail,
      o.shippingDistrict,
      o.shippingDivision,
      o.subtotal,
      o.discountAmount,
      o.shippingCost,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nexstep_orders_export.csv"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 });
  }
}
