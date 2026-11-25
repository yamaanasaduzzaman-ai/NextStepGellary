import React from 'react';
import Link from 'next/link';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { getProducts } from '@/lib/services/productService';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ui/ProductCard';

interface ShopPageProps {
  searchParams: {
    query?: string;
    category?: string;
    collection?: string;
    gender?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    sort?: string;
    filter?: string;
    page?: string;
  };
}

export const revalidate = 30;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const isNew = searchParams.filter === 'new';
  const isFeatured = searchParams.filter === 'featured';

  const [categories, productData] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    getProducts({
      query: searchParams.query,
      categorySlug: searchParams.category,
      collectionSlug: searchParams.collection,
      gender: searchParams.gender,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      size: searchParams.size,
      isNewArrival: isNew ? true : undefined,
      isFeatured: isFeatured ? true : undefined,
      sort: (searchParams.sort as any) || 'newest',
      page: searchParams.page ? Number(searchParams.page) : 1,
      limit: 16,
    }),
  ]);

  const { products, total, page, totalPages } = productData;

  const activeCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb & Header */}
      <div className="mb-8 border-b border-[#EAEAEA] pb-6">
        <div className="text-xs text-[#858585] mb-2 font-sans flex items-center gap-1.5 uppercase tracking-wider">
          <Link href="/" className="hover:text-[#111111]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#111111] font-medium">
            {activeCategory ? activeCategory.name : isNew ? 'New Arrivals' : 'Shop All'}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-light text-[#111111] uppercase tracking-tight">
              {activeCategory
                ? activeCategory.name
                : isNew
                ? 'New Arrivals'
                : isFeatured
                ? 'Featured Capsule'
                : searchParams.gender
                ? `${searchParams.gender}'s Collection`
                : 'All Creations'}
            </h1>
            <p className="text-xs text-[#858585] mt-1 max-w-xl">
              {activeCategory?.description ||
                'Explore the complete atelier archive. Modern minimalist fashion crafted with premium materials and South Asian precision.'}
            </p>
          </div>
          <span className="text-xs text-[#858585] uppercase tracking-wider">
            Showing {products.length} of {total} Pieces
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-8">
          {/* Categories Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
              Category
            </h3>
            <ul className="space-y-1.5 text-xs text-[#858585]">
              <li>
                <Link
                  href="/shop"
                  className={`hover:text-[#111111] transition-colors ${
                    !searchParams.category ? 'font-bold text-[#111111]' : ''
                  }`}
                >
                  All Categories ({total})
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className={`hover:text-[#111111] transition-colors ${
                      searchParams.category === c.slug ? 'font-bold text-[#111111]' : ''
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Gender Filter */}
          <div className="space-y-3 pt-4 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
              Gender
            </h3>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'MEN', 'WOMEN', 'UNISEX'].map((g) => (
                <Link
                  key={g}
                  href={`/shop?${new URLSearchParams({
                    ...searchParams,
                    gender: g === 'ALL' ? '' : g.toLowerCase(),
                  }).toString()}`}
                  className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${
                    (searchParams.gender || '').toUpperCase() === g ||
                    (!searchParams.gender && g === 'ALL')
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'border-[#EAEAEA] text-[#111111] hover:bg-[#F4EFEA]'
                  }`}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3 pt-4 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
              Size
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34'].map((s) => (
                <Link
                  key={s}
                  href={`/shop?${new URLSearchParams({
                    ...searchParams,
                    size: searchParams.size === s ? '' : s,
                  }).toString()}`}
                  className={`py-1.5 text-center text-xs border rounded-sm transition-colors ${
                    searchParams.size === s
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'border-[#EAEAEA] text-[#111111] hover:bg-[#F4EFEA]'
                  }`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-3 pt-4 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
              Sort By
            </h3>
            <div className="flex flex-col space-y-1.5 text-xs text-[#858585]">
              {[
                { label: 'Newest Arrivals', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-asc' },
                { label: 'Price: High to Low', value: 'price-desc' },
                { label: 'Best Selling', value: 'bestseller' },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`/shop?${new URLSearchParams({
                    ...searchParams,
                    sort: s.value,
                  }).toString()}`}
                  className={`hover:text-[#111111] transition-colors ${
                    (searchParams.sort || 'newest') === s.value ? 'font-bold text-[#111111]' : ''
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <div className="pt-4 border-t border-[#EAEAEA]">
            <Link
              href="/shop"
              className="block text-center py-2 text-xs uppercase tracking-wider text-[#858585] hover:text-[#111111] border border-[#EAEAEA] rounded-sm"
            >
              Reset Filters
            </Link>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-sm border border-[#EAEAEA] p-8">
              <p className="text-base font-serif font-medium text-[#111111]">
                No items match your criteria
              </p>
              <p className="text-xs text-[#858585] mt-1 mb-6">
                Try loosening your filters or browsing all categories.
              </p>
              <Link
                href="/shop"
                className="px-6 py-2.5 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Link
                    key={pageNum}
                    href={`/shop?${new URLSearchParams({
                      ...searchParams,
                      page: String(pageNum),
                    }).toString()}`}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-semibold rounded-sm border transition-colors ${
                      page === pageNum
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'border-[#EAEAEA] text-[#111111] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
