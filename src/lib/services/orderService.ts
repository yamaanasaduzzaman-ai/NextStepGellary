import prisma from '../prisma';
import { generateOrderNumber } from '../utils';
import { calculateShippingCharge } from '../bangladesh-geo';
import { validateCoupon } from './couponService';

export interface CheckoutInput {
  userId?: string;
  guestToken?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingStreet: string;
  shippingArea?: string;
  shippingDistrict: string;
  shippingDivision: string;
  shippingPostal?: string;
  deliveryInstructions?: string;
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CARD';
  shippingMethod?: 'STANDARD' | 'EXPRESS';
  couponCode?: string;
  customerNotes?: string;
}

export async function createOrder(input: CheckoutInput) {
  const {
    userId,
    guestToken,
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
    shippingMethod = 'STANDARD',
    couponCode,
    customerNotes,
  } = input;

  // 1. Fetch Cart Items
  let cart;
  if (userId) {
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { displayOrder: 'asc' } } } },
            variant: true,
          },
        },
      },
    });
  } else if (guestToken) {
    cart = await prisma.cart.findUnique({
      where: { guestToken },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { displayOrder: 'asc' } } } },
            variant: true,
          },
        },
      },
    });
  }

  if (!cart || cart.items.length === 0) {
    throw new Error('Your shopping cart is empty.');
  }

  // 2. Fetch Store Settings for shipping rules
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
  const insideFee = settings?.insideDhakaShipping ?? 70;
  const outsideFee = settings?.outsideDhakaShipping ?? 130;
  const freeThreshold = settings?.freeShippingThreshold ?? 3000;

  // 3. Compute Subtotal from fresh DB prices (never trust frontend prices!)
  let subtotal = 0;
  for (const item of cart.items) {
    const freshVariant = item.variant;
    const freshProduct = item.product;

    if (!freshVariant || freshProduct.status !== 'PUBLISHED') {
      throw new Error(`Product "${freshProduct.name}" is no longer available.`);
    }

    if (freshVariant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${freshProduct.name}" (${freshVariant.size} - ${freshVariant.color}). Only ${freshVariant.stock} available.`
      );
    }

    const unitPrice = freshVariant.price || freshProduct.salePrice || freshProduct.regularPrice;
    subtotal += unitPrice * item.quantity;
  }

  // 4. Calculate Shipping
  const shippingCalculation = calculateShippingCharge(
    shippingDistrict,
    subtotal,
    freeThreshold,
    insideFee,
    outsideFee
  );
  let shippingCost = shippingCalculation.cost;
  if (shippingMethod === 'EXPRESS') {
    shippingCost += 80; // Express surcharge
  }

  // 5. Coupon validation
  let discountAmount = 0;
  let appliedCoupon: any = null;
  if (couponCode) {
    const couponRes = await validateCoupon(couponCode, subtotal, userId);
    if (couponRes.isValid && couponRes.coupon) {
      appliedCoupon = couponRes.coupon;
      discountAmount = couponRes.discountAmount;
      if (appliedCoupon.discountType === 'FREE_SHIPPING') {
        shippingCost = 0;
      }
    }
  }

  const taxAmount = settings?.vatPercent ? (subtotal * settings.vatPercent) / 100 : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount);
  const orderNumber = generateOrderNumber();

  // 6. Execute atomic database transaction
  const createdOrder = await prisma.$transaction(async (tx) => {
    // A. Deduct stock for each variant and record inventory movement
    for (const item of cart.items) {
      const v = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!v || v.stock < item.quantity) {
        throw new Error(`Item ${item.product.name} ran out of stock during checkout.`);
      }

      const newStock = v.stock - item.quantity;
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          previousStock: v.stock,
          newStock,
          quantityChange: -item.quantity,
          movementType: 'ORDER_DEDUCTION',
          reason: `Purchased in Order ${orderNumber}`,
          performedBy: customerEmail,
        },
      });
    }

    // B. Create the Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        discountAmount,
        shippingCost,
        taxAmount,
        totalAmount,
        orderStatus: 'PENDING',
        paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
        paymentMethod,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        shippingMethod,
        deliveryInstructions,
        shippingStreet,
        shippingArea,
        shippingDistrict,
        shippingDivision,
        shippingPostal,
        customerNotes,
        items: {
          create: cart.items.map((item: any) => {
            const unitPrice =
              item.variant.price || item.product.salePrice || item.product.regularPrice;
            const primaryImg =
              item.product.images.find((img: any) => img.isPrimary)?.url ||
              item.product.images[0]?.url ||
              null;
            return {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              productSku: item.variant.sku,
              size: item.size,
              color: item.color,
              unitPrice,
              quantity: item.quantity,
              totalPrice: unitPrice * item.quantity,
              imageUrl: primaryImg,
            };
          }),
        },
        orderTimeline: {
          create: {
            status: 'PENDING',
            title: 'Order Placed',
            description: `Order successfully initiated via ${paymentMethod}.`,
            actor: customerName,
          },
        },
      },
      include: {
        items: true,
        orderTimeline: true,
      },
    });

    // C. Record Coupon usage if applied
    if (appliedCoupon) {
      await tx.coupon.update({
        where: { id: appliedCoupon.id },
        data: { currentUsage: { increment: 1 } },
      });

      await tx.couponUsage.create({
        data: {
          couponId: appliedCoupon.id,
          userId: userId || null,
          orderId: order.id,
          discount: discountAmount,
        },
      });
    }

    // D. Clear Cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // E. Update Customer Profile spending statistics if registered
    if (userId) {
      await tx.customerProfile.upsert({
        where: { userId },
        update: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: totalAmount },
        },
        create: {
          userId,
          totalOrders: 1,
          totalSpent: totalAmount,
        },
      });
    }

    return order;
  });

  return createdOrder;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  actor = 'Admin',
  note?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error('Order not found');

  const oldStatus = order.orderStatus;
  if (oldStatus === newStatus) return order;

  // Handle inventory restocking if cancelled or returned
  if (
    (newStatus === 'CANCELLED' || newStatus === 'RETURNED') &&
    oldStatus !== 'CANCELLED' &&
    oldStatus !== 'RETURNED'
  ) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId) {
          const v = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (v) {
            const restoredStock = v.stock + item.quantity;
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: restoredStock },
            });

            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                previousStock: v.stock,
                newStock: restoredStock,
                quantityChange: item.quantity,
                movementType:
                  newStatus === 'CANCELLED' ? 'ORDER_CANCELLED_RESTOCK' : 'RETURN_RESTOCK',
                reason: `Restocked due to Order ${order.orderNumber} ${newStatus}`,
                performedBy: actor,
              },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newStatus,
          paymentStatus: newStatus === 'CANCELLED' && order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: newStatus,
          title: `Status changed to ${newStatus}`,
          description: note || `Order updated by ${actor}`,
          actor,
        },
      });
    });
  } else {
    // Normal status transition
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newStatus,
          paymentStatus: newStatus === 'DELIVERED' && order.paymentMethod === 'COD' ? 'PAID' : order.paymentStatus,
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId,
          status: newStatus,
          title: `Status marked as ${newStatus}`,
          description: note || `Order status updated to ${newStatus}`,
          actor,
        },
      });
    });
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, orderTimeline: true, payments: true, shipment: true },
  });
}
