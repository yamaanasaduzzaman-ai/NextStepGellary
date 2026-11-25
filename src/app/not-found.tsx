import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-28 text-center space-y-4">
      <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#111111]">
        Piece Not Found in Atelier
      </h1>
      <p className="text-xs text-[#858585] max-w-sm mx-auto leading-relaxed">
        The requested archive item or collection page is currently unavailable or has been re-curated.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-luxury rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
        >
          <span>Return to Nexstep Gallery</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
