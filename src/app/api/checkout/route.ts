import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createOrder } from '@/lib/services/orderService';
import { processPayment } from '@/lib/services/paymentService';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingArea,
      shippingDistrict,
      shippingDivision,
      shippingPostal,
      deliveryInstructions,
      paymentMethod,
      shippingMethod,
      couponCode,
      customerNotes,
      guestToken,
    } = body;

    // Server-side validation
    if (!customerName || !customerEmail || !customerPhone || !shippingStreet || !shippingDistrict || !shippingDivision) {
      return NextResponse.json(
        { error: 'Please fill in all required customer and delivery address fields.' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Please select a valid payment method.' },
        { status: 400 }
      );
    }

    // 1. Create Order with atomic transaction and stock deduction
    const order = await createOrder({
      userId: session?.userId,
      guestToken,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingStreet: shippingStreet.trim(),
      shippingArea: shippingArea ? shippingArea.trim() : undefined,
      shippingDistrict: shippingDistrict.trim(),
      shippingDivision: shippingDivision.trim(),
      shippingPostal: shippingPostal ? shippingPostal.trim() : undefined,
      deliveryInstructions: deliveryInstructions ? deliveryInstructions.trim() : undefined,
      paymentMethod,
      shippingMethod,
      couponCode,
      customerNotes,
    });

    // 2. Process / Initialize Payment
    const paymentResult = await processPayment(order.id, paymentMethod);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      redirectUrl: paymentResult.redirectUrl,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed. Please try again.' },
      { status: 400 }
    );
  }
}
