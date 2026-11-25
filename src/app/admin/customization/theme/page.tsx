'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';

const DEFAULT_THEME = {
  primaryColor: '#111111',
  secondaryColor: '#F8F7F4',
  accentColor: '#C6AE91',
  textColor: '#252525',
  mutedColor: '#858585',
  borderColor: '#EAEAEA',
  backgroundColor: '#FFFFFF',
  fontHeading: 'Cinzel, Georgia, serif',
  fontBody: 'Plus Jakarta Sans, sans-serif',
  borderRadius: '2px',
  containerWidth: '1280px',
};

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadTheme = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customization?draft=true');
      const data = await res.json();
      if (data.data?.themeSettings) {
        setTheme({ ...DEFAULT_THEME, ...data.data.themeSettings });
      }
    } catch (e) {
      showToast('Failed to load theme settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const handleChange = (field: string, val: string) => {
    setTheme((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftThemeSettings: theme, publishImmediately: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      showToast('Theme draft saved! Edits will not appear on live site until published.');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishLive = async () => {
    try {
      setPublishing(true);
      const res = await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftThemeSettings: theme, publishImmediately: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      showToast('Theme published live to all storefront visitors!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset theme back to default Nexstep Luxury styling?')) {
      setTheme(DEFAULT_THEME);
      showToast('Theme reset to luxury default.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Global Theme Settings
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure luxury color palettes, typography, corner radii, and maximum layout bounds.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 border border-[#EAEAEA] bg-white text-xs font-medium rounded-sm hover:bg-[#F8F7F4] text-[#111111] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={publishing}
            onClick={handlePublishLive}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {publishing ? (
              <span>Publishing...</span>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publish to Live Storefront</span>
              </>
            )}
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

      {/* Grid: Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Colors Card */}
          <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C6AE91]" />
              <span>Color Palette Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Primary Brand Color (Buttons & Headers)', field: 'primaryColor', desc: 'Default #111111' },
                { label: 'Secondary / Off-White Accent', field: 'secondaryColor', desc: 'Default #F8F7F4' },
                { label: 'Warm Beige / Gold Luxury Accent', field: 'accentColor', desc: 'Default #C6AE91' },
                { label: 'Primary Text Color', field: 'textColor', desc: 'Default #252525' },
                { label: 'Muted Secondary Text', field: 'mutedColor', desc: 'Default #858585' },
                { label: 'Subtle Border Color', field: 'borderColor', desc: 'Default #EAEAEA' },
                { label: 'Page Background Canvas', field: 'backgroundColor', desc: 'Default #FFFFFF' },
              ].map((c) => (
                <div key={c.field} className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#111111]">
                    {c.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(theme as any)[c.field]}
                      onChange={(e) => handleChange(c.field, e.target.value)}
                      className="w-8 h-8 rounded-xs cursor-pointer border border-[#EAEAEA]"
                    />
                    <input
                      type="text"
                      value={(theme as any)[c.field]}
                      onChange={(e) => handleChange(c.field, e.target.value)}
                      className="flex-1 text-xs p-1.5 border border-[#EAEAEA] rounded-xs font-mono uppercase"
                    />
                  </div>
                  <span className="text-[10px] text-[#858585]">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Typography & Dimensional Layout
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                  Heading Font Family
                </label>
                <select
                  value={theme.fontHeading}
                  onChange={(e) => handleChange('fontHeading', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                >
                  <option value="Cinzel, Georgia, serif">Cinzel (Luxury Roman Classical)</option>
                  <option value="Playfair Display, serif">Playfair Display (Editorial High-Fashion)</option>
                  <option value="Bodoni Moda, serif">Bodoni Moda (Haute Couture Vogue)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Minimal Contemporary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                  Body Font Family
                </label>
                <select
                  value={theme.fontBody}
                  onChange={(e) => handleChange('fontBody', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                >
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Crisp Modern)</option>
                  <option value="Inter, sans-serif">Inter (Clean Neutral)</option>
                  <option value="Lora, serif">Lora (Refined Literary Serif)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                  Corner Border Radius
                </label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => handleChange('borderRadius', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                >
                  <option value="0px">0px (Strict Razor Luxury Sharp)</option>
                  <option value="2px">2px (Subtle Refined Precision)</option>
                  <option value="4px">4px (Modern Standard Soft)</option>
                  <option value="8px">8px (Curved Contemporary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                  Container Maximum Width
                </label>
                <select
                  value={theme.containerWidth}
                  onChange={(e) => handleChange('containerWidth', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                >
                  <option value="1200px">1200px (Compact)</option>
                  <option value="1280px">1280px (Standard Editorial Luxury)</option>
                  <option value="1440px">1440px (Wide Widescreen)</option>
                  <option value="1600px">1600px (Ultra-Wide Cinematic)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-4">
          <div className="bg-white border border-[#EAEAEA] rounded-sm p-5 shadow-xs sticky top-24">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858585] mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#C6AE91]" />
              <span>Real-Time Style Preview</span>
            </h3>

            {/* Simulated Storefront Card */}
            <div
              className="p-5 border transition-all space-y-4"
              style={{
                backgroundColor: theme.backgroundColor,
                borderColor: theme.borderColor,
                borderRadius: theme.borderRadius,
                color: theme.textColor,
                fontFamily: theme.fontBody,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: theme.accentColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  Haute Couture
                </span>
                <span className="text-[11px]" style={{ color: theme.mutedColor }}>
                  ৳18,500
                </span>
              </div>

              <div>
                <h4
                  className="text-base font-bold tracking-wide"
                  style={{ fontFamily: theme.fontHeading, color: theme.primaryColor }}
                >
                  Minimalist Wool Overcoat
                </h4>
                <p className="text-xs mt-1" style={{ color: theme.mutedColor }}>
                  Hand-stitched in pure Italian merino wool with understated architectural drape.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.secondaryColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  Add To Shopping Bag
                </button>
              </div>
            </div>

            <p className="text-[10px] text-[#858585] mt-3 text-center">
              Changes update immediately in preview. Click &quot;Publish to Live Storefront&quot; to apply to public visitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
