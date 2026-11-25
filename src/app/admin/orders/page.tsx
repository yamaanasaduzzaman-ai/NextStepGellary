import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatBDT, formatDateTime } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; paymentStatus?: string };
}) {
  const where: any = {};
  if (searchParams.status) where.orderStatus = searchParams.status;
  if (searchParams.paymentStatus) where.paymentStatus = searchParams.paymentStatus;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      shipment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Order Fulfillment & Logistics
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Manage incoming orders, update stages, verify COD payments, and assign couriers.
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: 'All Orders', status: '' },
          { label: 'Pending', status: 'PENDING' },
          { label: 'Confirmed', status: 'CONFIRMED' },
          { label: 'Processing', status: 'PROCESSING' },
          { label: 'Packed', status: 'PACKED' },
          { label: 'Shipped', status: 'SHIPPED' },
          { label: 'Delivered', status: 'DELIVERED' },
          { label: 'Cancelled', status: 'CANCELLED' },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.status ? `/admin/orders?status=${tab.status}` : '/admin/orders'}
            className={`px-3 py-1.5 rounded-sm border transition-colors ${
              searchParams.status === tab.status || (!searchParams.status && !tab.status)
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'border-[#EAEAEA] bg-white text-[#111111] hover:bg-[#F4EFEA]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Order Number</th>
                <th className="py-3 px-4 font-semibold uppercase">Date & Time</th>
                <th className="py-3 px-4 font-semibold uppercase">Customer</th>
                <th className="py-3 px-4 font-semibold uppercase">Destination</th>
                <th className="py-3 px-4 font-semibold uppercase">Payment</th>
                <th className="py-3 px-4 font-semibold uppercase">Fulfillment Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#858585]">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111111]">{ord.orderNumber}</td>
                    <td className="py-3 px-4 text-[#858585]">{formatDateTime(ord.createdAt)}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#111111]">{ord.customerName}</p>
                      <span className="text-[10px] text-[#858585]">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-[#858585]">
                      {ord.shippingDistrict}, {ord.shippingDivision}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold uppercase block">{ord.paymentMethod}</span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          ord.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        ● {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 text-[#111111]">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#111111]">
                      {formatBDT(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="px-3 py-1 bg-[#111111] text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111]"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
