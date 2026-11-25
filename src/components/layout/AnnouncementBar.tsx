'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useCustomization } from '@/context/CustomizationContext';

const DEFAULT_ANNOUNCEMENTS = [
  { text: 'COMPLIMENTARY EXPRESS DELIVERY ON ORDERS OVER ৳3,000', link: '/shop' },
  { text: 'THE MONOCHROME EDIT 2026 — DISCOVER THE NEW ARRIVALS', link: '/shop?filter=new' },
  { text: 'USE PROMO "NEXSTEP10" FOR 10% OFF YOUR FIRST ORDER', link: '/shop' },
];

export function AnnouncementBar() {
  const { customization } = useCustomization();
  const [currentIndex, setCurrentIndex] = useState(0);

  const customBar = customization?.headerSettings?.announcementBar;
  const isEnabled = customBar ? customBar.enabled !== false : true;

  const messages =
    customBar?.text
      ? [{ text: customBar.text, link: customBar.link || '/shop' }]
      : DEFAULT_ANNOUNCEMENTS;

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (!isEnabled) return null;

  const current = messages[currentIndex] || messages[0];
  const bgColor = customBar?.bgColor || '#111111';
  const textColor = customBar?.textColor || '#F8F7F4';

  return (
    <div
      className="text-[11px] font-medium tracking-[0.18em] py-2 px-4 text-center transition-all duration-500 overflow-hidden relative"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <Link
          href={current.link}
          className="hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
        >
          <span>{current.text}</span>
          <ChevronRight className="w-3 h-3 text-[#C6AE91]" />
        </Link>
      </div>
    </div>
  );
}
