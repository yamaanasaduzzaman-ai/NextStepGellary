'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

export default function AnnouncementBarPage() {
  const [announcements, setAnnouncements] = useState<Array<{ text: string; link: string; enabled: boolean }>>([
    {
      text: 'COMPLIMENTARY EXPRESS NATIONWIDE SHIPPING ON ALL ORDERS OVER ৳3,000',
      link: '/shop',
      enabled: true,
    },
    {
      text: 'DISCOVER THE SPRING / SUMMER 2026 RUNWAY CAPSULE DROP',
      link: '/collections',
      enabled: false,
    },
  ]);

  const [bgColor, setBgColor] = useState('#111111');
  const [textColor, setTextColor] = useState('#FFFFFF');
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
        if (data.data?.headerSettings?.announcementBar) {
          const ab = data.data.headerSettings.announcementBar;
          if (ab.text) {
            setAnnouncements([{ text: ab.text, link: ab.link || '/shop', enabled: ab.enabled !== false }]);
          }
          if (ab.bgColor) setBgColor(ab.bgColor);
          if (ab.textColor) setTextColor(ab.textColor);
        }
      } catch (e) {}
    }
    load();
  }, []);

  const handleAdd = () => {
    setAnnouncements([...announcements, { text: 'New Promotional Offer', link: '/shop', enabled: true }]);
  };

  const handleRemove = (idx: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== idx));
  };

  const handleSave = async (publish: boolean) => {
    try {
      setSaving(true);
      const res = await fetch('/api/customization?draft=true');
      const curData = await res.json();
      const existingHeader = curData.data?.headerSettings || {};

      const primaryAnnouncement = announcements.find((a) => a.enabled) || announcements[0];

      const updatedHeader = {
        ...existingHeader,
        announcementBar: {
          enabled: Boolean(primaryAnnouncement?.enabled),
          text: primaryAnnouncement?.text || '',
          link: primaryAnnouncement?.link || '/shop',
          bgColor,
          textColor,
        },
      };

      await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftHeaderSettings: updatedHeader,
          publishImmediately: publish,
        }),
      });

      showToast(publish ? 'Announcement bar published live!' : 'Announcement draft saved!');
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
            Announcement Bar Manager
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure top notification tickers, seasonal delivery notices, and custom highlight colors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 border border-[#111111] text-[#111111] text-xs font-semibold rounded-sm hover:bg-[#F8F7F4] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Announcement</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Publish Live</span>
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

      {/* Styling Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-5 space-y-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Bar Color Scheme
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#111111] mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-xs cursor-pointer border"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="p-1.5 border border-[#EAEAEA] rounded-xs text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#111111] mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded-xs cursor-pointer border"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="p-1.5 border border-[#EAEAEA] rounded-xs text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Stack */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-5 space-y-3 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          Announcement Messages Stack
        </h2>

        {announcements.map((a, idx) => (
          <div
            key={idx}
            className="p-3 border border-[#EAEAEA] rounded-xs bg-[#F8F7F4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 flex-1">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={a.enabled}
                  onChange={(e) => {
                    const updated = [...announcements];
                    updated[idx].enabled = e.target.checked;
                    setAnnouncements(updated);
                  }}
                  className="rounded-xs"
                />
                <span className="text-[10px] uppercase font-bold text-neutral-500">Active</span>
              </label>

              <input
                type="text"
                value={a.text}
                onChange={(e) => {
                  const updated = [...announcements];
                  updated[idx].text = e.target.value;
                  setAnnouncements(updated);
                }}
                placeholder="Announcement headline"
                className="flex-1 p-1.5 border border-[#EAEAEA] rounded-xs bg-white font-medium"
              />

              <input
                type="text"
                value={a.link}
                onChange={(e) => {
                  const updated = [...announcements];
                  updated[idx].link = e.target.value;
                  setAnnouncements(updated);
                }}
                placeholder="/shop"
                className="w-32 p-1.5 border border-[#EAEAEA] rounded-xs bg-white font-mono text-[11px]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="p-1 text-neutral-400 hover:text-red-600 self-end sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
