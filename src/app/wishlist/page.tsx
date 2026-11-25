'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Query products API
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.products) {
          const filtered = data.products.filter((p: any) => wishlistIds.includes(p.id));
          setProducts(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[#858585]">
        Loading your private wishlist...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Heart className="w-16 h-16 text-[#858585] stroke-1 mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-light text-[#111111]">Your Wishlist is Empty</h1>
        <p className="text-xs text-[#858585] mt-2 mb-8">
          Save your favorite luxury pieces for later review.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
        >
          Discover Creations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-[#EAEAEA] pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] uppercase tracking-tight">
          My Saved Wishlist ({products.length})
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          Curated selection of items you admire.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
