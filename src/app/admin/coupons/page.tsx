import React from 'react';
import prisma from '@/lib/prisma';
import { formatBDT, formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-[#EAEAEA]">
        <h1 className="text-2xl font-serif font-light text-[#111111]">
          Coupons & Promotional Engine
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          Create percentage discounts, fixed vouchers, usage caps, and seasonal campaign codes.
        </p>
      </div>

      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Coupon Code</th>
                <th className="py-3 px-4 font-semibold uppercase">Discount</th>
                <th className="py-3 px-4 font-semibold uppercase">Min Order Spend</th>
                <th className="py-3 px-4 font-semibold uppercase">Usage Counter</th>
                <th className="py-3 px-4 font-semibold uppercase">Created</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {coupons.map((cpn) => (
                <tr key={cpn.id} className="hover:bg-[#F8F7F4]">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-base text-[#111111] bg-[#F4EFEA] px-2.5 py-1 rounded">
                      {cpn.code}
                    </span>
                    {cpn.description && (
                      <span className="block text-[11px] text-[#858585] mt-1">{cpn.description}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#111111]">
                    {cpn.discountType === 'PERCENTAGE'
                      ? `${cpn.discountValue}% OFF`
                      : cpn.discountType === 'FIXED_AMOUNT'
                      ? `${formatBDT(cpn.discountValue)} FLAT`
                      : 'FREE SHIPPING'}
                  </td>
                  <td className="py-3 px-4 text-[#858585]">
                    {cpn.minOrderAmount ? formatBDT(cpn.minOrderAmount) : 'None'}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#111111]">
                    {cpn.currentUsage} / {cpn.totalUsageLimit || '∞'} redemptions
                  </td>
                  <td className="py-3 px-4 text-[#858585]">{formatDate(cpn.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        cpn.isActive
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {cpn.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
