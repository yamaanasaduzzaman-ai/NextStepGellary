'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Palette,
  Ruler,
  Scissors,
  Sparkles,
} from 'lucide-react';

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('SIZE');
  const [valuesInput, setValuesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attributes');
      const data = await res.json();
      if (data.attributes) setAttributes(data.attributes);
    } catch (e) {
      showToast('Failed to load attributes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  const openCreateModal = () => {
    setEditingAttr(null);
    setName('');
    setType('SIZE');
    setValuesInput('XS, S, M, L, XL, XXL');
    setIsModalOpen(true);
  };

  const openEditModal = (attr: any) => {
    setEditingAttr(attr);
    setName(attr.name);
    setType(attr.type);
    let parsed = attr.values;
    try {
      const j = JSON.parse(attr.values);
      if (Array.isArray(j)) {
        if (typeof j[0] === 'object' && j[0] !== null) {
          parsed = j.map((item: any) => `${item.name}:${item.hex || ''}`).join(', ');
        } else {
          parsed = j.join(', ');
        }
      }
    } catch {}
    setValuesInput(parsed);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !valuesInput) return;

    try {
      setSubmitting(true);

      let finalValues: any;
      if (type === 'COLOR') {
        // Parse items like "Black:#111111, White:#FFFFFF" or "Black, White"
        const items = valuesInput.split(',').map((s) => s.trim()).filter(Boolean);
        finalValues = items.map((item) => {
          if (item.includes(':')) {
            const [colorName, hex] = item.split(':').map((x) => x.trim());
            return { name: colorName, hex: hex.startsWith('#') ? hex : `#${hex}` };
          }
          return { name: item, hex: '#111111' };
        });
      } else {
        finalValues = valuesInput.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const payload = {
        name: name.trim(),
        type,
        values: JSON.stringify(finalValues),
      };

      const url = editingAttr ? `/api/attributes/${editingAttr.id}` : '/api/attributes';
      const method = editingAttr ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      showToast(editingAttr ? 'Attribute updated!' : 'Attribute created!');
      setIsModalOpen(false);
      loadAttributes();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (attr: any) => {
    if (!confirm(`Are you sure you want to delete attribute "${attr.name}"?`)) return;

    try {
      const res = await fetch(`/api/attributes/${attr.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Attribute deleted');
      loadAttributes();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Product Attributes & Taxonomy
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure sizing charts, color swatches with hex codes, luxury fabric options, and tailoring fits.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attribute</span>
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

      {/* Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attributes.map((attr) => {
          let parsedValues: any[] = [];
          try {
            parsedValues = JSON.parse(attr.values);
          } catch {}

          const Icon =
            attr.type === 'COLOR'
              ? Palette
              : attr.type === 'SIZE'
              ? Ruler
              : attr.type === 'FABRIC'
              ? Scissors
              : Sparkles;

          return (
            <div
              key={attr.id}
              className="bg-white border border-[#EAEAEA] rounded-sm p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#F8F7F4] rounded-sm text-[#111111]">
                    <Icon className="w-4 h-4 text-[#C6AE91]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111111]">{attr.name}</h3>
                    <span className="text-[10px] text-[#858585] uppercase tracking-wider font-mono">
                      Type: {attr.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(attr)}
                    className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(attr)}
                    className="p-1 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Values Pills */}
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(parsedValues) &&
                  parsedValues.map((v: any, idx: number) => {
                    if (typeof v === 'object' && v !== null && v.hex) {
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F7F4] border border-[#EAEAEA] rounded-xs text-[11px] font-medium text-[#111111]"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: v.hex }}
                          />
                          <span>{v.name}</span>
                        </span>
                      );
                    }
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#F8F7F4] border border-[#EAEAEA] rounded-xs text-[11px] font-medium text-[#111111]"
                      >
                        {typeof v === 'string' ? v : JSON.stringify(v)}
                      </span>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#111111]">
              {editingAttr ? 'Edit Product Attribute' : 'Add New Attribute'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Attribute Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sizing, Color, Fabric"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Attribute Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
                >
                  <option value="SIZE">Size (S, M, L, XL)</option>
                  <option value="COLOR">Color Swatch (Name:Hex)</option>
                  <option value="FABRIC">Fabric Composition</option>
                  <option value="FIT">Silhouette / Fit</option>
                  <option value="CUSTOM">Custom Attribute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1">
                  Options / Values (Comma-separated) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={valuesInput}
                  onChange={(e) => setValuesInput(e.target.value)}
                  placeholder={
                    type === 'COLOR'
                      ? 'Charcoal Black:#111111, Off White:#F8F7F4, Warm Beige:#C6AE91'
                      : 'XS, S, M, L, XL, XXL'
                  }
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
                <span className="text-[10px] text-[#858585] mt-1 block">
                  {type === 'COLOR'
                    ? 'Tip: Specify color names and hex codes as "Name:#HEX" separated by commas.'
                    : 'Separate each option with a comma.'}
                </span>
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
                  {submitting ? 'Saving...' : editingAttr ? 'Save Changes' : 'Create Attribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
