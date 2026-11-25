import React from 'react';
import prisma from '@/lib/prisma';
import { formatBDT } from '@/lib/utils';
import { Settings, CheckCircle2, Shield } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'default' },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="pb-6 border-b border-[#EAEAEA]">
        <h1 className="text-2xl font-serif font-light text-[#111111]">
          Platform & Localization Settings
        </h1>
        <p className="text-xs text-[#858585] mt-0.5">
          General atelier attributes, Bangladesh delivery zones, currency, and gateway configs.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Store Information */}
        <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-2">
            1. Brand & Atelier Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#858585] block mb-1">Store Name</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-bold text-[#111111]">
                {settings?.storeName || 'Nexstep Gallery'}
              </p>
            </div>
            <div>
              <span className="text-[#858585] block mb-1">Currency & Symbol</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-bold text-[#111111]">
                {settings?.currency || 'BDT'} ({settings?.currencySymbol || '৳'})
              </p>
            </div>
            <div>
              <span className="text-[#858585] block mb-1">Support Email</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-medium text-[#111111]">
                {settings?.contactEmail || 'support@nexstepgallery.com'}
              </p>
            </div>
            <div>
              <span className="text-[#858585] block mb-1">Client Hotline</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-medium text-[#111111]">
                {settings?.contactPhone || '+880 1700-112233'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#858585] block mb-1">Atelier Address</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-medium text-[#111111]">
                {settings?.address || 'Gulshan 2, Dhaka 1212, Bangladesh'}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Tariffs */}
        <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-2">
            2. Bangladesh Delivery Charges & Thresholds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#858585] block mb-1">Inside Dhaka City Fee</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-bold text-[#111111]">
                {formatBDT(settings?.insideDhakaShipping || 70)}
              </p>
            </div>
            <div>
              <span className="text-[#858585] block mb-1">Outside Dhaka City Fee</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-bold text-[#111111]">
                {formatBDT(settings?.outsideDhakaShipping || 130)}
              </p>
            </div>
            <div>
              <span className="text-[#858585] block mb-1">Complimentary Threshold</span>
              <p className="p-2.5 bg-[#F8F7F4] rounded-sm font-bold text-emerald-700">
                {formatBDT(settings?.freeShippingThreshold || 3000)}
              </p>
            </div>
          </div>
        </div>

        {/* Gateway Integrations */}
        <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] border-b border-[#EAEAEA] pb-2">
            3. Integrated Payment Gateways
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 border border-[#EAEAEA] rounded-sm flex items-center justify-between">
              <span className="font-semibold text-[#111111]">Cash on Delivery</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="p-3 border border-[#EAEAEA] rounded-sm flex items-center justify-between">
              <span className="font-semibold text-[#111111]">bKash Gateway</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="p-3 border border-[#EAEAEA] rounded-sm flex items-center justify-between">
              <span className="font-semibold text-[#111111]">Nagad Gateway</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="p-3 border border-[#EAEAEA] rounded-sm flex items-center justify-between">
              <span className="font-semibold text-[#111111]">SSLCommerz</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
