import React from 'react';
import prisma from '@/lib/prisma';
import { formatBDT } from '@/lib/utils';
import { Download, DollarSign, TrendingUp, PackageCheck } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReportsPage() {
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID' },
    orderBy: { createdAt: 'desc' },
  });

  const totalGrossSales = paidOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalDiscounts = paidOrders.reduce((acc, o) => acc + o.discountAmount, 0);
  const totalShipping = paidOrders.reduce((acc, o) => acc + o.shippingCost, 0);
  const netSales = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  // COD specific collection
  const codPaidOrders = paidOrders.filter((o) => o.paymentMethod === 'COD');
  const totalCodCollected = codPaidOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Financial Intelligence & Sales Reports
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Audit-ready statement of gross revenue, discounts, shipping earnings, and net cash receipts.
          </p>
        </div>

        <a
          href="/api/admin/orders/export"
          download="nexstep_orders_export.csv"
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Orders CSV</span>
        </a>
      </div>

      {/* Financial Statement Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Gross Catalog Sales
          </span>
          <p className="text-xl font-bold text-[#111111] mt-1">{formatBDT(totalGrossSales)}</p>
          <span className="text-[10px] text-[#858585]">Prior to promotions</span>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Promotional Discounts
          </span>
          <p className="text-xl font-bold text-red-600 mt-1">-{formatBDT(totalDiscounts)}</p>
          <span className="text-[10px] text-[#858585]">Coupons & incentives</span>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Delivery Revenue
          </span>
          <p className="text-xl font-bold text-blue-600 mt-1">+{formatBDT(totalShipping)}</p>
          <span className="text-[10px] text-[#858585]">Logistics charges collected</span>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Net Realized Receipts
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatBDT(netSales)}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Net Cash Balance</span>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
        <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-3">
          Cash on Delivery (COD) vs Digital Gateway Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-[#F8F7F4] rounded-sm space-y-2">
            <strong className="text-sm font-bold text-[#111111] block">
              Cash on Delivery (COD) Collections
            </strong>
            <p className="text-lg font-bold text-[#111111]">{formatBDT(totalCodCollected)}</p>
            <p className="text-[11px] text-[#858585]">
              Total COD fulfilled orders: {codPaidOrders.length} orders
            </p>
          </div>

          <div className="p-4 bg-[#F8F7F4] rounded-sm space-y-2">
            <strong className="text-sm font-bold text-[#111111] block">
              Digital Prepaid (bKash, Nagad, SSLCommerz)
            </strong>
            <p className="text-lg font-bold text-[#111111]">
              {formatBDT(netSales - totalCodCollected)}
            </p>
            <p className="text-[11px] text-[#858585]">
              Prepaid instant settlement orders: {paidOrders.length - codPaidOrders.length} orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
