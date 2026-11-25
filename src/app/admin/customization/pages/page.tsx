'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function PageManagementPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('DEFAULT');
  const [isPublished, setIsPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/custom-pages?all=true');
      const data = await res.json();
      if (data.pages) setPages(data.pages);
    } catch (e) {
      showToast('Failed to load pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setContent('');
    setTemplate('DEFAULT');
    setIsPublished(true);
    setSeoTitle('');
    setSeoDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingPage(p);
    setTitle(p.title);
    setSlug(p.slug);
    setContent(p.content || '');
    setTemplate(p.template || 'DEFAULT');
    setIsPublished(Boolean(p.isPublished));
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPage) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        template,
        isPublished,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
      };

      const url = editingPage ? `/api/custom-pages/${editingPage.id}` : '/api/custom-pages';
      const method = editingPage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(editingPage ? 'Page updated!' : 'Page created!');
      setIsModalOpen(false);
      loadPages();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Are you sure you want to delete page "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/custom-pages/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Page deleted');
      loadPages();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Content Page Management
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Create and edit policy documents, brand history, size guides, FAQs, and custom landing pages.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
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

      {/* Pages Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-4 font-semibold uppercase">Page Title</th>
                <th className="py-3 px-4 font-semibold uppercase">URL Slug</th>
                <th className="py-3 px-4 font-semibold uppercase">Template</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase">Last Updated</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#858585]">
                    Loading pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#858585]">
                    No custom pages found.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F7F4]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111111]">{p.title}</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">/{p.slug}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#C6AE91]">
                      {p.template}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                          p.isPublished
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#858585]">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/${p.slug}`}
                          target="_blank"
                          className="p-1 text-neutral-400 hover:text-[#111111]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
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
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-[#111111]">
              {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Page'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Size Guide & Measurement Atelier"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="size-guide"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                    Layout Template
                  </label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm bg-white"
                  >
                    <option value="DEFAULT">Default Editorial Document</option>
                    <option value="POLICY">Legal / Policy Template</option>
                    <option value="FAQ">Interactive Accordion FAQ</option>
                    <option value="ABOUT">Brand Atelier Story</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Page Content (Markdown / HTML)
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter full document text or structured markdown content..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded-xs text-[#111111]"
                  />
                  <span className="text-xs font-semibold text-[#111111]">
                    Published & Live on Website
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
                  {submitting ? 'Saving...' : editingPage ? 'Save Changes' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
