'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBDT } from '@/lib/utils';

export default function CartPage() {
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.isValid) {
        setCouponDiscount(data.discountAmount);
        setCouponApplied(true);
        setCouponMessage(data.message);
      } else {
        setCouponDiscount(0);
        setCouponApplied(false);
        setCouponMessage(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponMessage('Error validating coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const freeShippingThreshold = 3000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const estimatedShipping = isFreeShipping ? 0 : 70; // Inside Dhaka default estimate
  const grandTotal = Math.max(0, subtotal - couponDiscount + estimatedShipping);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-[#858585] stroke-1 mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-light text-[#111111]">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-[#858585] mt-2 mb-8">
          You haven&apos;t added any items to your bag yet.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] uppercase tracking-tight mb-8">
        Shopping Bag ({totalItems})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items Table */}
        <div className="lg:col-span-8">
          <div className="border-t border-[#EAEAEA]">
            {items.map((item) => {
              const imgUrl = item.product.images?.[0]?.url || 'https://via.placeholder.com/150';
              return (
                <div
                  key={item.id}
                  className="py-6 border-b border-[#EAEAEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-24 bg-[#ECE8E1] rounded-sm overflow-hidden flex-shrink-0">
                      <Image src={imgUrl} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-xs font-semibold text-[#111111] hover:text-[#C6AE91] transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[11px] text-[#858585] mt-1">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="text-xs font-bold text-[#111111] mt-1 sm:hidden">
                        {formatBDT(item.unitPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#111111] rounded-sm bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs hover:bg-[#F4EFEA]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#111111]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs hover:bg-[#F4EFEA]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#111111] block">
                        {formatBDT(item.unitPrice * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[#858585]">
                          {formatBDT(item.unitPrice)} each
                        </span>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[#858585] hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex justify-between items-center">
            <Link
              href="/shop"
              className="text-xs font-semibold tracking-wider uppercase text-[#111111] hover:text-[#C6AE91]"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-sm border border-[#EAEAEA] h-fit space-y-6">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#858585]">
              <span>Subtotal</span>
              <span className="text-[#111111] font-semibold">{formatBDT(subtotal)}</span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon ({couponCode.toUpperCase()})</span>
                <span>-{formatBDT(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#858585]">
              <span>Estimated Delivery</span>
              <span className="text-[#111111] font-semibold">
                {isFreeShipping ? 'FREE' : formatBDT(estimatedShipping)}
              </span>
            </div>

            <div className="pt-3 border-t border-[#EAEAEA] flex justify-between text-sm font-bold text-[#111111]">
              <span>Estimated Total</span>
              <span>{formatBDT(grandTotal)}</span>
            </div>
          </div>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE (e.g. NEXSTEP10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111] uppercase"
              />
              <button
                type="submit"
                disabled={validatingCoupon}
                className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] ${couponApplied ? 'text-emerald-700' : 'text-red-600'}`}>
                {couponMessage}
              </p>
            )}
          </form>

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            className="w-full py-3.5 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="pt-4 border-t border-[#EAEAEA] flex items-center justify-center gap-2 text-[11px] text-[#858585]">
            <ShieldCheck className="w-4 h-4 text-[#C6AE91]" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
