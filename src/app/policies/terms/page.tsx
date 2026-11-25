import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-[#EAEAEA] pb-6 mb-8">
        <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
          Legal
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] uppercase tracking-tight mt-1">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#858585] mt-1">Last Updated: January 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-xs text-[#252525] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or placing an order through nexstepgallery.com, you agree to be bound by these Terms and Conditions and our standard operational policies.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            2. Product Pricing & Currency
          </h2>
          <p>
            All listed prices are denominated in Bangladeshi Taka (BDT ৳) and are inclusive of standard local taxes where applicable. We reserve the right to correct typographical errors or discontinue items without prior notice.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            3. Intellectual Property
          </h2>
          <p>
            All imagery, logos, garment patterns, and editorial texts remain the exclusive intellectual property of Nexstep Gallery Ltd.
          </p>
        </section>
      </div>
    </div>
  );
}
