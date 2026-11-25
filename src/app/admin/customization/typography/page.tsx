'use client';

import React, { useState, useEffect } from 'react';
import { Type, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function TypographyCustomizationPage() {
  const [typography, setTypography] = useState({
    fontHeading: 'Cinzel, Georgia, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    headingScale: '1.25',
    baseFontSize: '14px',
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
        if (data.data?.themeSettings) {
          const t = data.data.themeSettings;
          setTypography((prev) => ({
            ...prev,
            fontHeading: t.fontHeading || prev.fontHeading,
            fontBody: t.fontBody || prev.fontBody,
          }));
        }
      } catch (e) {}
    }
    load();
  }, []);

  const handleSave = async (publish: boolean) => {
    try {
      setSaving(true);
      const res = await fetch('/api/customization?draft=true');
      const curData = await res.json();
      const existingTheme = curData.data?.themeSettings || {};

      const updatedTheme = {
        ...existingTheme,
        fontHeading: typography.fontHeading,
        fontBody: typography.fontBody,
      };

      await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftThemeSettings: updatedTheme,
          publishImmediately: publish,
        }),
      });

      showToast(publish ? 'Typography published live!' : 'Typography draft saved!');
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
            Typography & Font System
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure editorial title serif fonts, clean geometric body fonts, and scale hierarchy.
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

      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
              Headings Font Family
            </label>
            <select
              value={typography.fontHeading}
              onChange={(e) => setTypography({ ...typography, fontHeading: e.target.value })}
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
            >
              <option value="Cinzel, Georgia, serif">Cinzel (Roman Classical Luxury)</option>
              <option value="Playfair Display, serif">Playfair Display (Vogue Editorial)</option>
              <option value="Bodoni Moda, serif">Bodoni Moda (Modernist High-Fashion)</option>
              <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Contemporary Clean)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
              Body & Navigation Font Family
            </label>
            <select
              value={typography.fontBody}
              onChange={(e) => setTypography({ ...typography, fontBody: e.target.value })}
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
            >
              <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Optimal Readability)</option>
              <option value="Inter, sans-serif">Inter (Precision Neutral)</option>
              <option value="Lora, serif">Lora (Editorial Literary)</option>
            </select>
          </div>
        </div>

        {/* Live Font Typography Specimen */}
        <div className="p-6 border border-[#EAEAEA] rounded-sm bg-[#F8F7F4]/40 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858585]">
            Live Typographic Specimen
          </h3>
          <h2
            className="text-2xl font-bold tracking-tight text-[#111111]"
            style={{ fontFamily: typography.fontHeading }}
          >
            The Nexstep Gallery Haute Couture Archive
          </h2>
          <p
            className="text-xs text-[#252525] leading-relaxed max-w-2xl"
            style={{ fontFamily: typography.fontBody }}
          >
            Mastery of drape, precision tailoring, and certified sustainable mills. Designed for those who value quiet luxury and immaculate tactile construction.
          </p>
        </div>
      </div>
    </div>
  );
}
