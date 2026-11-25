import React from 'react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-[#EAEAEA] pb-6 mb-8">
        <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
          Store Policies
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] uppercase tracking-tight mt-1">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-[#858585] mt-1">Effective Date: January 1, 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-xs text-[#252525] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            1. Nationwide Coverage
          </h2>
          <p>
            Nexstep Gallery delivers directly to customers across all 64 administrative districts in Bangladesh through trusted courier logistics partners including Steadfast, Pathao, and RedX.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            2. Shipping Rates & Timeframes
          </h2>
          <div className="p-4 bg-white border border-[#EAEAEA] rounded-sm space-y-2">
            <p>• <strong>Inside Dhaka Metropolitan Area:</strong> ৳70 (Delivered within 24 to 48 hours).</p>
            <p>• <strong>Outside Dhaka (All other 63 districts):</strong> ৳130 (Delivered within 48 to 72 hours).</p>
            <p>• <strong>Complimentary Shipping:</strong> Orders with a net value of ৳3,000 or greater qualify for 100% Free Express Delivery.</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            3. Order Tracking
          </h2>
          <p>
            Upon parcel dispatch from our central Dhaka atelier, a real-time Consignment Tracking ID is linked to your order. You can monitor the shipment anytime via our <Link href="/order-tracking" className="underline font-semibold">Order Tracking Portal</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
