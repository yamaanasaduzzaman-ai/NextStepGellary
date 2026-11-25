'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function SocialMediaSettingsPage() {
  const [social, setSocial] = useState({
    instagram: 'https://instagram.com/nexstepgallery',
    facebook: 'https://facebook.com/nexstepgallery',
    pinterest: 'https://pinterest.com/nexstepgallery',
    linkedin: 'https://linkedin.com/company/nexstepgallery',
    youtube: '',
    tiktok: '',
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
        if (data.data?.footerSettings?.socialLinks) {
          setSocial((prev) => ({ ...prev, ...data.data.footerSettings.socialLinks }));
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
      const existingFooter = curData.data?.footerSettings || {};

      const updatedFooter = {
        ...existingFooter,
        socialLinks: social,
      };

      await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftFooterSettings: updatedFooter,
          publishImmediately: publish,
        }),
      });

      showToast(publish ? 'Social links published live!' : 'Social links draft saved!');
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
            Social Media Channels & Integrations
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure official brand profiles displayed across the storefront footer and community lookbook.
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

      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Instagram Profile URL', key: 'instagram', placeholder: 'https://instagram.com/...' },
            { label: 'Facebook Page URL', key: 'facebook', placeholder: 'https://facebook.com/...' },
            { label: 'Pinterest Portfolio URL', key: 'pinterest', placeholder: 'https://pinterest.com/...' },
            { label: 'LinkedIn Company URL', key: 'linkedin', placeholder: 'https://linkedin.com/company/...' },
            { label: 'YouTube Runway Channel', key: 'youtube', placeholder: 'https://youtube.com/@...' },
            { label: 'TikTok Lookbook Profile', key: 'tiktok', placeholder: 'https://tiktok.com/@...' },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                {item.label}
              </label>
              <input
                type="url"
                value={(social as any)[item.key] || ''}
                onChange={(e) => setSocial({ ...social, [item.key]: e.target.value })}
                placeholder={item.placeholder}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
