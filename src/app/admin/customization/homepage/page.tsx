'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  ExternalLink,
  Layers,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  props: Record<string, any>;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero_slider: '1. Editorial Runway Hero Slider',
  brand_marquee: '2. Luxury Brand & Press Marquee',
  category_grid: '3. Curated Category Disciplines Grid',
  new_arrivals: '4. New Arrivals Showcase Carousel',
  split_banner: '5. Dual Editorial Split Banner',
  featured_products: '6. Iconic Silhouettes Featured Grid',
  best_sellers: '7. Most Coveted Wardrobe Best Sellers',
  curated_collections: '8. Curated Seasonal Archives Capsule',
  lookbook_gallery: '9. Shoppable Editorial Runway Lookbook',
  promotional_banner: '10. Full-Width Architectural Promo Strip',
  brand_story: '11. Brand Philosophy & Atelier Craft',
  fabric_craft: '12. Textile Science & Sustainable Mills',
  trending_now: '13. Trending Outfits & Pairings',
  customer_reviews: '14. Client Voices & Press Endorsements',
  value_props: '15. Brand Value Propositions',
  blog_journal: '16. The Fashion Journal Columns',
  instagram_feed: '17. Community Look Gallery (#Nexstep)',
  newsletter_signup: '18. VIP Private Salon Newsletter',
};

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPropsJson, setEditPropsJson] = useState('');

  // Add Section State
  const [selectedAddType, setSelectedAddType] = useState('hero_slider');

  // Preview Frame Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customization?draft=true');
      const data = await res.json();
      if (data.data?.homepageSections) {
        setSections(data.data.homepageSections);
      }
    } catch (e) {
      showToast('Failed to load homepage sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Reorder Sections
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const list = [...sections];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const reindexed = list.map((sec, i) => ({ ...sec, order: i + 1 }));
    setSections(reindexed);
  };

  // Toggle Visibility
  const handleToggle = (index: number) => {
    setSections(
      sections.map((sec, i) =>
        i === index ? { ...sec, enabled: !sec.enabled } : sec
      )
    );
  };

  // Remove Section
  const handleRemove = (index: number) => {
    if (confirm(`Remove section "${sections[index].title}" from homepage?`)) {
      const filtered = sections.filter((_, i) => i !== index);
      setSections(filtered.map((s, i) => ({ ...s, order: i + 1 })));
    }
  };

  // Add New Section
  const handleAddSection = () => {
    const newSec: HomepageSection = {
      id: `sec-${Date.now()}`,
      type: selectedAddType,
      title: SECTION_TYPE_LABELS[selectedAddType] || selectedAddType,
      enabled: true,
      order: sections.length + 1,
      props: {
        title: 'New Section Title',
        subtitle: 'Curated editorial fashion content.',
      },
    };
    setSections([...sections, newSec]);
    showToast(`Added new section: ${newSec.title}`);
  };

  // Open Edit Modal
  const openEdit = (sec: HomepageSection) => {
    setEditingSection(sec);
    setEditTitle(sec.title);
    setEditPropsJson(JSON.stringify(sec.props || {}, null, 2));
  };

  // Save Section Props
  const handleSaveProps = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      const parsedProps = JSON.parse(editPropsJson);
      setSections(
        sections.map((s) =>
          s.id === editingSection.id
            ? { ...s, title: editTitle, props: parsedProps }
            : s
        )
      );
      setEditingSection(null);
      showToast('Section configurations updated in draft!');
    } catch (err: any) {
      alert('Invalid JSON in Props editor: ' + err.message);
    }
  };

  // Save Draft to DB
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftHomepageSections: sections,
          publishImmediately: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      showToast('Homepage draft layout saved successfully!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Publish Live
  const handlePublishLive = async () => {
    try {
      setPublishing(true);
      const res = await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftHomepageSections: sections,
          publishImmediately: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      showToast('Homepage layout published live to all visitors!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Homepage Visual Section Builder
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Drag, reorder, configure, and toggle all 18 editorial sections. Changes are isolated in draft until published.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 border border-[#EAEAEA] bg-white text-xs font-medium rounded-sm hover:bg-[#F8F7F4] text-[#111111] flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            disabled={publishing}
            onClick={handlePublishLive}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {publishing ? (
              <span>Publishing...</span>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publish to Live Storefront</span>
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

      {/* Add New Section Bar */}
      <div className="bg-white p-4 rounded-sm border border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
            Add Section to Homepage:
          </span>
          <select
            value={selectedAddType}
            onChange={(e) => setSelectedAddType(e.target.value)}
            className="text-xs py-1.5 px-3 border border-[#EAEAEA] rounded-sm bg-white"
          >
            {Object.entries(SECTION_TYPE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="px-4 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Insert Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAEAEA] bg-[#F8F7F4] flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
            Homepage Section Stack ({sections.length} Configured)
          </h2>
          <span className="text-[11px] text-[#858585]">
            Use arrows to reorder • Toggle eye icon to show/hide
          </span>
        </div>

        <div className="divide-y divide-[#EAEAEA]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#858585]">Loading section configurations...</div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#858585]">No sections configured.</div>
          ) : (
            sections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  !sec.enabled ? 'bg-neutral-50/70 opacity-60' : 'hover:bg-[#F8F7F4]/40'
                }`}
              >
                {/* Left: Order badge + Title + Type */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-xs bg-[#111111] text-white text-[11px] font-mono flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </span>

                  <div>
                    <h3 className="text-xs font-bold text-[#111111] truncate">
                      {sec.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono uppercase text-[#C6AE91] bg-neutral-900 px-1.5 py-0.5 rounded-xs">
                        {sec.type}
                      </span>
                      <span className="text-[10px] text-[#858585]">
                        {sec.enabled ? 'Active on Storefront' : 'Hidden / Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 text-neutral-500 hover:text-[#111111] border border-[#EAEAEA] rounded-xs disabled:opacity-20"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 text-neutral-500 hover:text-[#111111] border border-[#EAEAEA] rounded-xs disabled:opacity-20"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggle(idx)}
                    className={`p-1.5 border rounded-xs transition-colors ${
                      sec.enabled
                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-neutral-400 border-neutral-300 bg-neutral-100 hover:bg-neutral-200'
                    }`}
                    title={sec.enabled ? 'Hide Section' : 'Show Section'}
                  >
                    {sec.enabled ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Edit Props */}
                  <button
                    type="button"
                    onClick={() => openEdit(sec)}
                    className="p-1.5 text-neutral-600 hover:text-[#111111] border border-[#EAEAEA] rounded-xs hover:bg-[#F8F7F4]"
                    title="Configure Section Props & Content"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 border border-[#EAEAEA] rounded-xs hover:bg-red-50"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-[#111111]">
              Configure Section: {editingSection.type}
            </h2>

            <form onSubmit={handleSaveProps} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Section Label
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Section Content & Attributes (JSON)
                  </label>
                  <span className="text-[10px] text-[#858585]">
                    Headlines, imagery URLs, button texts & links
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={editPropsJson}
                  onChange={(e) => setEditPropsJson(e.target.value)}
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono bg-neutral-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-[#EAEAEA] text-xs font-medium rounded-sm hover:bg-[#F8F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111]"
                >
                  Save Section Props
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
