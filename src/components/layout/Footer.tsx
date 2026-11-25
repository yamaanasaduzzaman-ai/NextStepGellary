'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubscribing(true);
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribeStatus(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        setSubscribeStatus(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      setSubscribeStatus('An error occurred. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#111111] text-[#F8F7F4] pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-neutral-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif tracking-[0.25em] text-xl font-bold uppercase text-[#F8F7F4]">
                Nexstep Gallery
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-[#858585] uppercase -mt-0.5">
                Luxury Fashion & Atelier
              </span>
            </Link>
            <p className="text-xs text-[#858585] max-w-sm leading-relaxed font-sans">
              Nexstep Gallery curates timeless contemporary apparel where minimalist luxury
              meets South Asian artisanal craftsmanship. Engineered for refined silhouettes, enduring quality, and discreet sophistication.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://wa.me/8801700112233"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#C6AE91] hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Concierge (+880 1700-112233)</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F8F7F4]">
              Collections
            </h3>
            <ul className="space-y-2 text-xs text-[#858585]">
              <li>
                <Link href="/shop" className="hover:text-[#C6AE91] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="hover:text-[#C6AE91] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/category/panjabi" className="hover:text-[#C6AE91] transition-colors">
                  Panjabi & Heritage
                </Link>
              </li>
              <li>
                <Link href="/category/men" className="hover:text-[#C6AE91] transition-colors">
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/category/women" className="hover:text-[#C6AE91] transition-colors">
                  Women&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=featured" className="hover:text-[#C6AE91] transition-colors">
                  Featured Editions
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F8F7F4]">
              Client Care
            </h3>
            <ul className="space-y-2 text-xs text-[#858585]">
              <li>
                <Link href="/order-tracking" className="hover:text-[#C6AE91] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-[#C6AE91] transition-colors">
                  Size & Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-[#C6AE91] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-[#C6AE91] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#C6AE91] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C6AE91] transition-colors">
                  Contact Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F8F7F4]">
              The Gazette
            </h3>
            <p className="text-xs text-[#858585] leading-relaxed">
              Subscribe for private previews, seasonal collections, and sartorial notes.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1c1c1c] text-xs text-[#F8F7F4] px-3 py-2.5 rounded-sm border border-neutral-700 focus:outline-none focus:border-[#C6AE91] transition-all"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#C6AE91] text-[#111111] text-xs font-medium rounded-sm hover:bg-white transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribeStatus && (
                <p className="text-[11px] text-[#C6AE91] mt-1">{subscribeStatus}</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Section: Payment Logos & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#858585] tracking-wider uppercase">
            <span>Accepted Payments in Bangladesh:</span>
            <span className="px-2 py-0.5 bg-[#1c1c1c] rounded text-[#F8F7F4] font-semibold">bKash</span>
            <span className="px-2 py-0.5 bg-[#1c1c1c] rounded text-[#F8F7F4] font-semibold">Nagad</span>
            <span className="px-2 py-0.5 bg-[#1c1c1c] rounded text-[#F8F7F4] font-semibold">Visa</span>
            <span className="px-2 py-0.5 bg-[#1c1c1c] rounded text-[#F8F7F4] font-semibold">MasterCard</span>
            <span className="px-2 py-0.5 bg-[#1c1c1c] rounded text-[#F8F7F4] font-semibold">Cash On Delivery</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-[#858585]">
            <Link href="/policies/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span>© {new Date().getFullYear()} Nexstep Gallery Ltd. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
