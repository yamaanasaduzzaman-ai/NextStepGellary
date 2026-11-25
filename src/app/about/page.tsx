import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Scissors, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative w-full h-[60vh] bg-[#111111] overflow-hidden flex items-center justify-center text-center">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600"
          alt="Nexstep Atelier"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="relative max-w-2xl px-4 space-y-3">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
            Our Heritage & Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-tight">
            The Philosophy of Nexstep Gallery
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
            Where understated contemporary elegance meets the enduring soul of South Asian loom traditions.
          </p>
        </div>
      </section>

      {/* Story Sections */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
              The Genesis
            </span>
            <h2 className="text-2xl font-serif text-[#111111]">
              Born in Dhaka. Designed for the World.
            </h2>
            <p className="text-xs text-[#858585] leading-relaxed">
              Nexstep Gallery was created to fill a profound void in modern pret: the lack of clothing that honors the luxurious tactile heritage of Bengal without falling victim to fleeting, garish trends.
            </p>
            <p className="text-xs text-[#858585] leading-relaxed">
              We look to architecture—clean lines, deliberate silhouettes, breathable drape, and enduring materials. Whether in a handcrafted silk-cotton Panjabi or an oversized boxy tee cut from 280 GSM combed cotton, our focus is uncompromising restraint.
            </p>
          </div>
          <div className="relative aspect-[4/5] bg-neutral-200 rounded-sm overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800"
              alt="Atelier Craft"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-[#EAEAEA]">
          <div className="space-y-2 text-center p-6 bg-white rounded-sm border border-[#EAEAEA]">
            <Scissors className="w-6 h-6 text-[#C6AE91] mx-auto mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Architectural Tailoring
            </h3>
            <p className="text-xs text-[#858585] leading-relaxed">
              Patterns developed iteratively to drape effortlessly across different postures and body frames.
            </p>
          </div>

          <div className="space-y-2 text-center p-6 bg-white rounded-sm border border-[#EAEAEA]">
            <Sparkles className="w-6 h-6 text-[#C6AE91] mx-auto mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Natural Fibers
            </h3>
            <p className="text-xs text-[#858585] leading-relaxed">
              Pure mulberry silks, long-staple Supima and Giza cottons, and ethical fine merino wools.
            </p>
          </div>

          <div className="space-y-2 text-center p-6 bg-white rounded-sm border border-[#EAEAEA]">
            <Globe className="w-6 h-6 text-[#C6AE91] mx-auto mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Responsible Luxury
            </h3>
            <p className="text-xs text-[#858585] leading-relaxed">
              Small batch releases that prevent inventory waste and ensure fair artisan livelihoods.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
