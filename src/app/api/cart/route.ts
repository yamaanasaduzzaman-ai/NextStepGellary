import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getOrCreateCart, addToCart } from '@/lib/services/cartService';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get('guestToken') || undefined;

    if (!session && !guestToken) {
      return NextResponse.json({ items: [], subtotal: 0, totalItems: 0 });
    }

    const cart = await getOrCreateCart(session?.userId, guestToken);

    const subtotal = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return NextResponse.json({
      cartId: cart.id,
      items: cart.items,
      subtotal,
      totalItems,
    });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { variantId, quantity = 1, guestToken } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 });
    }

    const item = await addToCart(
      { userId: session?.userId, guestToken },
      variantId,
      Number(quantity)
    );

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add item to cart' },
      { status: 400 }
    );
  }
}
