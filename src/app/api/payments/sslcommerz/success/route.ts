import { NextResponse } from 'next/server';
import { verifyAndFinalizePayment } from '@/lib/services/paymentService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleSslCommerz(request);
}

export async function GET(request: Request) {
  return handleSslCommerz(request);
}

async function handleSslCommerz(request: Request) {
  try {
    let tran_id = '';
    let val_id = '';
    let card_type = 'VISA';

    if (request.method === 'POST') {
      const formData = await request.formData();
      tran_id = (formData.get('tran_id') as string) || '';
      val_id = (formData.get('val_id') as string) || '';
      card_type = (formData.get('card_type') as string) || 'CARD';
    } else {
      const { searchParams } = new URL(request.url);
      tran_id = searchParams.get('tran_id') || '';
      val_id = searchParams.get('val_id') || '';
      card_type = searchParams.get('card_type') || 'CARD';
    }

    if (!tran_id) {
      return NextResponse.redirect(new URL('/checkout?payment_error=invalid_transaction', request.url));
    }

    const order = await verifyAndFinalizePayment(tran_id, 'SSLCOMMERZ', {
      valId: val_id,
      cardType: card_type,
      verifiedVia: 'SSLCommerz Gateway Callback',
    });

    if (!order) {
      return NextResponse.redirect(new URL('/checkout?payment_error=order_not_found', request.url));
    }

    return NextResponse.redirect(new URL(`/order-confirmation/${order.orderNumber}?status=success`, request.url));
  } catch (error: any) {
    console.error('SSLCommerz callback error:', error);
    return NextResponse.redirect(new URL('/checkout?payment_error=verification_failed', request.url));
  }
}
