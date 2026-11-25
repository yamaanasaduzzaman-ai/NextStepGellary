import React from 'react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminReturnsPage() {
  const requests = await prisma.returnRequest.findMany({
    include: {
      order: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-[#EAEAEA]">
        <h1 className="text-2xl font-serif font-light text-[#111111]">
          Returns, Exchanges & Concierge Refunds
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          Process customer return claims, approve size exchanges, and trigger inventory restock.
        </p>
      </div>

      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Request Date</th>
                <th className="py-3 px-4 font-semibold uppercase">Order Number</th>
                <th className="py-3 px-4 font-semibold uppercase">Customer</th>
                <th className="py-3 px-4 font-semibold uppercase">Type</th>
                <th className="py-3 px-4 font-semibold uppercase">Reason</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#858585]">
                    No return or exchange claims currently active.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3 px-4 text-[#858585]">{formatDate(req.createdAt)}</td>
                    <td className="py-3 px-4 font-bold text-[#111111]">
                      {req.order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {req.order.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-neutral-100 font-bold uppercase text-[10px] rounded">
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#858585] max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold uppercase text-[10px]">
                        {req.status}
                      </span>
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
