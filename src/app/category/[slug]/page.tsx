import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getProducts } from '@/lib/services/productService';
import { ProductCard } from '@/components/ui/ProductCard';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    gender?: string;
    size?: string;
    page?: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) return { title: 'Category Not Found | Nexstep Gallery' };

  return {
    title: `${category.name} | Nexstep Gallery`,
    description: category.description || `Explore ${category.name} collection at Nexstep Gallery.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const { products, total } = await getProducts({
    categorySlug: params.slug,
    gender: searchParams.gender,
    size: searchParams.size,
    sort: (searchParams.sort as any) || 'newest',
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 16,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb & Header */}
      <nav className="text-xs text-[#858585] mb-6 font-sans flex items-center gap-1.5 uppercase tracking-wider">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#111111]">
          Shop
        </Link>
        <span>/</span>
        <span className="text-[#111111] font-medium">{category.name}</span>
      </nav>

      <div className="mb-10 pb-6 border-b border-[#EAEAEA] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
            Curated Department
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#111111] tracking-tight mt-1">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs text-[#858585] mt-1 max-w-xl">{category.description}</p>
          )}
        </div>
        <span className="text-xs text-[#858585] uppercase tracking-wider">
          {products.length} of {total} Pieces
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-sm border border-[#EAEAEA] p-8">
          <p className="text-base font-serif font-medium text-[#111111]">
            No pieces found in this category currently.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-6 py-2.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-luxury rounded-sm"
          >
            Explore All Creations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
