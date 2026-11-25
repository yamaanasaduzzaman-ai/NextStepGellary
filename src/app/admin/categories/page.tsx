'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e: any) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setParentId('');
    setDisplayOrder((categories.length + 1).toString());
    setIsActive(true);
    setSeoTitle('');
    setSeoDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setParentId(cat.parentId || '');
    setDisplayOrder(cat.displayOrder?.toString() || '0');
    setIsActive(Boolean(cat.isActive));
    setSeoTitle(cat.seoTitle || '');
    setSeoDescription(cat.seoDescription || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
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
    if (!name) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        parentId: parentId || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');

      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: any) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"? Products will be preserved.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Category deleted successfully');
      loadCategories();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Categories Architecture
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Organize main categories, subcategories, banners, display priorities, and SEO titles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/subcategories"
            className="px-3 py-2 border border-[#EAEAEA] bg-white text-xs font-medium rounded-sm hover:bg-[#F8F7F4] text-[#111111] transition-colors"
          >
            Manage Subcategories
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Categories Table */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAEAEA] bg-[#F8F7F4] flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
            Categories Hierarchy ({categories.length} Total)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-[#858585] bg-[#F8F7F4]/50">
                <th className="py-3 px-4 font-semibold uppercase">Category / Image</th>
                <th className="py-3 px-4 font-semibold uppercase">Slug</th>
                <th className="py-3 px-4 font-semibold uppercase">Parent</th>
                <th className="py-3 px-4 font-semibold uppercase">Subcategories</th>
                <th className="py-3 px-4 font-semibold uppercase">Products</th>
                <th className="py-3 px-4 font-semibold uppercase">Order</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#858585]">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#858585]">
                    No categories created yet. Click &quot;Add New Category&quot; to get started.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <div className="relative w-9 h-11 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border border-[#EAEAEA]">
                        {c.imageUrl ? (
                          <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                        ) : (
                          <FolderTree className="w-4 h-4 text-neutral-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div>
                        <strong className="text-[#111111] font-semibold block">{c.name}</strong>
                        {c.description && (
                          <span className="text-[10px] text-[#858585] line-clamp-1">
                            {c.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-600">/category/{c.slug}</td>

                    <td className="py-3 px-4 text-[#858585]">
                      {c.parent ? (
                        <span className="px-2 py-0.5 bg-neutral-100 rounded-xs text-[10px] text-neutral-700 font-medium">
                          {c.parent.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                          Root
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {c.subcategories && c.subcategories.length > 0 ? (
                        <span className="font-semibold text-neutral-800">
                          {c.subcategories.length} subcategories
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {c._count?.products || 0} products
                    </td>

                    <td className="py-3 px-4 font-mono">{c.displayOrder}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/category/${c.slug}`}
                          target="_blank"
                          className="p-1 text-neutral-400 hover:text-[#111111]"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                          title="Delete Category"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#111111]">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Outerwear & Coats"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Slug (URL Path)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="outerwear-coats"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Parent Category (Leave empty for root)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {rootCategories
                    .filter((c) => editingCategory ? c.id !== editingCategory.id : true)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for category banner and navigation..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Category Banner Image
                </label>
                <div className="flex items-center gap-3">
                  {imageUrl && (
                    <div className="relative w-12 h-14 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border">
                      <Image src={imageUrl} alt="Category preview" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload below"
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
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded-xs text-[#111111]"
                    />
                    <span className="text-xs font-semibold text-[#111111]">
                      Active on Storefront
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAEAEA] space-y-3">
                <h4 className="text-xs font-semibold text-[#858585] uppercase">
                  SEO Metadata (Optional)
                </h4>
                <div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO Page Title"
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="SEO Meta Description"
                    className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm"
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
