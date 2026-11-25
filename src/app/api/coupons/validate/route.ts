import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { validateCoupon } from '@/lib/services/couponService';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required.' }, { status: 400 });
    }

    const result = await validateCoupon(code, Number(subtotal) || 0, session?.userId);

    if (!result.isValid) {
      return NextResponse.json(
        { isValid: false, message: result.message || 'Invalid coupon code' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
