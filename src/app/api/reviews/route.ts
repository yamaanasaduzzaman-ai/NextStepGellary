import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { productId, authorName, rating, title, comment } = body;

    if (!productId || !authorName || !rating || !comment) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    // Check if verified purchase
    let isVerifiedPurchase = false;
    if (session?.userId) {
      const pastOrder = await prisma.order.findFirst({
        where: {
          userId: session.userId,
          paymentStatus: 'PAID',
          items: { some: { productId } },
        },
      });
      if (pastOrder) isVerifiedPurchase = true;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session?.userId || null,
        authorName: authorName.trim(),
        rating: Number(rating),
        title: title ? title.trim() : null,
        comment: comment.trim(),
        isVerifiedPurchase,
        isApproved: false, // Subject to moderation
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted and pending editorial approval.',
    });
  } catch (error: any) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, isApproved } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}
