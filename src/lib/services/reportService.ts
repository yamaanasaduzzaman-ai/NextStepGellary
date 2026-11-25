import prisma from '../prisma';

export interface DashboardStatsFilter {
  period?: 'today' | '7days' | '30days' | 'this_month' | 'all';
}

export async function getDashboardStats(filter: DashboardStatsFilter = {}) {
  const { period = '30days' } = filter;

  const now = new Date();
  let startDate: Date | undefined;

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7days') {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30days') {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

  // Aggregate orders
  const [
    totalOrders,
    periodOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers,
    totalProducts,
    allVariants,
    recentOrders,
    paidOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: dateFilter }),
    prisma.order.count({ where: { orderStatus: 'PENDING' } }),
    prisma.order.count({ where: { orderStatus: 'CONFIRMED' } }),
    prisma.order.count({ where: { orderStatus: 'PROCESSING' } }),
    prisma.order.count({ where: { orderStatus: 'SHIPPED' } }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
    prisma.productVariant.findMany({ select: { stock: true } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      select: {
        totalAmount: true,
        subtotal: true,
        discountAmount: true,
        shippingCost: true,
        taxAmount: true,
        paymentMethod: true,
        createdAt: true,
      },
    }),
  ]);

  // Financial sums
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalGrossSales = paidOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalDiscounts = paidOrders.reduce((acc, o) => acc + o.discountAmount, 0);
  const totalShippingRevenue = paidOrders.reduce((acc, o) => acc + o.shippingCost, 0);

  // Today's specific sales
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayPaid = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: { gte: todayStart },
    },
    select: { totalAmount: true },
  });
  const todaySales = todayPaid.reduce((acc, o) => acc + o.totalAmount, 0);

  // Low stock counter
  const lowStockThreshold = 10;
  const lowStockCount = allVariants.filter((v) => v.stock <= lowStockThreshold).length;

  // Payment method breakdown
  const paymentBreakdown: Record<string, number> = {};
  paidOrders.forEach((o) => {
    paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + o.totalAmount;
  });

  // Top selling products by order items
  const orderItems = await prisma.orderItem.findMany({
    take: 100,
    select: {
      productName: true,
      quantity: true,
      totalPrice: true,
      imageUrl: true,
    },
  });

  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; image?: string }> = {};
  orderItems.forEach((item) => {
    if (!productSalesMap[item.productName]) {
      productSalesMap[item.productName] = {
        name: item.productName,
        quantity: 0,
        revenue: 0,
        image: item.imageUrl || undefined,
      };
    }
    productSalesMap[item.productName].quantity += item.quantity;
    productSalesMap[item.productName].revenue += item.totalPrice;
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    period,
    totalRevenue,
    todaySales,
    totalGrossSales,
    totalDiscounts,
    totalShippingRevenue,
    totalOrders,
    periodOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    paymentBreakdown,
    topSellingProducts,
    recentOrders,
  };
}
