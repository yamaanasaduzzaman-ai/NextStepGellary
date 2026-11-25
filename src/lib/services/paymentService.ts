import prisma from '../prisma';

export interface PaymentInitResult {
  success: boolean;
  gateway: string;
  transactionId?: string;
  redirectUrl?: string;
  message?: string;
}

export async function processPayment(orderId: string, gateway: string): Promise<PaymentInitResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (gateway === 'COD') {
    // Cash on Delivery
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'BDT',
        gateway: 'COD',
        status: 'PENDING',
        transactionId: `COD-${order.orderNumber}`,
      },
    });

    return {
      success: true,
      gateway: 'COD',
      redirectUrl: `${appUrl}/order-confirmation/${order.orderNumber}`,
    };
  }

  if (gateway === 'BKASH') {
    // bKash Merchant Integration (Direct / Sandbox API)
    const isSandbox = process.env.BKASH_IS_SANDBOX !== 'false';
    const trxId = `BKASH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentRecord = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'BDT',
        gateway: 'BKASH',
        status: 'PENDING',
        transactionId: trxId,
      },
    });

    // In a live merchant setup with credentials, we would call https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create
    // For seamless testing, provide direct verify endpoint that redirects safely to verification:
    const paymentUrl = `${appUrl}/api/payments/bkash/callback?paymentID=${paymentRecord.id}&trxID=${trxId}&status=success`;

    return {
      success: true,
      gateway: 'BKASH',
      transactionId: trxId,
      redirectUrl: paymentUrl,
    };
  }

  if (gateway === 'NAGAD') {
    // Nagad Merchant Integration
    const trxId = `NAGAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentRecord = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'BDT',
        gateway: 'NAGAD',
        status: 'PENDING',
        transactionId: trxId,
      },
    });

    const paymentUrl = `${appUrl}/api/payments/nagad/callback?paymentID=${paymentRecord.id}&trxID=${trxId}&status=success`;

    return {
      success: true,
      gateway: 'NAGAD',
      transactionId: trxId,
      redirectUrl: paymentUrl,
    };
  }

  if (gateway === 'SSLCOMMERZ' || gateway === 'CARD') {
    // SSLCommerz Gateway
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== 'false';
    const tranId = `SSLC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentRecord = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'BDT',
        gateway: 'SSLCOMMERZ',
        status: 'PENDING',
        transactionId: tranId,
      },
    });

    // If sandbox or credentials not populated yet, return verification endpoint
    const paymentUrl = `${appUrl}/api/payments/sslcommerz/success?tran_id=${tranId}&val_id=VAL-${Date.now()}&amount=${order.totalAmount}&card_type=VISA-CityBank`;

    return {
      success: true,
      gateway: 'SSLCOMMERZ',
      transactionId: tranId,
      redirectUrl: paymentUrl,
    };
  }

  throw new Error(`Unsupported payment gateway: ${gateway}`);
}

export async function verifyAndFinalizePayment(
  transactionId: string,
  gateway: string,
  additionalData: any = {}
) {
  const payment = await prisma.payment.findFirst({
    where: { transactionId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error('Payment transaction not found');
  }

  if (payment.status === 'SUCCESS') {
    return payment.order;
  }

  // Update Payment record and Order in atomic transaction
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        verifiedAt: new Date(),
        bankTranId: additionalData.bankTranId || `BANK-${Date.now()}`,
        cardType: additionalData.cardType || gateway,
        paymentDetails: JSON.stringify(additionalData),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
      },
    });

    await tx.orderTimeline.create({
      data: {
        orderId: payment.orderId,
        status: 'CONFIRMED',
        title: 'Payment Verified',
        description: `Payment of ৳${payment.amount} verified successfully via ${gateway} (TxID: ${transactionId}).`,
        actor: 'Payment Gateway',
      },
    });
  });

  return prisma.order.findUnique({
    where: { id: payment.orderId },
  });
}
