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
  Calendar,
  Layers,
} from 'lucide-react';

export default function AdminCollectionsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/collections?all=true');
      const data = await res.json();
      if (data.collections) setCollections(data.collections);
    } catch (e) {
      showToast('Failed to load collections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName('');
    setSlug('');
    setDescription('');
    setBannerImage('');
    setIsFeatured(false);
    setIsActive(true);
    setDisplayOrder((collections.length + 1).toString());
    setStartDate('');
    setEndDate('');
    setSeoTitle('');
    setSeoDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (col: any) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setBannerImage(col.bannerImage || '');
    setIsFeatured(Boolean(col.isFeatured));
    setIsActive(Boolean(col.isActive));
    setDisplayOrder(col.displayOrder?.toString() || '0');
    setStartDate(col.startDate ? new Date(col.startDate).toISOString().slice(0, 10) : '');
    setEndDate(col.endDate ? new Date(col.endDate).toISOString().slice(0, 10) : '');
    setSeoTitle(col.seoTitle || '');
    setSeoDescription(col.seoDescription || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCollection) {
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
      setBannerImage(data.url);
      showToast('Banner uploaded successfully');
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
        bannerImage: bannerImage.trim() || null,
        isFeatured,
        isActive,
        displayOrder: parseInt(displayOrder, 10) || 0,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate) : null,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
      };

      const url = editingCollection ? `/api/collections/${editingCollection.id}` : '/api/collections';
      const method = editingCollection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(editingCollection ? 'Collection updated!' : 'Collection created!');
      setIsModalOpen(false);
      loadCollections();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (col: any) => {
    if (!confirm(`Are you sure you want to delete collection "${col.name}"? Products will be preserved.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/collections/${col.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Collection deleted');
      loadCollections();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Curated Collections Management
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Seasonal runway archives, limited capsule drops, editorial banners, and scheduling.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Collection</span>
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
                <th className="py-3 px-4 font-semibold uppercase">Collection Banner & Name</th>
                <th className="py-3 px-4 font-semibold uppercase">Slug</th>
                <th className="py-3 px-4 font-semibold uppercase">Products</th>
                <th className="py-3 px-4 font-semibold uppercase">Featured</th>
                <th className="py-3 px-4 font-semibold uppercase">Schedule Dates</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#858585]">
                    Loading collections...
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#858585]">
                    No collections found. Click &quot;Add New Collection&quot; to create one.
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr key={col.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <div className="relative w-14 h-9 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border border-[#EAEAEA]">
                        {col.bannerImage ? (
                          <Image src={col.bannerImage} alt={col.name} fill className="object-cover" />
                        ) : (
                          <Layers className="w-4 h-4 text-neutral-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div>
                        <strong className="text-[#111111] font-semibold block">{col.name}</strong>
                        {col.description && (
                          <span className="text-[10px] text-[#858585] line-clamp-1">
                            {col.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-600">/collection/{col.slug}</td>

                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {col._count?.products || 0} products
                    </td>

                    <td className="py-3 px-4">
                      {col.isFeatured ? (
                        <span className="px-2 py-0.5 bg-[#111111] text-white rounded-xs text-[10px] font-bold uppercase tracking-wider">
                          Featured Home
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#858585] text-[11px]">
                      {col.startDate || col.endDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#C6AE91]" />
                          <span>
                            {col.startDate ? new Date(col.startDate).toLocaleDateString() : 'Now'} -{' '}
                            {col.endDate ? new Date(col.endDate).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>
                      ) : (
                        <span>Always Active</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                          col.isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {col.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/collections?slug=${col.slug}`}
                          target="_blank"
                          className="p-1 text-neutral-400 hover:text-[#111111]"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(col)}
                          className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(col)}
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
            <h2 className="text-lg font-semibold text-[#111111]">
              {editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Add New Collection'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Spring Runway 2026"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="spring-runway-2026"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Capsule narrative and styling direction..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Collection Banner Image
                </label>
                <div className="flex items-center gap-3">
                  {bannerImage && (
                    <div className="relative w-16 h-10 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border">
                      <Image src={bannerImage} alt="Banner" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
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

              {/* Scheduling Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm bg-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded-xs text-[#111111]"
                  />
                  <span className="text-xs font-semibold text-[#111111]">
                    Featured on Homepage
                  </span>
                </label>

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
                  {submitting ? 'Saving...' : editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
