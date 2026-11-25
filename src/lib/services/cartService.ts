import prisma from '../prisma';

export async function getOrCreateCart(userId?: string, guestToken?: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { displayOrder: 'asc' } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: 'asc' } } },
              },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }

  if (guestToken) {
    let cart = await prisma.cart.findUnique({
      where: { guestToken },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { displayOrder: 'asc' } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { guestToken },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: 'asc' } } },
              },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }

  throw new Error('Either userId or guestToken is required to access cart');
}

export async function addToCart(
  cartIdentifier: { userId?: string; guestToken?: string },
  variantId: string,
  quantity = 1
) {
  const cart = await getOrCreateCart(cartIdentifier.userId, cartIdentifier.guestToken);

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) throw new Error('Product variant not found');
  if (variant.product.status !== 'PUBLISHED') throw new Error('Product is currently not available');

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
  });

  const desiredQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  if (desiredQuantity > variant.stock) {
    throw new Error(`Only ${variant.stock} units available in stock for ${variant.size} - ${variant.color}`);
  }

  const effectivePrice = variant.price || variant.product.salePrice || variant.product.regularPrice;

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: desiredQuantity,
        unitPrice: effectivePrice,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: variant.productId,
      variantId,
      quantity,
      size: variant.size,
      color: variant.color,
      unitPrice: effectivePrice,
    },
  });
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: true },
  });

  if (!item) throw new Error('Cart item not found');
  if (quantity > item.variant.stock) {
    throw new Error(`Cannot add more than available stock (${item.variant.stock})`);
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

export async function removeCartItem(itemId: string) {
  return prisma.cartItem.delete({ where: { id: itemId } });
}

export async function mergeGuestCartIntoUser(userId: string, guestToken: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { guestToken },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart(userId);

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: userCart.id,
          variantId: item.variantId,
        },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          unitPrice: item.unitPrice,
        },
      });
    }
  }

  // Delete guest cart
  await prisma.cart.delete({ where: { id: guestCart.id } });
}
