import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, contact } = body;

    if (!orderNumber || !contact) {
      return NextResponse.json(
        { error: 'Order number and either email or phone number are required.' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: cleanOrderNumber,
        OR: [
          { customerEmail: cleanContact },
          { customerPhone: cleanContact },
        ],
      },
      select: {
        orderNumber: true,
        customerName: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        shippingDistrict: true,
        shippingDivision: true,
        totalAmount: true,
        shipment: {
          select: {
            courierProvider: true,
            trackingCode: true,
            status: true,
          },
        },
        orderTimeline: {
          select: {
            status: true,
            title: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        items: {
          select: {
            productName: true,
            size: true,
            color: true,
            quantity: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'No order found matching the provided order number and contact detail.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
