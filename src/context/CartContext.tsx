'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface CartItemType {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  product: {
    name: string;
    slug: string;
    images: { url: string; isPrimary: boolean }[];
  };
  variant: {
    sku: string;
    stock: number;
  };
}

interface CartContextType {
  items: CartItemType[];
  subtotal: number;
  totalItems: number;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, guestToken } = useAuth();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = async () => {
    if (!guestToken && !user) return;
    try {
      setIsLoading(true);
      const url = user ? '/api/cart' : `/api/cart?guestToken=${guestToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
        setSubtotal(data.subtotal || 0);
        setTotalItems(data.totalItems || 0);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (guestToken || user) {
      refreshCart();
    }
  }, [user, guestToken]);

  const addItem = async (variantId: string, quantity = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          quantity,
          guestToken: user ? undefined : guestToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshCart();
        setIsCartOpen(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to add item' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        totalItems,
        isLoading,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
