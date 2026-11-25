'use client';

import React, { useState } from 'react';

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<'panjabi' | 'shirts' | 'tshirts' | 'trousers'>('panjabi');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Precision Fitting
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] uppercase tracking-tight">
          Atelier Size & Measurement Guide
        </h1>
        <p className="text-xs text-[#858585] max-w-lg mx-auto">
          Every Nexstep piece is cut according to architectural proportions. Refer to the specific category tables below.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8 border-b border-[#EAEAEA] pb-4 overflow-x-auto">
        {[
          { id: 'panjabi', label: 'Panjabi & Kurtas' },
          { id: 'shirts', label: 'Formal & Casual Shirts' },
          { id: 'tshirts', label: 'Heavyweight T-Shirts' },
          { id: 'trousers', label: 'Pleated Trousers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#111111] text-white'
                : 'text-[#858585] hover:text-[#111111] hover:bg-[#F4EFEA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-sm border border-[#EAEAEA] shadow-sm overflow-x-auto">
        {/* PANJABI */}
        {activeTab === 'panjabi' && (
          <div>
            <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-4">
              Panjabi Measurements (Inches)
            </h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EAEAEA] text-[#111111]">
                  <th className="py-3 px-4 font-bold uppercase">Size</th>
                  <th className="py-3 px-4 font-bold uppercase">Chest (Round)</th>
                  <th className="py-3 px-4 font-bold uppercase">Length</th>
                  <th className="py-3 px-4 font-bold uppercase">Shoulder</th>
                  <th className="py-3 px-4 font-bold uppercase">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[#858585]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">S (38)</td>
                  <td className="py-3 px-4">40&quot;</td>
                  <td className="py-3 px-4">40&quot;</td>
                  <td className="py-3 px-4">17.5&quot;</td>
                  <td className="py-3 px-4">24.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">M (40)</td>
                  <td className="py-3 px-4">42&quot;</td>
                  <td className="py-3 px-4">42&quot;</td>
                  <td className="py-3 px-4">18.0&quot;</td>
                  <td className="py-3 px-4">25.0&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">L (42)</td>
                  <td className="py-3 px-4">44&quot;</td>
                  <td className="py-3 px-4">44&quot;</td>
                  <td className="py-3 px-4">18.5&quot;</td>
                  <td className="py-3 px-4">25.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">XL (44)</td>
                  <td className="py-3 px-4">46&quot;</td>
                  <td className="py-3 px-4">45&quot;</td>
                  <td className="py-3 px-4">19.25&quot;</td>
                  <td className="py-3 px-4">26.0&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SHIRTS */}
        {activeTab === 'shirts' && (
          <div>
            <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-4">
              Shirts Measurements (Inches)
            </h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EAEAEA] text-[#111111]">
                  <th className="py-3 px-4 font-bold uppercase">Size</th>
                  <th className="py-3 px-4 font-bold uppercase">Collar</th>
                  <th className="py-3 px-4 font-bold uppercase">Chest</th>
                  <th className="py-3 px-4 font-bold uppercase">Waist</th>
                  <th className="py-3 px-4 font-bold uppercase">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[#858585]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">S (15)</td>
                  <td className="py-3 px-4">15.0&quot;</td>
                  <td className="py-3 px-4">39&quot;</td>
                  <td className="py-3 px-4">36&quot;</td>
                  <td className="py-3 px-4">29.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">M (15.5)</td>
                  <td className="py-3 px-4">15.5&quot;</td>
                  <td className="py-3 px-4">41&quot;</td>
                  <td className="py-3 px-4">38&quot;</td>
                  <td className="py-3 px-4">30.0&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">L (16)</td>
                  <td className="py-3 px-4">16.0&quot;</td>
                  <td className="py-3 px-4">43&quot;</td>
                  <td className="py-3 px-4">40&quot;</td>
                  <td className="py-3 px-4">30.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">XL (16.5)</td>
                  <td className="py-3 px-4">16.5&quot;</td>
                  <td className="py-3 px-4">45&quot;</td>
                  <td className="py-3 px-4">42&quot;</td>
                  <td className="py-3 px-4">31.0&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* T-SHIRTS */}
        {activeTab === 'tshirts' && (
          <div>
            <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-4">
              Heavyweight Boxy T-Shirts (Inches)
            </h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EAEAEA] text-[#111111]">
                  <th className="py-3 px-4 font-bold uppercase">Size</th>
                  <th className="py-3 px-4 font-bold uppercase">Chest (Pit to Pit)</th>
                  <th className="py-3 px-4 font-bold uppercase">Body Length</th>
                  <th className="py-3 px-4 font-bold uppercase">Shoulder Drop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[#858585]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">S</td>
                  <td className="py-3 px-4">21.5&quot;</td>
                  <td className="py-3 px-4">27.5&quot;</td>
                  <td className="py-3 px-4">20.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">M</td>
                  <td className="py-3 px-4">22.5&quot;</td>
                  <td className="py-3 px-4">28.5&quot;</td>
                  <td className="py-3 px-4">21.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">L</td>
                  <td className="py-3 px-4">23.5&quot;</td>
                  <td className="py-3 px-4">29.5&quot;</td>
                  <td className="py-3 px-4">22.5&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TROUSERS */}
        {activeTab === 'trousers' && (
          <div>
            <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-4">
              Tailored Trousers (Inches)
            </h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EAEAEA] text-[#111111]">
                  <th className="py-3 px-4 font-bold uppercase">Waist Size</th>
                  <th className="py-3 px-4 font-bold uppercase">Inseam</th>
                  <th className="py-3 px-4 font-bold uppercase">Outseam</th>
                  <th className="py-3 px-4 font-bold uppercase">Thigh</th>
                  <th className="py-3 px-4 font-bold uppercase">Leg Opening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[#858585]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">30</td>
                  <td className="py-3 px-4">30&quot;</td>
                  <td className="py-3 px-4">40&quot;</td>
                  <td className="py-3 px-4">24&quot;</td>
                  <td className="py-3 px-4">14.5&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">32</td>
                  <td className="py-3 px-4">31&quot;</td>
                  <td className="py-3 px-4">41&quot;</td>
                  <td className="py-3 px-4">25&quot;</td>
                  <td className="py-3 px-4">15.0&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#111111]">34</td>
                  <td className="py-3 px-4">32&quot;</td>
                  <td className="py-3 px-4">42&quot;</td>
                  <td className="py-3 px-4">26&quot;</td>
                  <td className="py-3 px-4">15.5&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
