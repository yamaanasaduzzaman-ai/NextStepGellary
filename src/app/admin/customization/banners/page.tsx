'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function BannerManagementPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<any[]>([
    {
      id: 'b1',
      title: 'Spring / Summer 2026 Runway Capsule',
      subtitle: 'Minimalist luxury tailored cuts from organic Italian linen.',
      ctaText: 'Explore Collection',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop',
      placement: 'HERO',
      isActive: true,
    },
    {
      id: 'b2',
      title: 'The Atelier Suiting & Blazer Suite',
      subtitle: 'Pure Super 130s Merino Wool tailored in Banani.',
      ctaText: 'Discover Tailoring',
      ctaLink: '/category/men',
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      placement: 'SPLIT_LEFT',
      isActive: true,
    },
    {
      id: 'b3',
      title: 'Mulberry Silk Evening Dresses',
      subtitle: 'Ethereal drape and timeless modern silhouettes.',
      ctaText: 'View Dresses',
      ctaLink: '/category/women',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      placement: 'SPLIT_RIGHT',
      isActive: true,
    },
  ]);

  const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadIdx === null) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const updated = [...banners];
      updated[activeUploadIdx].imageUrl = data.url;
      setBanners(updated);
      showToast('Banner image uploaded!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      setActiveUploadIdx(null);
    }
  };

  const handleAddBanner = () => {
    setBanners([
      ...banners,
      {
        id: `b-${Date.now()}`,
        title: 'New Promotional Campaign',
        subtitle: 'Limited seasonal drop.',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
        placement: 'PROMO_STRIP',
        isActive: true,
      },
    ]);
  };

  const handleRemove = (idx: number) => {
    setBanners(banners.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      showToast('Banner campaign settings saved and updated!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Banner & Campaign Management
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure high-resolution editorial banners, split promo cards, and call-to-actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddBanner}
            className="px-3 py-2 border border-[#111111] text-[#111111] text-xs font-semibold rounded-sm hover:bg-[#F8F7F4] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Banner</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Save All Banners</span>
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="space-y-4">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="bg-white border border-[#EAEAEA] rounded-sm p-5 space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative w-36 h-24 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border">
                  {b.imageUrl ? (
                    <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveUploadIdx(idx);
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white text-[10px] flex flex-col items-center justify-center font-medium opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Change Image</span>
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => {
                      const updated = [...banners];
                      updated[idx].title = e.target.value;
                      setBanners(updated);
                    }}
                    placeholder="Headline title"
                    className="w-full text-sm font-semibold p-1.5 border border-[#EAEAEA] rounded-xs"
                  />
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={(e) => {
                      const updated = [...banners];
                      updated[idx].subtitle = e.target.value;
                      setBanners(updated);
                    }}
                    placeholder="Subtitle narrative"
                    className="w-full text-xs p-1.5 border border-[#EAEAEA] rounded-xs text-[#858585]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={b.isActive}
                    onChange={(e) => {
                      const updated = [...banners];
                      updated[idx].isActive = e.target.checked;
                      setBanners(updated);
                    }}
                    className="rounded-xs"
                  />
                  <span>Active</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 border border-[#EAEAEA] rounded-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#EAEAEA] text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#858585] mb-1">
                  Placement Slot
                </label>
                <select
                  value={b.placement}
                  onChange={(e) => {
                    const updated = [...banners];
                    updated[idx].placement = e.target.value;
                    setBanners(updated);
                  }}
                  className="w-full p-1.5 border border-[#EAEAEA] rounded-xs bg-white text-xs font-medium"
                >
                  <option value="HERO">Hero Runway Slider</option>
                  <option value="SPLIT_LEFT">Split Banner (Left / Menswear)</option>
                  <option value="SPLIT_RIGHT">Split Banner (Right / Womenswear)</option>
                  <option value="PROMO_STRIP">Full Width Architectural Promo Strip</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#858585] mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={b.ctaText}
                  onChange={(e) => {
                    const updated = [...banners];
                    updated[idx].ctaText = e.target.value;
                    setBanners(updated);
                  }}
                  placeholder="e.g. Shop Now"
                  className="w-full p-1.5 border border-[#EAEAEA] rounded-xs text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#858585] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={b.ctaLink}
                  onChange={(e) => {
                    const updated = [...banners];
                    updated[idx].ctaLink = e.target.value;
                    setBanners(updated);
                  }}
                  placeholder="/shop"
                  className="w-full p-1.5 border border-[#EAEAEA] rounded-xs text-xs font-mono"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
