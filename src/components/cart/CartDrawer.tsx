'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBDT } from '@/lib/utils';

export function CartDrawer() {
  const { items, subtotal, totalItems, isCartOpen, closeCart, updateQuantity, removeItem } =
    useCart();

  if (!isCartOpen) return null;

  const freeShippingGoal = 3000;
  const differenceToFree = Math.max(0, freeShippingGoal - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingGoal) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8F7F4] flex flex-col shadow-2xl animate-fadeIn">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#EAEAEA] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#111111]">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-[#111111] hover:text-[#C6AE91] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-[#F4EFEA] border-b border-[#EAEAEA]">
            <p className="text-xs text-[#252525] font-medium text-center">
              {differenceToFree === 0 ? (
                <span className="text-[#111111] font-semibold">
                  🎉 Congratulations! You have unlocked FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#111111]">{formatBDT(differenceToFree)}</strong> more to
                  qualify for <strong>FREE Delivery</strong>
                </span>
              )}
            </p>
            <div className="w-full bg-[#EAEAEA] h-1.5 mt-2 rounded-full overflow-hidden">
              <div
                className="bg-[#111111] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-[#858585] stroke-1 mb-4" />
                <p className="text-base font-serif font-medium text-[#111111]">Your bag is empty</p>
                <p className="text-xs text-[#858585] mt-1 mb-6">
                  Explore our curated seasonal collection to begin.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#111111] text-[#F8F7F4] text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const imgUrl = item.product.images?.[0]?.url || 'https://via.placeholder.com/150';
                return (
                  <div
                    key={item.id}
                    className="flex space-x-4 pb-6 border-b border-[#EAEAEA] last:border-none"
                  >
                    <div className="relative w-20 h-24 bg-white flex-shrink-0 overflow-hidden rounded-sm border border-[#EAEAEA]">
                      <Image
                        src={imgUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="text-xs font-semibold text-[#111111] hover:text-[#C6AE91] line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[#858585] hover:text-red-600 transition-colors ml-2"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#858585] mt-0.5">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="text-xs font-semibold text-[#111111] mt-1">
                          {formatBDT(item.unitPrice)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#EAEAEA] bg-white rounded-sm">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-[#111111] hover:bg-[#F4EFEA] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-[#111111] hover:bg-[#F4EFEA] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-[#111111]">
                          {formatBDT(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EAEAEA] bg-white space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#858585] uppercase tracking-wider text-xs">Subtotal</span>
                <span className="font-bold text-base text-[#111111]">{formatBDT(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#858585]">
                Shipping charges, taxes, and promotional coupons applied at checkout.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-3 text-center border border-[#111111] text-[#111111] text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-[#F4EFEA] transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 bg-[#111111] text-[#F8F7F4] text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
