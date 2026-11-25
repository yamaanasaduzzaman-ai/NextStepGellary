'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Sliders,
  ExternalLink,
  Save,
} from 'lucide-react';

export default function HeaderCustomizationPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [headerSettings, setHeaderSettings] = useState<any>({
    brandName: 'NEXSTEP GALLERY',
    logoUrl: '',
    announcementBar: {
      enabled: true,
      text: 'COMPLIMENTARY EXPRESS NATIONWIDE SHIPPING ON ALL ORDERS OVER ৳3,000',
      link: '/shop',
      bgColor: '#111111',
      textColor: '#FFFFFF',
    },
    sticky: true,
    showSearch: true,
    showWishlist: true,
    showCart: true,
    height: '80px',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
        if (data.data?.headerSettings) {
          setHeaderSettings((prev: any) => ({ ...prev, ...data.data.headerSettings }));
        }
      } catch (e) {
        showToast('Failed to load header settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setHeaderSettings((prev: any) => ({ ...prev, logoUrl: data.url }));
      showToast('Logo image uploaded successfully');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (publishImmediately: boolean) => {
    try {
      if (publishImmediately) setPublishing(true);
      else setSaving(true);

      const res = await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftHeaderSettings: headerSettings,
          publishImmediately,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(
        publishImmediately
          ? 'Header settings published live!'
          : 'Header draft saved successfully!'
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Header & Navigation Bar Customization
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure brand insignia, announcement ticker, sticky navigation behavior, and icon toggles.
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

      {/* 1. Brand Logo & Name */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Brand Logo & Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Logo Text / Brand Heading
            </label>
            <input
              type="text"
              value={headerSettings.brandName || ''}
              onChange={(e) =>
                setHeaderSettings({ ...headerSettings, brandName: e.target.value })
              }
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Logo Image (Optional)
            </label>
            <div className="flex items-center gap-2">
              {headerSettings.logoUrl && (
                <div className="relative w-10 h-8 border rounded-xs overflow-hidden flex-shrink-0">
                  <Image src={headerSettings.logoUrl} alt="Logo" fill className="object-contain" />
                </div>
              )}
              <input
                type="text"
                value={headerSettings.logoUrl || ''}
                onChange={(e) =>
                  setHeaderSettings({ ...headerSettings, logoUrl: e.target.value })
                }
                placeholder="https://... or upload"
                className="flex-1 text-xs p-2 border border-[#EAEAEA] rounded-sm"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 border border-[#111111] text-xs font-medium rounded-sm hover:bg-[#F8F7F4]"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Announcement Bar */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
            Top Promotional Announcement Bar
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(headerSettings.announcementBar?.enabled)}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  announcementBar: {
                    ...headerSettings.announcementBar,
                    enabled: e.target.checked,
                  },
                })
              }
              className="rounded-xs text-[#111111]"
            />
            <span className="text-xs font-semibold text-[#111111]">Enable Bar</span>
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Promotional Announcement Message
            </label>
            <input
              type="text"
              value={headerSettings.announcementBar?.text || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  announcementBar: {
                    ...headerSettings.announcementBar,
                    text: e.target.value,
                  },
                })
              }
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Announcement Link
              </label>
              <input
                type="text"
                value={headerSettings.announcementBar?.link || ''}
                onChange={(e) =>
                  setHeaderSettings({
                    ...headerSettings,
                    announcementBar: {
                      ...headerSettings.announcementBar,
                      link: e.target.value,
                    },
                  })
                }
                placeholder="/shop"
                className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={headerSettings.announcementBar?.bgColor || '#111111'}
                  onChange={(e) =>
                    setHeaderSettings({
                      ...headerSettings,
                      announcementBar: {
                        ...headerSettings.announcementBar,
                        bgColor: e.target.value,
                      },
                    })
                  }
                  className="w-8 h-8 rounded-xs cursor-pointer border"
                />
                <span className="font-mono text-xs">{headerSettings.announcementBar?.bgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={headerSettings.announcementBar?.textColor || '#FFFFFF'}
                  onChange={(e) =>
                    setHeaderSettings({
                      ...headerSettings,
                      announcementBar: {
                        ...headerSettings.announcementBar,
                        textColor: e.target.value,
                      },
                    })
                  }
                  className="w-8 h-8 rounded-xs cursor-pointer border"
                />
                <span className="font-mono text-xs">{headerSettings.announcementBar?.textColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar Behavior & Icons */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Navbar Height & Action Icons
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Header Height
            </label>
            <input
              type="text"
              value={headerSettings.height || '80px'}
              onChange={(e) =>
                setHeaderSettings({ ...headerSettings, height: e.target.value })
              }
              placeholder="80px"
              className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(headerSettings.sticky)}
                onChange={(e) =>
                  setHeaderSettings({ ...headerSettings, sticky: e.target.checked })
                }
                className="rounded-xs text-[#111111]"
              />
              <span className="text-xs font-semibold text-[#111111]">
                Sticky Navigation (Remains fixed at top on scroll)
              </span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-[#EAEAEA] flex flex-wrap items-center gap-6 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(headerSettings.showSearch)}
              onChange={(e) =>
                setHeaderSettings({ ...headerSettings, showSearch: e.target.checked })
              }
              className="rounded-xs text-[#111111]"
            />
            <span className="font-medium text-[#111111]">Show Search Icon</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(headerSettings.showWishlist)}
              onChange={(e) =>
                setHeaderSettings({ ...headerSettings, showWishlist: e.target.checked })
              }
              className="rounded-xs text-[#111111]"
            />
            <span className="font-medium text-[#111111]">Show Wishlist Icon</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(headerSettings.showCart)}
              onChange={(e) =>
                setHeaderSettings({ ...headerSettings, showCart: e.target.checked })
              }
              className="rounded-xs text-[#111111]"
            />
            <span className="font-medium text-[#111111]">Show Cart Icon</span>
          </label>
        </div>
      </div>
    </div>
  );
}
