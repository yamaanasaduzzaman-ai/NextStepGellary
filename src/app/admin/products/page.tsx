import React from 'react';
import prisma from '@/lib/prisma';
import ProductListClient from '@/components/admin/ProductListClient';

export const revalidate = 0; // Always fresh in admin

export const metadata = {
  title: 'All Products | Nexstep Gallery Admin',
};

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        variants: { select: { id: true, size: true, color: true, stock: true } },
        images: { orderBy: { displayOrder: 'asc' }, take: 1, select: { url: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <ProductListClient
      initialProducts={products as any}
      categories={categories}
      brands={brands}
    />
  );
}
