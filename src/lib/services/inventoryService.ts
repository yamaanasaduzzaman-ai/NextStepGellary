import prisma from '../prisma';

export async function adjustVariantStock(params: {
  variantId: string;
  quantityChange: number;
  reason: string;
  performedBy: string;
}) {
  const { variantId, quantityChange, reason, performedBy } = params;

  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) throw new Error('Variant not found');

    const previousStock = variant.stock;
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      throw new Error(`Cannot reduce stock below zero. Current stock is ${previousStock}`);
    }

    const updatedVariant = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        productId: variant.productId,
        variantId: variant.id,
        previousStock,
        newStock,
        quantityChange,
        movementType: quantityChange > 0 ? 'MANUAL_ADDITION' : 'MANUAL_DEDUCTION',
        reason,
        performedBy,
      },
    });

    return { variant: updatedVariant, movement };
  });
}

export async function getInventoryOverview() {
  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        },
      },
    },
    orderBy: { stock: 'asc' },
  });

  const totalStockUnits = variants.reduce((acc, v) => acc + v.stock, 0);
  const totalValuation = variants.reduce((acc, v) => {
    const unitCost = v.product.costPrice || v.product.regularPrice * 0.5;
    return acc + unitCost * v.stock;
  }, 0);

  const lowStockThreshold = 10;
  const lowStockItems = variants.filter((v) => v.stock > 0 && v.stock <= lowStockThreshold);
  const outOfStockItems = variants.filter((v) => v.stock === 0);

  return {
    variants,
    totalStockUnits,
    totalValuation: Math.round(totalValuation),
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    lowStockItems,
    outOfStockItems,
  };
}

export async function getInventoryMovements(limit = 50) {
  return prisma.inventoryMovement.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, sku: true } },
      variant: { select: { sku: true, size: true, color: true } },
    },
  });
}
