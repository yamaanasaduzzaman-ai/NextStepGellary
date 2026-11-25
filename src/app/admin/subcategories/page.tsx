'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  CheckCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rootCategories = categories.filter((c) => !c.parentId);
  const subcategories = categories.filter((c) => {
    if (!c.parentId) return false;
    if (selectedParentId !== 'ALL' && c.parentId !== selectedParentId) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setName('');
    setSlug('');
    setParentId(rootCategories[0]?.id || '');
    setDisplayOrder('1');
    setIsModalOpen(true);
  };

  const openEditModal = (sc: any) => {
    setEditingSubcategory(sc);
    setName(sc.name);
    setSlug(sc.slug);
    setParentId(sc.parentId || '');
    setDisplayOrder(sc.displayOrder?.toString() || '1');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSubcategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parentId) {
      showToast('Name and Parent Category are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        parentId,
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive: true,
      };

      const url = editingSubcategory ? `/api/categories/${editingSubcategory.id}` : '/api/categories';
      const method = editingSubcategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(editingSubcategory ? 'Subcategory updated!' : 'Subcategory created!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sc: any) => {
    if (!confirm(`Are you sure you want to delete subcategory "${sc.name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${sc.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Subcategory deleted');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="p-2 border border-[#EAEAEA] rounded-sm hover:bg-[#F8F7F4] text-[#858585] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-light text-[#111111]">
              Subcategories Directory
            </h1>
            <p className="text-xs text-[#858585] mt-0.5">
              Refined product grouping nested under main parent departments (Men, Women, Accessories).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subcategory</span>
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

      {/* Filter by parent */}
      <div className="bg-white p-4 rounded-sm border border-[#EAEAEA] flex items-center justify-between text-xs">
        <span className="text-[#858585]">Filter by Parent Department:</span>
        <select
          value={selectedParentId}
          onChange={(e) => setSelectedParentId(e.target.value)}
          className="py-1.5 px-3 border border-[#EAEAEA] rounded-sm bg-white font-medium"
        >
          <option value="ALL">All Parent Departments</option>
          {rootCategories.map((rc) => (
            <option key={rc.id} value={rc.id}>
              {rc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Subcategory Name</th>
                <th className="py-3 px-4 font-semibold uppercase">Parent Department</th>
                <th className="py-3 px-4 font-semibold uppercase">Slug</th>
                <th className="py-3 px-4 font-semibold uppercase">Assigned Products</th>
                <th className="py-3 px-4 font-semibold uppercase">Order</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {subcategories.length > 0 ? (
                subcategories.map((sc) => (
                  <tr key={sc.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#111111]">{sc.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded-xs text-[10px] text-neutral-800 font-bold uppercase">
                        {sc.parent?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">/category/{sc.slug}</td>
                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {sc._count?.products || 0} products
                    </td>
                    <td className="py-3 px-4 font-mono">{sc.displayOrder}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(sc)}
                          className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sc)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#858585]">
                    No subcategories found.
                  </td>
                </tr>
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
              {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Shirts & Polos"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Parent Department *
                </label>
                <select
                  required
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
                >
                  <option value="">Select Parent Department</option>
                  {rootCategories.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="shirts-polos"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
                />
              </div>

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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAEAEA]">
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
                  {submitting ? 'Saving...' : editingSubcategory ? 'Save Changes' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
