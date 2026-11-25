'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { formatBDT } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/ui/ProductCard';

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({
    details: true,
    sizing: false,
    care: false,
    shipping: true,
  });

  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000' }];
  const currentImage = images[selectedImageIndex] || images[0];

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.totalStock > 0;
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = async (goToCheckout = false) => {
    if (!selectedVariant) return;
    try {
      setIsAdding(true);
      const res = await addItem(selectedVariant.id, quantity);
      if (res.success && goToCheckout) {
        router.push('/checkout');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          authorName: reviewName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess('Your review has been submitted for editorial moderation. Thank you!');
        setReviewName('');
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#858585] mb-8 font-sans flex items-center gap-1.5 uppercase tracking-wider">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#111111]">
          Shop
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-[#111111]">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#111111] font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 flex-shrink-0">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[3/4] w-16 sm:w-20 rounded-sm overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-[#111111]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Primary View */}
          <div className="relative flex-1 aspect-[3/4] bg-[#ECE8E1] rounded-sm overflow-hidden">
            <Image
              src={currentImage.url}
              alt={currentImage.altText || product.name}
              fill
              priority
              className="object-cover transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {product.discountPercent && (
              <span className="absolute top-4 left-4 bg-[#C6AE91] text-[#111111] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Actions & Information */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Header */}
          <div>
            {product.category && (
              <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase block mb-1">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#858585] mt-1 tracking-wider uppercase font-sans">
              SKU: {selectedVariant?.sku || product.sku}
            </p>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.avgRating)
                      ? 'fill-[#C6AE91] text-[#C6AE91]'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#111111]">{product.avgRating}</span>
            <span className="text-xs text-[#858585]">
              ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3 pt-2 border-t border-[#EAEAEA]">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-bold text-[#111111]">
                  {formatBDT(product.salePrice)}
                </span>
                <span className="text-base text-[#858585] line-through">
                  {formatBDT(product.regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-[#111111]">
                {formatBDT(product.regularPrice)}
              </span>
            )}
            <span className="text-xs text-[#858585]">Inclusive of all VAT in Bangladesh</span>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-[#252525] font-light leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Color & Size Variant Selectors */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-[#EAEAEA]">
              {/* Color Swatches */}
              <div>
                <span className="text-xs font-semibold tracking-luxury uppercase text-[#111111] block mb-2">
                  Color: <strong className="font-normal text-[#858585]">{selectedVariant?.color}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.map((v: any) => v.color))).map((colorName: any) => {
                    const sampleVariant = product.variants.find((v: any) => v.color === colorName);
                    const isSelected = selectedVariant?.color === colorName;
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => {
                          const match = product.variants.find(
                            (v: any) => v.color === colorName && v.size === selectedVariant?.size
                          ) || sampleVariant;
                          setSelectedVariant(match);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-sm border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#EAEAEA] text-[#111111] hover:bg-[#F4EFEA]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: sampleVariant?.colorHex || '#111111' }}
                        />
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selectors */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                    Size: <strong className="font-normal text-[#858585]">{selectedVariant?.size}</strong>
                  </span>
                  <Link
                    href="/size-guide"
                    className="text-[11px] text-[#C6AE91] hover:text-[#111111] underline tracking-wider uppercase font-medium"
                  >
                    View Size Guide
                  </Link>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.variants.map((v: any) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isOut = v.stock === 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isOut}
                        onClick={() => setSelectedVariant(v)}
                        className={`py-2.5 text-xs font-semibold rounded-sm border transition-all ${
                          isSelected
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : isOut
                            ? 'border-[#EAEAEA] text-[#858585] line-through opacity-40 bg-neutral-100 cursor-not-allowed'
                            : 'border-[#EAEAEA] text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Indicator */}
              <div className="text-xs">
                {selectedVariant?.stock > 0 && selectedVariant.stock <= 5 ? (
                  <span className="text-amber-700 font-medium">
                    ⚠️ Only {selectedVariant.stock} items remaining in stock
                  </span>
                ) : inStock ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Stock — Ready for dispatch
                  </span>
                ) : (
                  <span className="text-red-700 font-medium">Currently Sold Out</span>
                )}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-[#EAEAEA]">
            <div className="flex gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#111111] rounded-sm bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-3 text-sm text-[#111111] hover:bg-[#F4EFEA] disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-[#111111]">{quantity}</span>
                <button
                  type="button"
                  disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-3 text-sm text-[#111111] hover:bg-[#F4EFEA] disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add To Bag */}
              <button
                type="button"
                disabled={!inStock || isAdding}
                onClick={() => handleAddToCart(false)}
                className="flex-1 py-3 bg-[#111111] text-[#F8F7F4] text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? 'Adding...' : inStock ? 'Add to Bag' : 'Sold Out'}</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="p-3 border border-[#EAEAEA] rounded-sm text-[#111111] hover:text-red-600 transition-colors"
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>

            {/* Instant Buy Now Button */}
            {inStock && (
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="w-full py-3 bg-[#C6AE91] text-[#111111] text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#b09678] transition-all"
              >
                Buy Now — Instant Checkout
              </button>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-[#858585]">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C6AE91]" />
              <span>Complimentary Delivery &gt; ৳3,000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-[#C6AE91]" />
              <span>7-Day Return & Exchange</span>
            </div>
          </div>

          {/* Accordions */}
          <div className="pt-4 border-t border-[#EAEAEA] space-y-3">
            {/* Description & Fabric */}
            <div className="border-b border-[#EAEAEA] pb-3">
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((prev) => ({ ...prev, details: !prev.details }))
                }
                className="w-full flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-[#111111]"
              >
                <span>Fabric & Sartorial Details</span>
                {accordionOpen.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {accordionOpen.details && (
                <div className="mt-3 text-xs text-[#858585] space-y-2 leading-relaxed">
                  <p>{product.description}</p>
                  {product.fabric && (
                    <p>
                      <strong className="text-[#111111]">Composition:</strong> {product.fabric}
                    </p>
                  )}
                  {product.fit && (
                    <p>
                      <strong className="text-[#111111]">Fit Profile:</strong> {product.fit}
                    </p>
                  )}
                  {product.origin && (
                    <p>
                      <strong className="text-[#111111]">Origin:</strong> Crafted in {product.origin}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Care Instructions */}
            <div className="border-b border-[#EAEAEA] pb-3">
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((prev) => ({ ...prev, care: !prev.care }))
                }
                className="w-full flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-[#111111]"
              >
                <span>Care Instructions</span>
                {accordionOpen.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {accordionOpen.care && (
                <div className="mt-3 text-xs text-[#858585] leading-relaxed">
                  {product.careInstructions || 'Dry clean recommended. Gentle wash with cold water. Iron on reverse.'}
                </div>
              )}
            </div>

            {/* Shipping in Bangladesh */}
            <div className="border-b border-[#EAEAEA] pb-3">
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((prev) => ({ ...prev, shipping: !prev.shipping }))
                }
                className="w-full flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-[#111111]"
              >
                <span>Shipping & Delivery (Bangladesh)</span>
                {accordionOpen.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {accordionOpen.shipping && (
                <div className="mt-3 text-xs text-[#858585] space-y-1 leading-relaxed">
                  <p>• <strong>Inside Dhaka:</strong> ৳70 (Delivered in 24 - 48 Hours)</p>
                  <p>• <strong>Outside Dhaka (All 63 Districts):</strong> ৳130 (Delivered in 48 - 72 Hours)</p>
                  <p>• <strong>Orders over ৳3,000:</strong> 100% Free Express Shipping</p>
                  <p>• Payment via bKash, Nagad, Cards or Cash on Delivery</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section className="mt-20 pt-12 border-t border-[#EAEAEA]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
              Client Feedback
            </span>
            <h2 className="text-2xl font-serif font-light text-[#111111] mt-1">
              Customer Reviews ({product.reviewCount})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="p-5 bg-white rounded-sm border border-[#EAEAEA] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#C6AE91] text-[#C6AE91]' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#858585]">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rev.title && <h4 className="text-xs font-bold text-[#111111]">{rev.title}</h4>}
                  <p className="text-xs text-[#858585] leading-relaxed">{rev.comment}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#111111]">{rev.authorName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-emerald-700 font-medium">Verified Buyer</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#858585] italic">
                Be the first to share your experience with this creation.
              </p>
            )}
          </div>

          {/* Submit Review Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-sm border border-[#EAEAEA]">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-4">
              Write a Review
            </h3>
            {reviewSuccess ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-sm">{reviewSuccess}</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#111111] block mb-1">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-[#C6AE91] text-[#C6AE91]' : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#111111] block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#111111] block mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Exceptional fabric and drape"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#111111] block mb-1">
                    Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#EAEAEA]">
          <h2 className="text-xl font-serif font-light text-[#111111] uppercase tracking-tight mb-8">
            You May Also Admire
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
