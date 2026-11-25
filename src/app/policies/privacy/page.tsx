import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-[#EAEAEA] pb-6 mb-8">
        <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
          Legal
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] uppercase tracking-tight mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#858585] mt-1">Last Updated: January 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-xs text-[#252525] space-y-6 leading-relaxed">
        <p>
          At Nexstep Gallery, we are dedicated to preserving the discretion, privacy, and confidentiality of our clients. This document details our procedures regarding the collection, storage, and processing of your personal information.
        </p>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            1. Information Collected
          </h2>
          <p>
            We collect personal information necessary to fulfill your orders, including full name, delivery address, phone number, and email. Payment details (bKash PINs, Card numbers) are processed exclusively through certified PCI-DSS compliant payment gateways (SSLCommerz) and are never stored on our servers.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
            2. Confidentiality & Security
          </h2>
          <p>
            Your information is never sold, traded, or shared with third parties, excluding designated courier providers strictly for delivery fulfillment.
          </p>
        </section>
      </div>
    </div>
  );
}
