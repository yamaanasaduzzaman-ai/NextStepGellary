'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { formatBDT, formatDateTime } from '@/lib/utils';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setNewStatus(data.orderStatus);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setUpdating(true);
      setUpdateMessage(null);
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateMessage('Order status successfully updated & audit timeline recorded.');
        fetchOrder();
        setStatusNote('');
      } else {
        setUpdateMessage(data.error || 'Failed to update status');
      }
    } catch (err) {
      setUpdateMessage('Network error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="py-24 text-center text-xs text-[#858585]">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-serif text-[#111111] font-semibold">
              Order {order.orderNumber}
            </h1>
            <span className="text-xs text-[#858585]">
              Created on {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-1.5 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#F4EFEA] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {updateMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-sm border border-emerald-200">
          {updateMessage}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items, Address, Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items */}
          <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
            <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-2">
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-[#EAEAEA]">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-14 bg-[#ECE8E1] rounded-sm overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl || 'https://via.placeholder.com/100'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <strong className="text-[#111111]">{item.productName}</strong>
                      <p className="text-[11px] text-[#858585]">
                        SKU: {item.productSku} | Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="text-[11px] text-[#858585]">
                        Unit Price: {formatBDT(item.unitPrice)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#111111]">{formatBDT(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#858585]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111111]">{formatBDT(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatBDT(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#858585]">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-[#111111]">{formatBDT(order.shippingCost)}</span>
                </div>
                <div className="pt-2 border-t border-[#EAEAEA] flex justify-between text-sm font-bold text-[#111111]">
                  <span>Total Amount</span>
                  <span>{formatBDT(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-[#111111] mb-2">
                Customer Information
              </h3>
              <p className="font-bold text-[#111111]">{order.customerName}</p>
              <p className="text-[#858585]">Email: {order.customerEmail}</p>
              <p className="text-[#858585]">Phone: {order.customerPhone}</p>
              {order.customerNotes && (
                <p className="text-[#858585] mt-2 italic">Notes: &ldquo;{order.customerNotes}&rdquo;</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider text-[#111111] mb-2">
                Delivery Destination
              </h3>
              <p className="text-[#858585]">{order.shippingStreet}</p>
              {order.shippingArea && <p className="text-[#858585]">{order.shippingArea}</p>}
              <p className="text-[#858585]">
                {order.shippingDistrict}, {order.shippingDivision} {order.shippingPostal}
              </p>
              <p className="font-semibold text-[#111111] mt-2 uppercase">
                Method: {order.shippingMethod}
              </p>
              {order.deliveryInstructions && (
                <p className="text-amber-700 mt-1">Instructions: {order.deliveryInstructions}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Updater */}
          <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-2">
              Update Order Status
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase text-[#858585] block mb-1">
                  Current Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-[#EAEAEA] rounded-sm bg-white font-bold text-[#111111]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED (Auto Restock)</option>
                  <option value="RETURNED">RETURNED (Auto Restock)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#858585] block mb-1">
                  Internal / Customer Note
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Verified by phone call, handed to Pathao"
                  className="w-full p-2 border border-[#EAEAEA] rounded-sm"
                />
              </div>

              <button
                type="submit"
                disabled={updating || newStatus === order.orderStatus}
                className="w-full py-2.5 bg-[#111111] text-white font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors disabled:opacity-40"
              >
                {updating ? 'Recording...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Timeline Audit Log */}
          <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-2">
              Order Audit Timeline
            </h3>

            <div className="space-y-4 text-xs">
              {order.orderTimeline?.map((evt: any) => (
                <div key={evt.id} className="border-l-2 border-[#111111] pl-3 space-y-0.5">
                  <p className="font-bold text-[#111111]">{evt.title}</p>
                  {evt.description && <p className="text-[#858585]">{evt.description}</p>}
                  <span className="text-[10px] text-[#858585] block">
                    {formatDateTime(evt.createdAt)} by {evt.actor || 'System'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
