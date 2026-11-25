'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatBDT, formatDateTime } from '@/lib/utils';

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !contact) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, contact }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackedOrder(data.order);
      } else {
        setTrackedOrder(null);
        setError(data.error || 'No matching order found');
      }
    } catch (err) {
      setError('An error occurred during lookup.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Client Concierge
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-light text-[#111111] uppercase tracking-tight">
          Track Your Consignment
        </h1>
        <p className="text-xs text-[#858585] max-w-md mx-auto">
          Enter your unique order number and registered email or phone to view real-time delivery status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#EAEAEA] shadow-sm mb-10">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
              Order Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NXG-2026-1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full text-xs p-3 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111] uppercase"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
              Email or Phone
            </label>
            <input
              type="text"
              required
              placeholder="e.g. tanvir@example.com or 017..."
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full text-xs p-3 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-luxury rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Track</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Status Result */}
      {trackedOrder && (
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#EAEAEA] shadow-sm space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#EAEAEA] gap-3">
            <div>
              <span className="text-[10px] text-[#858585] tracking-widest uppercase block">
                Consignment Details
              </span>
              <h2 className="text-xl font-serif text-[#111111] font-medium">
                {trackedOrder.orderNumber}
              </h2>
              <p className="text-xs text-[#858585]">
                Recipient: <strong>{trackedOrder.customerName}</strong> ({trackedOrder.shippingDistrict})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-bold uppercase rounded-sm border ${getStatusColor(
                  trackedOrder.orderStatus
                )}`}
              >
                {trackedOrder.orderStatus}
              </span>
            </div>
          </div>

          {/* Courier Details if assigned */}
          {trackedOrder.shipment && (
            <div className="p-4 bg-[#F8F7F4] rounded-sm border border-[#EAEAEA] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#C6AE91]" />
                <div>
                  <p className="font-semibold text-[#111111]">
                    Courier Partner: {trackedOrder.shipment.courierProvider}
                  </p>
                  <p className="text-[#858585]">
                    Consignment Tracking Code: <strong>{trackedOrder.shipment.trackingCode}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-6">
              Journey Timeline
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAEAEA]">
              {trackedOrder.orderTimeline.map((item: any, idx: number) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white ${
                      idx === 0 ? 'border-[#111111] bg-[#111111]' : 'border-[#C6AE91]'
                    }`}
                  />
                  <div>
                    <span className="text-[10px] text-[#858585] block">
                      {formatDateTime(item.createdAt)}
                    </span>
                    <h4 className="text-xs font-bold text-[#111111] mt-0.5">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-[#858585] mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Preview */}
          <div className="pt-6 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-4">
              Items in Parcel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trackedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-3 text-xs bg-[#F8F7F4] p-3 rounded-sm">
                  <div className="relative w-10 h-12 bg-white rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl || 'https://via.placeholder.com/100'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111111] line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-[#858585]">
                      {item.size} | {item.color} (Qty: {item.quantity})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
