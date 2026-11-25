import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(status && status !== 'ALL' ? { status } : {}),
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'SKU',
      'Name',
      'Slug',
      'Category',
      'Brand',
      'Gender',
      'Product Type',
      'Regular Price (BDT)',
      'Sale Price (BDT)',
      'Cost Price (BDT)',
      'Status',
      'Total Stock',
      'Sizes',
      'Colors',
      'Fabric',
      'Fit',
      'Origin',
      'Image URLs',
      'Short Description',
      'Full Description',
      'Created At',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = products.map((p) => {
      const sizes = Array.from(new Set(p.variants.map((v) => v.size))).join(', ');
      const colors = Array.from(new Set(p.variants.map((v) => v.color))).join(', ');
      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      const imageUrls = p.images.map((img) => img.url).join(' | ');

      return [
        escapeCsv(p.sku),
        escapeCsv(p.name),
        escapeCsv(p.slug),
        escapeCsv(p.category?.name || ''),
        escapeCsv(p.brand?.name || ''),
        escapeCsv(p.gender),
        escapeCsv(p.productType || 'Physical'),
        escapeCsv(p.regularPrice),
        escapeCsv(p.salePrice || ''),
        escapeCsv(p.costPrice || ''),
        escapeCsv(p.status),
        escapeCsv(totalStock),
        escapeCsv(sizes),
        escapeCsv(colors),
        escapeCsv(p.fabric || ''),
        escapeCsv(p.fit || ''),
        escapeCsv(p.origin || 'Bangladesh'),
        escapeCsv(imageUrls),
        escapeCsv(p.shortDescription || ''),
        escapeCsv(p.description),
        escapeCsv(p.createdAt.toISOString()),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nexstep_products_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Products export error:', error);
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
  }
}
