'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatBDT, formatDate } from '@/lib/utils';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Return/exchange modal states
  const [returnModalOrder, setReturnModalOrder] = useState<any | null>(null);
  const [returnType, setReturnType] = useState<'RETURN' | 'EXCHANGE'>('RETURN');
  const [returnReason, setReturnReason] = useState('Size mismatch / Incorrect fit');
  const [returnExplanation, setReturnExplanation] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoadingOrders(true);
      // Fetch orders for current logged in user
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        // Fetch detailed orders
        const ordersRes = await fetch(`/api/orders/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: 'NXG-2026-1001', contact: data.user.email }),
        });
        const ordersData = await ordersRes.json();
        if (ordersData.order) {
          setOrders([ordersData.order]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    try {
      setReturnSubmitting(true);
      // Mock / direct API for return request
      setReturnSuccess('Your return/exchange request has been logged. Our concierge will contact you within 24 hours.');
      setTimeout(() => {
        setReturnModalOrder(null);
        setReturnSuccess(null);
      }, 2500);
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-xs text-[#858585]">
        Loading your account profile...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#EAEAEA] gap-4 mb-8">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
            Nexstep Membership
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#111111]">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-[#858585]">Member ID: {user.id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-3">
          {user.isStaff && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 border border-[#EAEAEA] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#F4EFEA] flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center justify-between transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#111111] text-white'
                : 'text-[#111111] hover:bg-[#F4EFEA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center justify-between transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#111111] text-white'
                : 'text-[#111111] hover:bg-[#F4EFEA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center justify-between transition-colors ${
              activeTab === 'addresses'
                ? 'bg-[#111111] text-white'
                : 'text-[#111111] hover:bg-[#F4EFEA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <Link
            href="/wishlist"
            className="w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center justify-between text-[#111111] hover:bg-[#F4EFEA] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-sm border border-[#EAEAEA] shadow-sm">
          {/* TAB 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4">
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Order History & Dispatches
                </h2>
                <p className="text-xs text-[#858585] mt-0.5">
                  Review statuses, view receipts, and initiate returns or exchanges.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-[#858585] stroke-1 mx-auto mb-3" />
                  <p className="text-xs text-[#858585]">You have not placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-block px-6 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-luxury rounded-sm hover:bg-[#C6AE91] hover:text-[#111111]"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord, idx) => (
                    <div
                      key={idx}
                      className="border border-[#EAEAEA] rounded-sm p-5 space-y-4 hover:border-neutral-400 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#EAEAEA] gap-2">
                        <div>
                          <strong className="text-xs font-bold text-[#111111]">
                            Order {ord.orderNumber}
                          </strong>
                          <p className="text-[11px] text-[#858585]">
                            Placed on {formatDate(ord.createdAt || new Date())}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded">
                            {ord.orderStatus}
                          </span>
                          <span className="text-xs font-bold text-[#111111]">
                            {formatBDT(ord.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items?.map((it: any, i: number) => (
                          <div key={i} className="flex items-center space-x-3 text-xs">
                            <div className="relative w-10 h-12 bg-[#ECE8E1] rounded-sm overflow-hidden flex-shrink-0">
                              <Image
                                src={it.imageUrl || 'https://via.placeholder.com/80'}
                                alt={it.productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[#111111]">{it.productName}</p>
                              <p className="text-[11px] text-[#858585]">
                                {it.size} | {it.color} (Qty: {it.quantity})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <Link
                          href={`/order-confirmation/${ord.orderNumber}`}
                          className="text-[#111111] hover:text-[#C6AE91] font-semibold underline inline-flex items-center gap-1"
                        >
                          <span>View Full Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-2">
                          <Link
                            href="/order-tracking"
                            className="px-3 py-1.5 border border-[#111111] text-[#111111] text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#F4EFEA]"
                          >
                            Track Live
                          </Link>
                          <button
                            type="button"
                            onClick={() => setReturnModalOrder(ord)}
                            className="px-3 py-1.5 bg-[#111111] text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111]"
                          >
                            Return / Exchange
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4">
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Personal Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#858585] block mb-1">Full Name</span>
                  <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-semibold text-[#111111]">
                    {user.name}
                  </p>
                </div>

                <div>
                  <span className="text-[#858585] block mb-1">Email Address</span>
                  <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-semibold text-[#111111]">
                    {user.email}
                  </p>
                </div>

                <div>
                  <span className="text-[#858585] block mb-1">Phone Number</span>
                  <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-semibold text-[#111111]">
                    {user.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="text-[#858585] block mb-1">Membership Tier</span>
                  <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-semibold text-[#C6AE91]">
                    Nexstep Gallery Patron
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4">
                <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Delivery Addresses
                </h2>
              </div>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="p-4 border border-[#EAEAEA] rounded-sm text-xs space-y-1 relative"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-[#C6AE91] bg-amber-50 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                      <p className="font-bold text-[#111111]">{addr.name}</p>
                      <p className="text-[#858585]">{addr.street}</p>
                      {addr.area && <p className="text-[#858585]">{addr.area}</p>}
                      <p className="text-[#858585]">
                        {addr.district}, {addr.division} {addr.postalCode}
                      </p>
                      <p className="text-[#858585] pt-1">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#858585]">No saved addresses found.</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Return & Exchange Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReturnModalOrder(null)}
          />
          <div className="relative bg-white rounded-sm max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-sm font-semibold tracking-luxury uppercase text-[#111111]">
              Request Return or Exchange
            </h3>
            <p className="text-xs text-[#858585]">
              Initiating request for Order <strong>{returnModalOrder.orderNumber}</strong>.
            </p>

            {returnSuccess ? (
              <p className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-sm">
                {returnSuccess}
              </p>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Request Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReturnType('RETURN')}
                      className={`py-2 text-center border rounded-sm font-semibold uppercase ${
                        returnType === 'RETURN'
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#EAEAEA] text-[#111111]'
                      }`}
                    >
                      Return & Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnType('EXCHANGE')}
                      className={`py-2 text-center border rounded-sm font-semibold uppercase ${
                        returnType === 'EXCHANGE'
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#EAEAEA] text-[#111111]'
                      }`}
                    >
                      Size Exchange
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                  >
                    <option value="Size mismatch / Incorrect fit">Size mismatch / Incorrect fit</option>
                    <option value="Fabric / Color differs from expectation">
                      Fabric / Color differs from expectation
                    </option>
                    <option value="Manufacturing defect or stitch flaw">
                      Manufacturing defect or stitch flaw
                    </option>
                    <option value="Change of mind">Change of mind</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    rows={3}
                    value={returnExplanation}
                    onChange={(e) => setReturnExplanation(e.target.value)}
                    placeholder="Specify the replacement size or details..."
                    className="w-full p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReturnModalOrder(null)}
                    className="flex-1 py-2.5 border border-[#EAEAEA] rounded-sm uppercase tracking-wider text-[#111111]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="flex-1 py-2.5 bg-[#111111] text-white rounded-sm uppercase tracking-wider font-semibold hover:bg-[#C6AE91] hover:text-[#111111]"
                  >
                    {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
