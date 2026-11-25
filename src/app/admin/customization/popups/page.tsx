'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function PopupManagementPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [popups, setPopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('WELCOME');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [delaySeconds, setDelaySeconds] = useState('3');
  const [frequency, setFrequency] = useState('ONCE_PER_SESSION');
  const [targetPages, setTargetPages] = useState('ALL');
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadPopups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/popups?all=true');
      const data = await res.json();
      if (data.popups) setPopups(data.popups);
    } catch (e) {
      showToast('Failed to load popups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const openCreateModal = () => {
    setEditingPopup(null);
    setTitle('');
    setType('WELCOME');
    setHeading('Join The Privilege Circle');
    setDescription('Subscribe to receive private showroom invitations and 10% off your premier order.');
    setImageUrl('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop');
    setCtaText('Unlock 10% Privileges');
    setCtaLink('/shop');
    setDelaySeconds('3');
    setFrequency('ONCE_PER_SESSION');
    setTargetPages('ALL');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingPopup(p);
    setTitle(p.title);
    setType(p.type || 'WELCOME');
    setHeading(p.heading || '');
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setCtaText(p.ctaText || '');
    setCtaLink(p.ctaLink || '');
    setDelaySeconds(p.delaySeconds?.toString() || '3');
    setFrequency(p.frequency || 'ONCE_PER_SESSION');
    setTargetPages(p.targetPages || 'ALL');
    setIsActive(Boolean(p.isActive));
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setImageUrl(data.url);
      showToast('Image uploaded successfully');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        type,
        heading: heading.trim() || null,
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        ctaText: ctaText.trim() || null,
        ctaLink: ctaLink.trim() || null,
        delaySeconds: parseInt(delaySeconds, 10) || 3,
        frequency,
        targetPages,
        isActive,
      };

      const url = editingPopup ? `/api/popups/${editingPopup.id}` : '/api/popups';
      const method = editingPopup ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(editingPopup ? 'Popup updated!' : 'Popup created!');
      setIsModalOpen(false);
      loadPopups();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Are you sure you want to delete popup "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/popups/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Popup deleted');
      loadPopups();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Marketing Popups & Modal Privilege
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Create welcome discounts, newsletter overlays, and campaign modals with frequency cookies.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Popup</span>
        </button>
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

      {/* Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Popup Title</th>
                <th className="py-3 px-4 font-semibold uppercase">Type</th>
                <th className="py-3 px-4 font-semibold uppercase">Delay (Sec)</th>
                <th className="py-3 px-4 font-semibold uppercase">Frequency</th>
                <th className="py-3 px-4 font-semibold uppercase">Target Pages</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#858585]">
                    Loading popups...
                  </td>
                </tr>
              ) : popups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#858585]">
                    No popups created yet.
                  </td>
                </tr>
              ) : (
                popups.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111111]">{p.title}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#C6AE91] font-semibold">
                      {p.type}
                    </td>
                    <td className="py-3 px-4 font-mono">{p.delaySeconds}s</td>
                    <td className="py-3 px-4 text-[#858585]">{p.frequency}</td>
                    <td className="py-3 px-4 text-[#858585]">{p.targetPages}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-[#111111]">
              {editingPopup ? 'Edit Popup' : 'Create New Marketing Popup'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Popup Internal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10% First Order Welcome Popup"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Display Headline
                  </label>
                  <input
                    type="text"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="THE PRIVILEGE CIRCLE"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Popup Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                  >
                    <option value="WELCOME">Welcome Modal</option>
                    <option value="DISCOUNT">Discount Code Offer</option>
                    <option value="NEWSLETTER">Newsletter Signup</option>
                    <option value="CAMPAIGN">Seasonal Runway Drop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Description Narrative
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Privileges and discount terms..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Modal Visual Image
                </label>
                <div className="flex items-center gap-2">
                  {imageUrl && (
                    <div className="relative w-12 h-12 rounded-xs border overflow-hidden flex-shrink-0">
                      <Image src={imageUrl} alt="Popup" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
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
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 border border-[#111111] text-xs font-medium rounded-sm hover:bg-[#F8F7F4]"
                  >
                    Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Claim Privileges"
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/shop"
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Delay (Seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm bg-white"
                  >
                    <option value="ONCE_PER_SESSION">Once per session</option>
                    <option value="ALWAYS">Every page load</option>
                    <option value="ONCE">Once per user</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Target Pages
                  </label>
                  <select
                    value={targetPages}
                    onChange={(e) => setTargetPages(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm bg-white"
                  >
                    <option value="ALL">All Store Pages</option>
                    <option value="HOME_ONLY">Homepage Only</option>
                    <option value="SHOP_ONLY">Shop All Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded-xs text-[#111111]"
                  />
                  <span className="text-xs font-semibold text-[#111111]">
                    Popup Enabled & Active
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#EAEAEA] text-xs font-medium rounded-sm hover:bg-[#F8F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPopup ? 'Save Changes' : 'Create Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
