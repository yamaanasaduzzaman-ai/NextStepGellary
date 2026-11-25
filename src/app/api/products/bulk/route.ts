import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, ids } = await request.json();

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Action and product ids array are required.' }, { status: 400 });
    }

    if (action === 'PUBLISH') {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { status: 'PUBLISHED' },
      });
      return NextResponse.json({ success: true, count: ids.length, message: `Published ${ids.length} products.` });
    }

    if (action === 'DRAFT') {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { status: 'DRAFT' },
      });
      return NextResponse.json({ success: true, count: ids.length, message: `Set ${ids.length} products to Draft.` });
    }

    if (action === 'ARCHIVE') {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ARCHIVED' },
      });
      return NextResponse.json({ success: true, count: ids.length, message: `Archived ${ids.length} products.` });
    }

    if (action === 'DELETE') {
      // Find which products have orders
      const productsWithOrders = await prisma.orderItem.findMany({
        where: { productId: { in: ids } },
        select: { productId: true },
        distinct: ['productId'],
      });
      const orderProductIds = new Set(productsWithOrders.map((p) => p.productId));

      const safeToDeleteIds = ids.filter((id) => !orderProductIds.has(id));
      const mustArchiveIds = ids.filter((id) => orderProductIds.has(id));

      if (mustArchiveIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: mustArchiveIds } },
          data: { status: 'ARCHIVED' },
        });
      }

      if (safeToDeleteIds.length > 0) {
        await prisma.product.deleteMany({
          where: { id: { in: safeToDeleteIds } },
        });
      }

      return NextResponse.json({
        success: true,
        deleted: safeToDeleteIds.length,
        archived: mustArchiveIds.length,
        message: `Deleted ${safeToDeleteIds.length} products. Archived ${mustArchiveIds.length} products that have existing customer order records.`,
      });
    }

    return NextResponse.json({ error: 'Invalid bulk action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk products error:', error);
    return NextResponse.json({ error: error.message || 'Bulk action failed' }, { status: 500 });
  }
}
