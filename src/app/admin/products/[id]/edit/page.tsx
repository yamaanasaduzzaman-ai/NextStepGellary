import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  return {
    title: product ? `Edit ${product.name} | Nexstep Gallery Admin` : 'Edit Product',
  };
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      brand: true,
      collection: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { size: 'asc' } },
      inventoryMovements: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      _count: {
        select: { orderItems: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
