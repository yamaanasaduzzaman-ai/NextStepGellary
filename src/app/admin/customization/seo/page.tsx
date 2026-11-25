'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  AlertCircle,
  Save,
  Globe,
  FileCode,
} from 'lucide-react';

export default function SeoSettingsPage() {
  const [seo, setSeo] = useState({
    metaTitle: 'Nexstep Gallery | Modern Luxury Fashion & Contemporary Apparel',
    metaDescription: 'Nexstep Gallery curates minimal luxury fashion, tailored menswear, effortless womenswear, and bespoke craftsmanship in Bangladesh.',
    keywords: 'luxury fashion, nexstep gallery, menswear dhaka, womenswear, minimal fashion, silk dresses, tailoring bangladesh',
    ogImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    canonicalBase: 'https://nexstepgallery.com',
    googleAnalyticsId: '',
    facebookPixelId: '',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://nexstepgallery.com/sitemap.xml',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/customization?draft=true');
        const data = await res.json();
        if (data.data?.seoSettings) {
          setSeo((prev) => ({ ...prev, ...data.data.seoSettings }));
        }
      } catch (e) {}
    }
    load();
  }, []);

  const handleSave = async (publish: boolean) => {
    try {
      setSaving(true);
      await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftSeoSettings: seo,
          publishImmediately: publish,
        }),
      });

      showToast(publish ? 'SEO settings published live!' : 'SEO draft saved!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Global SEO & Analytics Settings
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure site-wide metadata, social graph cards, tracking pixels, and search engine directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-[#111111] text-[#111111] text-xs font-semibold rounded-sm hover:bg-neutral-100"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111]"
          >
            Publish Live
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-sm text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Meta Information */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Default Meta Information
        </h2>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label className="font-semibold text-[#111111]">Default Browser Title</label>
            <span className="text-[10px] text-[#858585]">{seo.metaTitle.length} characters</span>
          </div>
          <input
            type="text"
            value={seo.metaTitle}
            onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
            className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label className="font-semibold text-[#111111]">Default Meta Description</label>
            <span className="text-[10px] text-[#858585]">{seo.metaDescription.length} characters</span>
          </div>
          <textarea
            rows={3}
            value={seo.metaDescription}
            onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
            className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Global Keywords
            </label>
            <input
              type="text"
              value={seo.keywords}
              onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Social Share OpenGraph Image URL
            </label>
            <input
              type="text"
              value={seo.ogImage}
              onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Analytics & Search Directives */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Analytics & Search Engine Directives
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Google Analytics Measurement ID (GA4)
            </label>
            <input
              type="text"
              value={seo.googleAnalyticsId}
              onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Meta / Facebook Pixel ID
            </label>
            <input
              type="text"
              value={seo.facebookPixelId}
              onChange={(e) => setSeo({ ...seo, facebookPixelId: e.target.value })}
              placeholder="123456789012345"
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1">
            Robots.txt Content
          </label>
          <textarea
            rows={4}
            value={seo.robotsTxt}
            onChange={(e) => setSeo({ ...seo, robotsTxt: e.target.value })}
            className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono bg-neutral-50"
          />
        </div>
      </div>
    </div>
  );
}
