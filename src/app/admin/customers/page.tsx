import React from 'react';
import prisma from '@/lib/prisma';
import { formatBDT, formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      customerProfile: true,
      orders: {
        select: { id: true, totalAmount: true, paymentStatus: true },
      },
      addresses: { take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-[#EAEAEA]">
        <h1 className="text-2xl font-serif font-light text-[#111111]">
          Customer Relationship & Profiles
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          View registered patrons, lifetime spend value, and purchase histories.
        </p>
      </div>

      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Customer</th>
                <th className="py-3 px-4 font-semibold uppercase">Phone</th>
                <th className="py-3 px-4 font-semibold uppercase">Registered On</th>
                <th className="py-3 px-4 font-semibold uppercase">Total Orders</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Lifetime Spend</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {customers.map((c) => {
                const totalSpent = c.orders
                  .filter((o) => o.paymentStatus === 'PAID')
                  .reduce((acc, o) => acc + o.totalAmount, 0);

                return (
                  <tr key={c.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3 px-4">
                      <strong className="text-[#111111] font-bold block">{c.name}</strong>
                      <span className="text-[11px] text-[#858585]">{c.email}</span>
                    </td>
                    <td className="py-3 px-4 text-[#858585]">{c.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-[#858585]">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-4 font-semibold">{c.orders.length} orders</td>
                    <td className="py-3 px-4 text-right font-bold text-[#111111]">
                      {formatBDT(totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold uppercase text-[10px]">
                        Active Member
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
