'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { formatBDT } from '@/lib/utils';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  regularPrice: number;
  salePrice: number | null;
  status: string;
  gender: string;
  createdAt: string;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  images: Array<{ url: string }>;
  variants: Array<{ id: string; size: string; color: string; stock: number }>;
  _count?: { orderItems: number };
}

interface ProductListClientProps {
  initialProducts: any[];
  categories: any[];
  brands: any[];
}

export default function ProductListClient({
  initialProducts,
  categories,
  brands,
}: ProductListClientProps) {
  const router = useRouter();

  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStock, setSelectedStock] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price-asc, price-desc, name-asc

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Filter & Sort logic
  const filteredProducts = products.filter((p) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }

    // Category
    if (selectedCategory !== 'ALL') {
      if (p.category?.id !== selectedCategory) return false;
    }

    // Status
    if (selectedStatus !== 'ALL') {
      if (p.status !== selectedStatus) return false;
    }

    // Stock level
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    if (selectedStock === 'IN_STOCK' && totalStock <= 0) return false;
    if (selectedStock === 'LOW_STOCK' && (totalStock <= 0 || totalStock > 10)) return false;
    if (selectedStock === 'OUT_OF_STOCK' && totalStock > 0) return false;

    return true;
  });

  // Sorting
  filteredProducts.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'price-asc') return a.regularPrice - b.regularPrice;
    if (sortBy === 'price-desc') return b.regularPrice - a.regularPrice;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  // Paginated slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'PUBLISH' | 'DRAFT' | 'ARCHIVE' | 'DELETE') => {
    if (selectedIds.length === 0) return;

    if (action === 'DELETE') {
      if (!confirm(`Are you sure you want to delete / archive ${selectedIds.length} selected product(s)?`)) {
        return;
      }
    }

    try {
      setBulkLoading(true);
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk action failed');

      showToast(data.message || 'Bulk operation completed successfully');
      setSelectedIds([]);
      router.refresh();
      // Reload products locally
      const updatedList = await fetch('/api/products?admin=true&limit=100').then((r) => r.json());
      if (updatedList.products) setProducts(updatedList.products);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Duplicate Product
  const handleDuplicate = async (p: ProductItem) => {
    try {
      showToast(`Duplicating ${p.name}...`);
      const res = await fetch(`/api/products/${p.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate');

      showToast(`Created draft duplicate: ${data.product.name}`);
      router.refresh();
      const updatedList = await fetch('/api/products?admin=true&limit=100').then((r) => r.json());
      if (updatedList.products) setProducts(updatedList.products);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Archive Product
  const handleArchive = async (p: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to archive');

      showToast(`Product "${p.name}" has been archived.`);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, status: 'ARCHIVED' } : item))
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalProduct) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/products/${deleteModalProduct.id}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast(data.message || 'Product removed successfully');
      setDeleteModalProduct(null);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModalProduct.id));
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Product Catalog Management
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Full control over luxury garments, variants, pricing, inventory movements, and multi-image galleries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/products/import-export"
            className="px-3 py-2 border border-[#EAEAEA] bg-white text-xs font-medium rounded-sm hover:bg-[#F8F7F4] text-[#111111] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bulk CSV Import/Export</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-sm border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#858585] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, SKU, or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt;0)</option>
              <option value="LOW_STOCK">Low Stock (≤10)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Sorting & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EAEAEA] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#858585]">
              Showing <strong>{filteredProducts.length}</strong> products
            </span>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 ml-4">
                <span className="font-semibold text-[#111111]">
                  {selectedIds.length} selected:
                </span>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction('PUBLISH')}
                  className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs hover:bg-emerald-100 font-medium"
                >
                  Publish
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction('DRAFT')}
                  className="px-2 py-1 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xs hover:bg-neutral-200 font-medium"
                >
                  Draft
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction('ARCHIVE')}
                  className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs hover:bg-amber-100 font-medium"
                >
                  Archive
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction('DELETE')}
                  className="px-2 py-1 bg-red-50 text-red-800 border border-red-200 rounded-xs hover:bg-red-100 font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#858585]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1 px-2 border border-[#EAEAEA] rounded-sm text-xs bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      selectedIds.length === paginatedProducts.length
                    }
                    onChange={handleSelectAll}
                    className="rounded-xs"
                  />
                </th>
                <th className="py-3 px-4 font-semibold uppercase">Product</th>
                <th className="py-3 px-4 font-semibold uppercase">SKU</th>
                <th className="py-3 px-4 font-semibold uppercase">Category / Brand</th>
                <th className="py-3 px-4 font-semibold uppercase">Price (BDT)</th>
                <th className="py-3 px-4 font-semibold uppercase">Total Stock</th>
                <th className="py-3 px-4 font-semibold uppercase">Status</th>
                <th className="py-3 px-4 font-semibold uppercase">Created</th>
                <th className="py-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                  const isSelected = selectedIds.includes(p.id);
                  const primaryImg =
                    p.images[0]?.url || 'https://via.placeholder.com/80';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#F8F7F4]/60 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded-xs"
                        />
                      </td>

                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="relative w-10 h-12 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                          <Image src={primaryImg} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <strong className="text-[#111111] font-semibold block line-clamp-1">
                            {p.name}
                          </strong>
                          <span className="text-[10px] text-[#858585] uppercase">
                            {p.gender} • {p.variants.length} variant(s)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-600 font-medium">
                        {p.sku}
                      </td>

                      <td className="py-3 px-4 text-[#858585]">
                        <span className="text-[#111111] block font-medium">
                          {p.category?.name || 'Unassigned'}
                        </span>
                        {p.brand && (
                          <span className="text-[10px] text-[#C6AE91]">
                            {p.brand.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium">
                        {p.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-emerald-700 font-semibold">
                              {formatBDT(p.salePrice)}
                            </span>
                            <span className="line-through text-[10px] text-[#858585]">
                              {formatBDT(p.regularPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#111111]">{formatBDT(p.regularPrice)}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold inline-block px-2 py-0.5 rounded-xs text-[11px] ${
                            totalStock > 10
                              ? 'text-emerald-800 bg-emerald-50'
                              : totalStock > 0
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-red-700 bg-red-50'
                          }`}
                        >
                          {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold tracking-wider uppercase ${
                            p.status === 'PUBLISHED'
                              ? 'bg-[#111111] text-[#F8F7F4]'
                              : p.status === 'DRAFT'
                              ? 'bg-neutral-200 text-neutral-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#858585] text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1 text-neutral-400 hover:text-[#111111]"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1 text-neutral-400 hover:text-[#C6AE91]"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            className="p-1 text-neutral-400 hover:text-blue-600"
                            title="Duplicate as Draft"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive */}
                          {p.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleArchive(p)}
                              className="p-1 text-neutral-400 hover:text-amber-600"
                              title="Archive Product"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalProduct(p)}
                            className="p-1 text-neutral-400 hover:text-red-600"
                            title="Delete / Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#858585]">
                    No products found matching your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#EAEAEA] flex items-center justify-between text-xs">
            <span className="text-[#858585]">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-[#EAEAEA] rounded-xs disabled:opacity-40 hover:bg-[#F8F7F4]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-[#EAEAEA] rounded-xs disabled:opacity-40 hover:bg-[#F8F7F4]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-[#EAEAEA] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-full">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111111]">
                  Confirm Product Deletion / Archival
                </h3>
                <p className="text-xs text-[#858585] mt-1">
                  You are about to delete <strong>{deleteModalProduct.name}</strong> (SKU:{' '}
                  {deleteModalProduct.sku}).
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-[11px] text-amber-900 space-y-1">
              <p className="font-semibold">Financial & Historical Order Protection:</p>
              <p>
                If this product has been ordered by customers in previous orders, it will be safely
                <strong> ARCHIVED</strong> instead of deleted to protect order receipts, invoice records,
                and accounting balance sheets.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2 border border-[#EAEAEA] text-xs font-medium rounded-sm hover:bg-[#F8F7F4]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Processing...' : 'Proceed with Safe Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
