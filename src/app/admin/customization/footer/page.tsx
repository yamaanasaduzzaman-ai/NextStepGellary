'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Sliders,
  Save,
} from 'lucide-react';

export default function FooterCustomizationPage() {
  const [footerSettings, setFooterSettings] = useState<any>({
    brandName: 'NEXSTEP GALLERY',
    brandTagline: 'Curating modern luxury and timeless architectural silhouettes for the discerning wardrobe.',
    copyright: '© 2026 NEXSTEP GALLERY. All Rights Reserved. Handcrafted in Dhaka, Bangladesh.',
    newsletterTitle: 'THE FASHION JOURNAL & PRIVATE ACCESS',
    newsletterDescription: 'Join our inner circle for seasonal lookbooks, exclusive drops, and private salon invitations.',
    showPaymentIcons: true,
    socialLinks: {
      instagram: 'https://instagram.com/nexstepgallery',
      facebook: 'https://facebook.com/nexstepgallery',
      pinterest: 'https://pinterest.com/nexstepgallery',
      linkedin: 'https://linkedin.com/company/nexstepgallery',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/customization?draft=true');
        const data = await res.json();
        if (data.data?.footerSettings) {
          setFooterSettings((prev: any) => ({ ...prev, ...data.data.footerSettings }));
        }
      } catch (e) {
        showToast('Failed to load footer settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (publishImmediately: boolean) => {
    try {
      if (publishImmediately) setPublishing(true);
      else setSaving(true);

      const res = await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftFooterSettings: footerSettings,
          publishImmediately,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(
        publishImmediately
          ? 'Footer settings published live!'
          : 'Footer draft saved successfully!'
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Footer Customization
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure atelier branding narrative, newsletter capture, copyright notices, and payment badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={publishing}
            onClick={() => handleSave(true)}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {publishing ? (
              <span>Publishing...</span>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publish to Live</span>
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

      {/* Brand Bio */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Atelier Brand Biography
        </h2>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1">
            Footer Brand Tagline
          </label>
          <textarea
            rows={3}
            value={footerSettings.brandTagline || ''}
            onChange={(e) =>
              setFooterSettings({ ...footerSettings, brandTagline: e.target.value })
            }
            className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1">
            Copyright Notice
          </label>
          <input
            type="text"
            value={footerSettings.copyright || ''}
            onChange={(e) =>
              setFooterSettings({ ...footerSettings, copyright: e.target.value })
            }
            className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Footer Newsletter Club
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Newsletter Heading
            </label>
            <input
              type="text"
              value={footerSettings.newsletterTitle || ''}
              onChange={(e) =>
                setFooterSettings({ ...footerSettings, newsletterTitle: e.target.value })
              }
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Newsletter Description
            </label>
            <input
              type="text"
              value={footerSettings.newsletterDescription || ''}
              onChange={(e) =>
                setFooterSettings({ ...footerSettings, newsletterDescription: e.target.value })
              }
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(footerSettings.showPaymentIcons)}
              onChange={(e) =>
                setFooterSettings({ ...footerSettings, showPaymentIcons: e.target.checked })
              }
              className="rounded-xs text-[#111111]"
            />
            <span className="text-xs font-semibold text-[#111111]">
              Display Payment Trust Badges (bKash, Nagad, SSLCommerz, Visa, Mastercard, COD)
            </span>
          </label>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Social Channels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={footerSettings.socialLinks?.instagram || ''}
              onChange={(e) =>
                setFooterSettings({
                  ...footerSettings,
                  socialLinks: { ...footerSettings.socialLinks, instagram: e.target.value },
                })
              }
              className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={footerSettings.socialLinks?.facebook || ''}
              onChange={(e) =>
                setFooterSettings({
                  ...footerSettings,
                  socialLinks: { ...footerSettings.socialLinks, facebook: e.target.value },
                })
              }
              className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Pinterest URL
            </label>
            <input
              type="url"
              value={footerSettings.socialLinks?.pinterest || ''}
              onChange={(e) =>
                setFooterSettings({
                  ...footerSettings,
                  socialLinks: { ...footerSettings.socialLinks, pinterest: e.target.value },
                })
              }
              className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={footerSettings.socialLinks?.linkedin || ''}
              onChange={(e) =>
                setFooterSettings({
                  ...footerSettings,
                  socialLinks: { ...footerSettings.socialLinks, linkedin: e.target.value },
                })
              }
              className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
