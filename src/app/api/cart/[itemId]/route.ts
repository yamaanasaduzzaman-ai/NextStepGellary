import { NextResponse } from 'next/server';
import { updateCartItemQuantity, removeCartItem } from '@/lib/services/cartService';

export async function PUT(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json({ error: 'Quantity is required' }, { status: 400 });
    }

    const updated = await updateCartItemQuantity(params.itemId, Number(quantity));
    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update cart item' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    await removeCartItem(params.itemId);
    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove cart item' },
      { status: 400 }
    );
  }
}
