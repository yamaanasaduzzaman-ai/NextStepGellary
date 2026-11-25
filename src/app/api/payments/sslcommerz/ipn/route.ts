import { NextResponse } from 'next/server';
import { verifyAndFinalizePayment } from '@/lib/services/paymentService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tran_id = (formData.get('tran_id') as string) || '';
    const status = (formData.get('status') as string) || '';
    const val_id = (formData.get('val_id') as string) || '';
    const card_type = (formData.get('card_type') as string) || '';

    if (status === 'VALID' || status === 'VALIDATED') {
      await verifyAndFinalizePayment(tran_id, 'SSLCOMMERZ', {
        valId: val_id,
        cardType: card_type,
        ipnNotification: true,
      });
      return NextResponse.json({ status: 'IPN_SUCCESS' });
    }

    return NextResponse.json({ status: 'IPN_IGNORED' });
  } catch (error: any) {
    console.error('SSLCommerz IPN error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
