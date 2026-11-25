import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/lib/services/productService';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product Not Found | Nexstep Gallery' };
  }

  const primaryImg = product.primaryImage?.url || 'https://images.unsplash.com/photo-1596704017254-9b121068fb31';

  return {
    title: `${product.name} | Nexstep Gallery`,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Nexstep Gallery`,
      description: product.shortDescription || product.description.slice(0, 160),
      images: [{ url: primaryImg }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  // JSON-LD Structured Data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img: any) => img.url),
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Nexstep Gallery',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.salePrice || product.regularPrice,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Nexstep Gallery',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={related} />
    </>
  );
}
