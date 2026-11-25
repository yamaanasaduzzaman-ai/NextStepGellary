import { NextResponse } from 'next/server';
import { verifyAndFinalizePayment } from '@/lib/services/paymentService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trxID = searchParams.get('trxID');
    const status = searchParams.get('status');

    if (status !== 'success' || !trxID) {
      return NextResponse.redirect(new URL('/checkout?payment_error=bkash_failed', request.url));
    }

    const order = await verifyAndFinalizePayment(trxID, 'BKASH', {
      gatewayStatus: status,
      verifiedVia: 'bKash Merchant Sandbox/Live Callback',
    });

    if (!order) {
      return NextResponse.redirect(new URL('/checkout?payment_error=order_not_found', request.url));
    }

    return NextResponse.redirect(new URL(`/order-confirmation/${order.orderNumber}?status=success`, request.url));
  } catch (error: any) {
    console.error('bKash callback error:', error);
    return NextResponse.redirect(new URL('/checkout?payment_error=verification_failed', request.url));
  }
}
