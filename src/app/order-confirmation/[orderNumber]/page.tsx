import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, Printer, ArrowRight, Truck, PackageCheck, Clock } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatBDT, formatDateTime } from '@/lib/utils';

interface OrderConfirmationProps {
  params: {
    orderNumber: string;
  };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
      payments: true,
      orderTimeline: { orderBy: { createdAt: 'desc' } },
      shipment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Banner */}
      <div className="text-center space-y-3 mb-10">
        <CheckCircle2 className="w-16 h-16 text-[#C6AE91] mx-auto animate-fadeIn" />
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] tracking-tight">
          Thank you for choosing Nexstep Gallery
        </h1>
        <p className="text-xs text-[#858585] max-w-md mx-auto">
          Your order <strong>{order.orderNumber}</strong> has been registered in our atelier system.
          A confirmation dispatch has been sent to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      <div className="bg-white p-8 rounded-sm border border-[#EAEAEA] shadow-sm space-y-8">
        {/* Order Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#EAEAEA] text-xs">
          <div>
            <span className="text-[#858585] block">Order Number</span>
            <strong className="text-[#111111] font-bold">{order.orderNumber}</strong>
          </div>
          <div>
            <span className="text-[#858585] block">Order Date</span>
            <strong className="text-[#111111]">{formatDateTime(order.createdAt)}</strong>
          </div>
          <div>
            <span className="text-[#858585] block">Payment Method</span>
            <strong className="text-[#111111] uppercase">{order.paymentMethod}</strong>
          </div>
          <div>
            <span className="text-[#858585] block">Payment Status</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Purchased Items */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
            Purchased Creations
          </h2>
          <div className="divide-y divide-[#EAEAEA]">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-4">
                  <div className="relative w-14 h-18 bg-[#ECE8E1] rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl || 'https://via.placeholder.com/100'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111111]">{item.productName}</p>
                    <p className="text-[11px] text-[#858585]">
                      SKU: {item.productSku} | Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-[11px] text-[#858585]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#111111]">{formatBDT(item.totalPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="pt-6 border-t border-[#EAEAEA] flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-[#858585]">
              <span>Subtotal</span>
              <span className="text-[#111111] font-semibold">{formatBDT(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.couponCode})</span>
                <span>-{formatBDT(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#858585]">
              <span>Delivery Cost</span>
              <span className="text-[#111111] font-semibold">
                {order.shippingCost === 0 ? 'FREE' : formatBDT(order.shippingCost)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#EAEAEA] flex justify-between text-base font-bold text-[#111111]">
              <span>Total Paid / Payable</span>
              <span>{formatBDT(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Details */}
        <div className="pt-6 border-t border-[#EAEAEA] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 className="font-semibold uppercase tracking-wider text-[#111111] mb-2">
              Delivery Destination
            </h3>
            <p className="text-[#252525] font-medium">{order.customerName}</p>
            <p className="text-[#858585]">{order.shippingStreet}</p>
            {order.shippingArea && <p className="text-[#858585]">{order.shippingArea}</p>}
            <p className="text-[#858585]">
              {order.shippingDistrict}, {order.shippingDivision}
            </p>
            <p className="text-[#858585]">Contact: {order.customerPhone}</p>
          </div>

          <div>
            <h3 className="font-semibold uppercase tracking-wider text-[#111111] mb-2">
              Delivery Method
            </h3>
            <p className="text-[#252525] font-medium uppercase">{order.shippingMethod} Delivery</p>
            <p className="text-[#858585]">Estimated timeline: 24 - 72 Business Hours</p>
            {order.shipment?.trackingCode && (
              <p className="text-emerald-700 font-semibold mt-1">
                Courier Consignment: {order.shipment.trackingCode}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link
          href={`/order-tracking`}
          className="px-6 py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-luxury rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
        >
          Track Shipment
        </Link>
        <Link
          href="/shop"
          className="px-6 py-3 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-luxury rounded-sm hover:bg-[#F4EFEA] transition-colors"
        >
          Explore More Creations
        </Link>
      </div>
    </div>
  );
}
