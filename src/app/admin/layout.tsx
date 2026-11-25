'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  RotateCcw,
  BarChart3,
  UserCheck,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  FolderTree,
  Palette,
  Sparkles,
  ChevronDown,
  Sliders,
  Type,
  Maximize2,
  FileText,
  Bell,
  Share2,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);
  const [customizationOpen, setCustomizationOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (!user.isStaff) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || !user.isStaff) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white text-xs">
        <Shield className="w-8 h-8 text-[#C6AE91] animate-pulse mb-3" />
        <span>Verifying administrative authorization...</span>
      </div>
    );
  }

  const isCurrent = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen flex bg-[#F4F4F6] text-[#111111]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111111] text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between">
          <Link href="/admin" className="flex flex-col">
            <span className="font-serif tracking-[0.2em] font-bold text-sm uppercase text-[#F8F7F4]">
              Nexstep Admin
            </span>
            <span className="text-[9px] tracking-wider text-[#C6AE91] uppercase">
              Management Atelier
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items with Accordions */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto text-xs">
          {/* Main Dashboard */}
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm font-medium transition-colors ${
              pathname === '/admin'
                ? 'bg-[#C6AE91] text-[#111111] font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/orders"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm font-medium transition-colors ${
              isCurrent('/admin/orders')
                ? 'bg-[#C6AE91] text-[#111111] font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <span>Orders & Sales</span>
          </Link>

          {/* SECTION 1: PRODUCT MANAGEMENT */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setProductsOpen(!productsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C6AE91] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                <span>Product Catalog</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  productsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {productsOpen && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-neutral-800 ml-3">
                {[
                  { href: '/admin/products', label: 'All Products' },
                  { href: '/admin/products/new', label: 'Add New Product' },
                  { href: '/admin/categories', label: 'Categories' },
                  { href: '/admin/subcategories', label: 'Subcategories' },
                  { href: '/admin/collections', label: 'Collections' },
                  { href: '/admin/brands', label: 'Brands & Labels' },
                  { href: '/admin/attributes', label: 'Product Attributes' },
                  { href: '/admin/inventory', label: 'Inventory & Stock' },
                  { href: '/admin/products/import-export', label: 'Bulk Import / Export' },
                ].map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-3 py-1.5 rounded-sm transition-colors text-[11px] ${
                      isCurrent(sub.href)
                        ? 'bg-[#C6AE91]/20 text-[#C6AE91] font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                    }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: FULL WEBSITE CUSTOMIZATION */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setCustomizationOpen(!customizationOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C6AE91] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Website Customization</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  customizationOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {customizationOpen && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-neutral-800 ml-3">
                {[
                  { href: '/admin/customization/theme', label: '1. Theme Settings' },
                  { href: '/admin/customization/homepage', label: '2. Homepage Builder (18 Sec)' },
                  { href: '/admin/customization/header', label: '3. Header Customization' },
                  { href: '/admin/customization/footer', label: '4. Footer Customization' },
                  { href: '/admin/customization/banners', label: '5. Banner Management' },
                  { href: '/admin/customization/navigation', label: '6. Navigation Menu' },
                  { href: '/admin/customization/typography', label: '7. Typography' },
                  { href: '/admin/customization/colors', label: '8. Color Settings' },
                  { href: '/admin/customization/pages', label: '9. Page Management' },
                  { href: '/admin/customization/popups', label: '10. Popup Management' },
                  { href: '/admin/customization/announcement', label: '11. Announcement Bar' },
                  { href: '/admin/customization/social', label: '12. Social Media Settings' },
                  { href: '/admin/customization/seo', label: '13. SEO Settings' },
                ].map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-3 py-1.5 rounded-sm transition-colors text-[11px] ${
                      isCurrent(sub.href)
                        ? 'bg-[#C6AE91]/20 text-[#C6AE91] font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                    }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: OPERATIONS & ENGAGEMENT */}
          <div className="pt-2 border-t border-neutral-800 space-y-1">
            {[
              { href: '/admin/customers', label: 'Customers', icon: Users },
              { href: '/admin/coupons', label: 'Coupons & Discounts', icon: Tag },
              { href: '/admin/reviews', label: 'Product Reviews', icon: Star },
              { href: '/admin/returns', label: 'Returns & Refunds', icon: RotateCcw },
              { href: '/admin/reports', label: 'Analytics & Financials', icon: BarChart3 },
              { href: '/admin/users', label: 'Staff & Roles', icon: UserCheck },
              { href: '/admin/settings', label: 'Store Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm font-medium transition-colors ${
                    isCurrent(item.href)
                      ? 'bg-[#C6AE91] text-[#111111] font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Card & Store Link */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-white line-clamp-1">{user.name}</p>
              <p className="text-[10px] text-[#C6AE91] uppercase">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-neutral-400 hover:text-red-400 p-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-800 text-[11px] rounded-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#EAEAEA] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#111111] hover:text-[#C6AE91]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#858585]">
              Executive Management Atelier
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-[#858585]">
              Status: <strong className="text-emerald-700">● Live Production Mode</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
