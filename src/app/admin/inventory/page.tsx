'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Layers,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { formatBDT, formatDateTime } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment modal
  const [adjustModalVariant, setAdjustModalVariant] = useState<any | null>(null);
  const [qtyChange, setQtyChange] = useState<number>(5);
  const [reason, setReason] = useState('New shipment intake from factory atelier');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch overview
      const res = await fetch('/api/admin/inventory/adjust');
      // For overview we can fetch variants
      const prodRes = await fetch('/api/products?limit=50&admin=true');
      const prodData = await prodRes.json();

      let allVariants: any[] = [];
      if (prodData.products) {
        prodData.products.forEach((p: any) => {
          if (p.variants) {
            p.variants.forEach((v: any) => {
              allVariants.push({ ...v, product: p });
            });
          }
        });
      }

      const totalStock = allVariants.reduce((acc, v) => acc + v.stock, 0);
      const lowStock = allVariants.filter((v) => v.stock <= 10);
      const totalVal = allVariants.reduce(
        (acc, v) => acc + (v.product.costPrice || v.product.regularPrice * 0.5) * v.stock,
        0
      );

      setOverview({
        variants: allVariants,
        totalStock,
        totalValuation: Math.round(totalVal),
        lowStockCount: lowStock.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalVariant) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: adjustModalVariant.id,
          quantityChange: qtyChange,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Stock adjusted successfully & movement logged.');
        setTimeout(() => {
          setAdjustModalVariant(null);
          setMessage(null);
          loadData();
        }, 1500);
      } else {
        setMessage(data.error || 'Failed to adjust stock');
      }
    } catch (err) {
      setMessage('Error submitting stock adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Inventory & Stock Reconciliation
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Real-time variant stock balances, low-stock alerts, and movement audit logs.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Total In-Stock Units
          </span>
          <p className="text-2xl font-bold text-[#111111] mt-1">
            {overview?.totalStock || 0} pieces
          </p>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Estimated Inventory Valuation
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {formatBDT(overview?.totalValuation || 0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#EAEAEA] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-wider block">
            Low Stock Threshold Alerts (&le; 10)
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {overview?.lowStockCount || 0} variations
          </p>
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAEAEA] flex justify-between items-center bg-[#F8F7F4]">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
            Live Variant Stock Records
          </h2>
          <button
            type="button"
            onClick={loadData}
            className="text-xs text-[#111111] hover:text-[#C6AE91] flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Product</th>
                <th className="py-3 px-4 font-semibold uppercase">Variant SKU</th>
                <th className="py-3 px-4 font-semibold uppercase">Size</th>
                <th className="py-3 px-4 font-semibold uppercase">Color</th>
                <th className="py-3 px-4 font-semibold uppercase">Current Stock</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {overview?.variants?.map((v: any) => (
                <tr key={v.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#111111]">{v.product?.name}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600">{v.sku}</td>
                  <td className="py-3 px-4 font-bold">{v.size}</td>
                  <td className="py-3 px-4">{v.color}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        v.stock === 0
                          ? 'text-red-600'
                          : v.stock <= 10
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {v.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setAdjustModalVariant(v)}
                      className="px-3 py-1 bg-[#111111] text-white text-[10px] uppercase font-semibold rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      {adjustModalVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAdjustModalVariant(null)}
          />
          <div className="relative bg-white rounded-sm max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-sm font-semibold tracking-luxury uppercase text-[#111111]">
              Inventory Stock Adjustment
            </h3>
            <div className="text-xs text-[#858585] space-y-1">
              <p>Product: <strong className="text-[#111111]">{adjustModalVariant.product?.name}</strong></p>
              <p>Variation: <strong>{adjustModalVariant.size} - {adjustModalVariant.color}</strong></p>
              <p>Current Balance: <strong>{adjustModalVariant.stock} units</strong></p>
            </div>

            {message ? (
              <p className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-sm">{message}</p>
            ) : (
              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#111111] block mb-1">
                    Quantity Change (+ to Add, - to Deduct)
                  </label>
                  <input
                    type="number"
                    required
                    value={qtyChange}
                    onChange={(e) => setQtyChange(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#EAEAEA] rounded-sm font-bold"
                  />
                  <span className="text-[10px] text-[#858585]">
                    New balance will be: {adjustModalVariant.stock + qtyChange} units
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#111111] block mb-1">
                    Audit Log Reason *
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Factory restock delivery / Damage write-off"
                    className="w-full p-2.5 border border-[#EAEAEA] rounded-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModalVariant(null)}
                    className="flex-1 py-2.5 border border-[#EAEAEA] text-[#111111] rounded-sm uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#111111] text-white rounded-sm uppercase tracking-wider font-semibold hover:bg-[#C6AE91] hover:text-[#111111]"
                  >
                    {submitting ? 'Updating...' : 'Confirm Adjustment'}
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
