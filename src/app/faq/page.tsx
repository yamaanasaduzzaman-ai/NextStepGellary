import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Help & Inquiries
        </span>
        <h1 className="text-3xl font-serif font-light text-[#111111] uppercase tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-[#858585] max-w-md mx-auto">
          Common inquiries regarding ordering, delivery timelines, payment gateways, and garment care.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-6 bg-white rounded-sm border border-[#EAEAEA] shadow-sm space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C6AE91]">
              {faq.category}
            </span>
            <h3 className="text-sm font-semibold text-[#111111]">{faq.question}</h3>
            <p className="text-xs text-[#858585] leading-relaxed pt-1">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-[#F8F7F4] rounded-sm border border-[#EAEAEA]">
        <p className="text-xs text-[#111111] font-medium mb-2">Have a question not listed here?</p>
        <Link
          href="/contact"
          className="text-xs font-semibold tracking-luxury uppercase text-[#111111] underline hover:text-[#C6AE91]"
        >
          Contact Our Concierge →
        </Link>
      </div>
    </div>
  );
}
