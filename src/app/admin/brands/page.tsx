'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Tag,
} from 'lucide-react';

export default function AdminBrandsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/brands?all=true');
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch (e) {
      showToast('Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setDescription('');
    setLogoUrl('');
    setWebsite('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setDescription(b.description || '');
    setLogoUrl(b.logoUrl || '');
    setWebsite(b.website || '');
    setIsActive(Boolean(b.isActive));
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingBrand) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setLogoUrl(data.url);
      showToast('Logo uploaded successfully');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        logoUrl: logoUrl.trim() || null,
        website: website.trim() || null,
        isActive,
      };

      const url = editingBrand ? `/api/brands/${editingBrand.id}` : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(editingBrand ? 'Brand updated!' : 'Brand created!');
      setIsModalOpen(false);
      loadBrands();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (b: any) => {
    if (!confirm(`Are you sure you want to delete brand "${b.name}"? Products will be preserved.`)) return;

    try {
      const res = await fetch(`/api/brands/${b.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Brand deleted');
      loadBrands();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Brand & Atelier Partners
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Manage luxury labels, in-house atelier brands, partner logos, and official websites.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
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
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Brand / Logo</th>
                <th className="py-3 px-4 font-semibold uppercase">Slug</th>
                <th className="py-3 px-4 font-semibold uppercase">Website</th>
                <th className="py-3 px-4 font-semibold uppercase">Products</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#858585]">
                    Loading brands...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#858585]">
                    No brands created yet.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <div className="relative w-10 h-10 bg-neutral-100 rounded-full overflow-hidden flex-shrink-0 border border-[#EAEAEA]">
                        {b.logoUrl ? (
                          <Image src={b.logoUrl} alt={b.name} fill className="object-cover" />
                        ) : (
                          <Tag className="w-4 h-4 text-neutral-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div>
                        <strong className="text-[#111111] font-semibold block">{b.name}</strong>
                        {b.description && (
                          <span className="text-[10px] text-[#858585] line-clamp-1">
                            {b.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-600">{b.slug}</td>

                    <td className="py-3 px-4 text-[#858585]">
                      {b.website ? (
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#111111] hover:text-[#C6AE91] inline-flex items-center gap-1"
                        >
                          <span>{b.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {b._count?.products || 0} products
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(b)}
                          className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b)}
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
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#111111]">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Nexstep Atelier"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Brand Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nexstep-atelier"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Brand Bio / Philosophy
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bespoke tailoring, sustainable organic textiles..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Brand Logo
                </label>
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <div className="relative w-10 h-10 bg-neutral-100 rounded-full overflow-hidden flex-shrink-0 border">
                      <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
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
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 border border-[#111111] text-xs font-medium rounded-sm hover:bg-[#F8F7F4] flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
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
                    Active Status
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
                  {submitting ? 'Saving...' : editingBrand ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
