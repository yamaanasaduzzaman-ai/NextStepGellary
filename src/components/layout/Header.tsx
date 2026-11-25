'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { wishlistIds } = useWishlist();
  const { user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F7F4]/95 backdrop-blur-md shadow-sm border-b border-[#EAEAEA]'
            : 'bg-[#F8F7F4] border-b border-[#EAEAEA]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-[#111111] hover:text-[#C6AE91] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
              <Link href="/" className="group flex flex-col items-center lg:items-start">
                <span className="font-serif tracking-[0.25em] text-xl sm:text-2xl font-bold text-[#111111] group-hover:text-[#C6AE91] transition-colors uppercase">
                  Nexstep Gallery
                </span>
                <span className="text-[9px] tracking-[0.35em] text-[#858585] uppercase -mt-1 font-sans">
                  Luxury Fashion & Atelier
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/shop"
                className="text-xs font-medium tracking-[0.15em] text-[#111111] hover:text-[#C6AE91] transition-colors uppercase py-2"
              >
                Shop All
              </Link>
              <Link
                href="/shop?filter=new"
                className="text-xs font-medium tracking-[0.15em] text-[#111111] hover:text-[#C6AE91] transition-colors uppercase py-2 relative"
              >
                New Arrivals
                <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-[#C6AE91] rounded-full"></span>
              </Link>
              <Link
                href="/category/men"
                className="text-xs font-medium tracking-[0.15em] text-[#111111] hover:text-[#C6AE91] transition-colors uppercase py-2"
              >
                Men
              </Link>
              <Link
                href="/category/women"
                className="text-xs font-medium tracking-[0.15em] text-[#111111] hover:text-[#C6AE91] transition-colors uppercase py-2"
              >
                Women
              </Link>
              <Link
                href="/category/panjabi"
                className="text-xs font-medium tracking-[0.15em] text-[#111111] hover:text-[#C6AE91] transition-colors uppercase py-2"
              >
                Panjabi
              </Link>
              <Link
                href="/shop?filter=featured"
                className="text-xs font-medium tracking-[0.15em] text-[#111111] hover:text-[#C6AE91] transition-colors uppercase py-2"
              >
                Collections
              </Link>
              <Link
                href="/blog"
                className="text-xs font-medium tracking-[0.15em] text-[#858585] hover:text-[#111111] transition-colors uppercase py-2"
              >
                Journal
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-4 sm:space-x-5">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 text-[#111111] hover:text-[#C6AE91] transition-colors"
                aria-label="Search collection"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="p-1.5 text-[#111111] hover:text-[#C6AE91] transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#111111] text-[#F8F7F4] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Customer Account / Admin Link */}
              {user?.isStaff ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium tracking-wider bg-[#111111] text-[#F8F7F4] rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-all"
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              ) : (
                <Link
                  href={user ? '/account' : '/login'}
                  className="p-1.5 text-[#111111] hover:text-[#C6AE91] transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Shopping Bag Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="p-1.5 text-[#111111] hover:text-[#C6AE91] transition-colors relative flex items-center"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C6AE91] text-[#111111] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fadeIn">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Expandable Bar */}
        {searchOpen && (
          <div className="bg-[#111111] text-[#F8F7F4] py-4 px-4 sm:px-8 border-t border-neutral-800 animate-slideUp">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-[#858585] absolute left-3" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU (e.g. NXG-PAN-001), fabric, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#1c1c1c] text-[#F8F7F4] text-sm pl-11 pr-24 py-2.5 rounded-sm border border-neutral-700 focus:outline-none focus:border-[#C6AE91] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1 bg-[#C6AE91] text-[#111111] text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-white transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#F8F7F4] shadow-2xl p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[#EAEAEA]">
              <span className="font-serif tracking-[0.2em] font-bold text-lg text-[#111111] uppercase">
                Nexstep Gallery
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#111111] hover:text-[#C6AE91]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col space-y-4">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Shop All
              </Link>
              <Link
                href="/shop?filter=new"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                New Arrivals
              </Link>
              <Link
                href="/category/men"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Men
              </Link>
              <Link
                href="/category/women"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Women
              </Link>
              <Link
                href="/category/panjabi"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Panjabi
              </Link>
              <Link
                href="/category/shirts"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Shirts
              </Link>
              <Link
                href="/category/trousers"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Trousers
              </Link>
              <Link
                href="/shop?filter=featured"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Collections
              </Link>
              <Link
                href="/order-tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#111111] uppercase hover:text-[#C6AE91] py-1"
              >
                Track Order
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium tracking-[0.15em] text-[#858585] uppercase hover:text-[#111111] py-1"
              >
                Fashion Journal
              </Link>
            </nav>

            <div className="mt-auto pt-8 border-t border-[#EAEAEA] flex flex-col space-y-3">
              {user ? (
                <>
                  <p className="text-xs text-[#858585]">Signed in as {user.name}</p>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold uppercase tracking-wider text-[#111111] hover:text-[#C6AE91]"
                  >
                    My Account & Orders
                  </Link>
                  {user.isStaff && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-semibold uppercase tracking-wider text-[#C6AE91]"
                    >
                      Admin Dashboard →
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-[#111111] text-[#F8F7F4] text-xs font-semibold tracking-wider uppercase rounded-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-[#111111] text-[#111111] text-xs font-semibold tracking-wider uppercase rounded-sm"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
