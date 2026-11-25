'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Menu,
} from 'lucide-react';

export default function NavigationMenuPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [items, setItems] = useState<Array<{ label: string; url: string; children?: any[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadMenus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/navigation-menus');
      const data = await res.json();
      if (data.menus && data.menus.length > 0) {
        setMenus(data.menus);
        setActiveMenuId(data.menus[0].id);
        setItems(JSON.parse(data.menus[0].items || '[]'));
      }
    } catch (e) {
      showToast('Failed to load navigation menus', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleSelectMenu = (id: string) => {
    setActiveMenuId(id);
    const m = menus.find((menu) => menu.id === id);
    if (m) {
      try {
        setItems(JSON.parse(m.items || '[]'));
      } catch {
        setItems([]);
      }
    }
  };

  const handleAddItem = () => {
    setItems([...items, { label: 'New Navigation Item', url: '/shop' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const list = [...items];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    setItems(list);
  };

  const handleSave = async () => {
    if (!activeMenuId) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/navigation-menus/${activeMenuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: JSON.stringify(items) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save menu');

      showToast('Navigation menu updated successfully!');
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
            Navigation Menu Builder
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Configure header navigation links, category dropdowns, and footer link columns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-2 border border-[#111111] text-[#111111] text-xs font-semibold rounded-sm hover:bg-[#F8F7F4] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Save Menu</span>
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

      {/* Select Menu */}
      <div className="flex gap-2">
        {menus.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleSelectMenu(m.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors border ${
              activeMenuId === m.id
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-[#858585] border-[#EAEAEA] hover:text-[#111111]'
            }`}
          >
            {m.name} ({m.location})
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-5 space-y-3 shadow-xs">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 border border-[#EAEAEA] rounded-xs bg-[#F8F7F4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="font-mono text-[10px] text-neutral-400 font-bold w-4">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].label = e.target.value;
                  setItems(updated);
                }}
                placeholder="Link Label"
                className="w-1/3 p-1.5 border border-[#EAEAEA] rounded-xs bg-white font-medium"
              />
              <input
                type="text"
                value={item.url}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].url = e.target.value;
                  setItems(updated);
                }}
                placeholder="URL (e.g. /shop, /category/men)"
                className="flex-1 p-1.5 border border-[#EAEAEA] rounded-xs bg-white font-mono"
              />
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-1 text-neutral-400 hover:text-[#111111] disabled:opacity-30"
              >
                <MoveUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === items.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1 text-neutral-400 hover:text-[#111111] disabled:opacity-30"
              >
                <MoveDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="p-1 text-neutral-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
