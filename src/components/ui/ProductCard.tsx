'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { formatBDT } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    regularPrice: number;
    salePrice?: number | null;
    discountPercent?: number | null;
    primaryImage?: { url: string; altText?: string | null } | null;
    images?: { url: string; altText?: string | null }[];
    variants?: { id: string; size: string; color: string; stock: number }[];
    category?: { name: string; slug: string } | null;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    avgRating?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const primaryImg = product.primaryImage?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800';
  const secondaryImg = product.images?.[1]?.url || primaryImg;

  const inStock = product.variants ? product.variants.some((v) => v.stock > 0) : true;

  const handleQuickAdd = async (variantId?: string) => {
    const targetVariant = variantId || product.variants?.[0]?.id;
    if (!targetVariant) return;

    if (!variantId && product.variants && product.variants.length > 1) {
      setShowSizeModal(true);
      return;
    }

    try {
      setIsAdding(true);
      await addItem(targetVariant, 1);
      setShowSizeModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-transparent">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ECE8E1] rounded-sm">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={primaryImg}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNewArrival && (
            <span className="bg-[#111111] text-[#F8F7F4] text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm">
              New
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-[#C6AE91] text-[#111111] text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm">
              -{product.discountPercent}%
            </span>
          )}
          {!inStock && (
            <span className="bg-red-700 text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-sm rounded-full text-[#111111] hover:text-red-600 transition-colors z-10 shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 hidden lg:flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            disabled={!inStock || isAdding}
            onClick={() => handleQuickAdd()}
            className="w-full py-2.5 bg-[#111111]/95 backdrop-blur-sm text-[#F8F7F4] text-[11px] font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Adding...' : inStock ? 'Quick Add' : 'Sold Out'}</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-3 pb-1 flex flex-col flex-1">
        {product.category && (
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#858585] mb-1 font-sans">
            {product.category.name}
          </span>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="text-xs font-medium text-[#111111] hover:text-[#C6AE91] transition-colors line-clamp-1 mb-1 font-sans"
        >
          {product.name}
        </Link>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-auto">
          {product.salePrice ? (
            <>
              <span className="text-xs font-bold text-[#111111]">
                {formatBDT(product.salePrice)}
              </span>
              <span className="text-xs text-[#858585] line-through">
                {formatBDT(product.regularPrice)}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-[#111111]">
              {formatBDT(product.regularPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Quick Size Select Modal if multi-variant */}
      {showSizeModal && (
        <div className="absolute inset-0 bg-[#F8F7F4]/95 backdrop-blur-sm z-20 p-4 flex flex-col justify-center items-center rounded-sm animate-fadeIn">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#111111] mb-3">
            Select Size
          </p>
          <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] mb-4">
            {product.variants?.map((v) => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => handleQuickAdd(v.id)}
                className="py-2 text-xs border border-[#111111] rounded-sm font-medium hover:bg-[#111111] hover:text-white transition-colors disabled:opacity-30 disabled:line-through"
              >
                {v.size}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowSizeModal(false)}
            className="text-[11px] uppercase tracking-wider text-[#858585] hover:text-[#111111]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
