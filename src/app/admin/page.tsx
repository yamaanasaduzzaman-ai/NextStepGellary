'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  Users,
  Package,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatBDT, formatDateTime } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'this_month' | 'all'>('30days');
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats?period=${period}`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Executive Overview
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Real-time database metrics, order streams, and inventory alerts.
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex bg-white border border-[#EAEAEA] rounded-sm p-1 text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className={`px-3 py-1 rounded-xs font-medium transition-colors ${
                period === tab.id ? 'bg-[#111111] text-white' : 'text-[#858585] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !stats ? (
        <div className="py-24 text-center text-xs text-[#858585]">
          Computing live database aggregations...
        </div>
      ) : (
        <>
          {/* 1. Primary Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
                  Total Revenue
                </span>
                <p className="text-xl font-bold text-[#111111] mt-1">
                  {formatBDT(stats?.totalRevenue || 0)}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Verified Paid Volume</span>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-sm flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Today's Sales */}
            <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
                  Today&apos;s Sales
                </span>
                <p className="text-xl font-bold text-[#111111] mt-1">
                  {formatBDT(stats?.todaySales || 0)}
                </p>
                <span className="text-[10px] text-[#858585]">Since midnight (Asia/Dhaka)</span>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-sm flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
                  Total Orders
                </span>
                <p className="text-xl font-bold text-[#111111] mt-1">{stats?.totalOrders || 0}</p>
                <span className="text-[10px] text-[#858585]">
                  {stats?.deliveredOrders || 0} Delivered / {stats?.cancelledOrders || 0} Cancelled
                </span>
              </div>
              <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-sm flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
                  Stock Alerts
                </span>
                <p className="text-xl font-bold text-amber-600 mt-1">
                  {stats?.lowStockCount || 0} Variants
                </p>
                <Link
                  href="/admin/inventory"
                  className="text-[10px] text-amber-700 underline font-medium"
                >
                  Inspect Inventory →
                </Link>
              </div>
              <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-sm flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Pipeline Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-sm border border-[#EAEAEA]">
            <div className="text-center p-3 border-r border-[#EAEAEA] last:border-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#858585] block">
                Pending Orders
              </span>
              <p className="text-lg font-bold text-amber-600 mt-0.5">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="text-center p-3 border-r border-[#EAEAEA] last:border-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#858585] block">
                Confirmed / In Prep
              </span>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{stats?.confirmedOrders || 0}</p>
            </div>
            <div className="text-center p-3 border-r border-[#EAEAEA] last:border-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#858585] block">
                Shipped & Transit
              </span>
              <p className="text-lg font-bold text-indigo-600 mt-0.5">{stats?.shippedOrders || 0}</p>
            </div>
            <div className="text-center p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#858585] block">
                Delivered
              </span>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">
                {stats?.deliveredOrders || 0}
              </p>
            </div>
          </div>

          {/* 3. Middle Section: Recent Orders & Top Selling Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Orders Table */}
            <div className="lg:col-span-8 bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
                  Recent Customer Orders
                </h3>
                <Link
                  href="/admin/orders"
                  className="text-xs text-[#C6AE91] hover:text-[#111111] font-semibold uppercase tracking-wider"
                >
                  View All Orders →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] text-[#858585]">
                      <th className="py-2.5 font-semibold uppercase">Order ID</th>
                      <th className="py-2.5 font-semibold uppercase">Customer</th>
                      <th className="py-2.5 font-semibold uppercase">Method</th>
                      <th className="py-2.5 font-semibold uppercase">Status</th>
                      <th className="py-2.5 font-semibold uppercase text-right">Amount</th>
                      <th className="py-2.5 font-semibold uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {stats?.recentOrders?.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-[#F8F7F4] transition-colors">
                        <td className="py-3 font-bold text-[#111111]">{ord.orderNumber}</td>
                        <td className="py-3 text-[#252525]">
                          <p className="font-medium">{ord.customerName}</p>
                          <span className="text-[10px] text-[#858585]">{ord.customerPhone}</span>
                        </td>
                        <td className="py-3 uppercase text-[#858585] font-semibold">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-neutral-100 text-[#111111] rounded text-[10px] font-bold uppercase">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-[#111111]">
                          {formatBDT(ord.totalAmount)}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="px-2.5 py-1 bg-[#111111] text-white rounded text-[10px] font-semibold uppercase hover:bg-[#C6AE91] hover:text-[#111111]"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products & Payment Gateways */}
            <div className="lg:col-span-4 space-y-6">
              {/* Top Products */}
              <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
                <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-3">
                  Top Selling Creations
                </h3>
                <div className="space-y-3">
                  {stats?.topSellingProducts?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 text-center text-[#858585] font-bold">#{idx + 1}</span>
                        <p className="font-semibold text-[#111111] line-clamp-1">{item.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-[#111111]">{item.quantity} sold</span>
                        <span className="block text-[10px] text-[#858585]">
                          {formatBDT(item.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
                <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-3">
                  Revenue By Gateway
                </h3>
                <div className="space-y-2 text-xs">
                  {stats?.paymentBreakdown &&
                    Object.entries(stats.paymentBreakdown).map(([gateway, amount]: any) => (
                      <div key={gateway} className="flex justify-between items-center">
                        <span className="text-[#858585] uppercase font-semibold">{gateway}</span>
                        <span className="font-bold text-[#111111]">{formatBDT(amount)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
