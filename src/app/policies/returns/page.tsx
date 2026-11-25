import React from 'react';
import Link from 'next/link';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-[#EAEAEA] pb-6 mb-8">
        <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
          Store Policies
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] uppercase tracking-tight mt-1">
          Return, Exchange & Refund Policy
        </h1>
        <p className="text-xs text-[#858585] mt-1">Effective Date: January 1, 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-xs text-[#252525] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            1. 7-Day Return & Exchange Window
          </h2>
          <p>
            We take pride in exceptional quality. However, if an item does not meet your expectations or sizing requirements, you may initiate a return or exchange request within 7 calendar days from the date of confirmed delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            2. Condition of Garments
          </h2>
          <p>
            To be eligible for an exchange or refund, the garment must be in its original, unworn condition with all garment tags, security seals, and dust bags intact. Pieces showing scent, wash wear, or damage cannot be accepted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            3. How to Request an Exchange or Return
          </h2>
          <p>
            Simply log in to your <Link href="/account" className="underline font-semibold">Customer Account</Link>, open the relevant order, and click &ldquo;Return / Exchange&rdquo;. Our logistics courier will arrange a reverse pickup from your address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            4. Refund Processing
          </h2>
          <p>
            Approved refunds are credited to the customer&apos;s original payment method (bKash, Nagad, or Bank Card) within 3 to 5 business days upon garment inspection at our atelier.
          </p>
        </section>
      </div>
    </div>
  );
}
