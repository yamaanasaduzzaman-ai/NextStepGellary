import prisma from '../prisma';

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: any;
  discountAmount: number;
  message?: string;
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon || !coupon.isActive) {
    return { isValid: false, discountAmount: 0, message: 'Invalid or inactive promotional code.' };
  }

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) {
    return { isValid: false, discountAmount: 0, message: 'This promotion has not started yet.' };
  }

  if (coupon.endDate && coupon.endDate < now) {
    return { isValid: false, discountAmount: 0, message: 'This promotional code has expired.' };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Minimum order amount of ৳${coupon.minOrderAmount} required for this coupon.`,
    };
  }

  if (coupon.totalUsageLimit && coupon.currentUsage >= coupon.totalUsageLimit) {
    return { isValid: false, discountAmount: 0, message: 'This coupon has reached its total usage limit.' };
  }

  if (userId && coupon.perUserLimit) {
    const userUsages = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsages >= coupon.perUserLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'You have already used this coupon code.',
      };
    }
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'FIXED_AMOUNT') {
    discount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === 'FREE_SHIPPING') {
    discount = 0; // Handled as shipping discount in checkout
  }

  return {
    isValid: true,
    coupon,
    discountAmount: Math.round(discount),
    message: 'Promotional code applied successfully!',
  };
}
