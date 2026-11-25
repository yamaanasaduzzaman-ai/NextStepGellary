'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatBDT } from '@/lib/utils';

export interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference data from DB
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);

  // Form State - Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [gender, setGender] = useState(initialData?.gender || 'UNISEX');
  const [productType, setProductType] = useState(initialData?.productType || 'Physical');
  const [brandId, setBrandId] = useState(initialData?.brandId || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(initialData?.subcategoryId || '');
  const [collectionId, setCollectionId] = useState(initialData?.collectionId || '');
  const [tags, setTags] = useState(initialData?.tags || '');
  const [fabric, setFabric] = useState(initialData?.fabric || '');
  const [fit, setFit] = useState(initialData?.fit || 'Regular Fit');
  const [pattern, setPattern] = useState(initialData?.pattern || 'Solid');
  const [careInstructions, setCareInstructions] = useState(initialData?.careInstructions || '');
  const [origin, setOrigin] = useState(initialData?.origin || 'Bangladesh');
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');

  // Pricing & Tax
  const [regularPrice, setRegularPrice] = useState(initialData?.regularPrice?.toString() || '');
  const [salePrice, setSalePrice] = useState(initialData?.salePrice?.toString() || '');
  const [costPrice, setCostPrice] = useState(initialData?.costPrice?.toString() || '');
  const [taxPercent, setTaxPercent] = useState(initialData?.taxPercent?.toString() || '0');
  const [saleStartDate, setSaleStartDate] = useState(
    initialData?.saleStartDate ? new Date(initialData.saleStartDate).toISOString().slice(0, 10) : ''
  );
  const [saleEndDate, setSaleEndDate] = useState(
    initialData?.saleEndDate ? new Date(initialData.saleEndDate).toISOString().slice(0, 10) : ''
  );

  // Status & Visibility
  const [status, setStatus] = useState(initialData?.status || 'PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival !== undefined ? Boolean(initialData.isNewArrival) : true);
  const [isBestSeller, setIsBestSeller] = useState(Boolean(initialData?.isBestSeller));
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.lowStockThreshold?.toString() || '10');

  // Images
  const [images, setImages] = useState<Array<{ url: string; altText: string; colorTag?: string; isPrimary: boolean; displayOrder: number }>>(
    initialData?.images?.map((img: any, idx: number) => ({
      url: img.url,
      altText: img.altText || '',
      colorTag: img.colorTag || '',
      isPrimary: Boolean(img.isPrimary || idx === 0),
      displayOrder: img.displayOrder || idx + 1,
    })) || [
      {
        url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        altText: '',
        colorTag: '',
        isPrimary: true,
        displayOrder: 1,
      },
    ]
  );

  // Variants
  const [variants, setVariants] = useState<Array<{
    id?: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    price: string;
    stock: number;
    barcode: string;
    isAvailable: boolean;
  }>>(
    initialData?.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex || '#111111',
      price: v.price ? v.price.toString() : '',
      stock: v.stock || 0,
      barcode: v.barcode || '',
      isAvailable: v.isAvailable !== undefined ? v.isAvailable : true,
    })) || [
      { sku: 'NXG-S-BLK', size: 'S', color: 'Charcoal Black', colorHex: '#111111', price: '', stock: 15, barcode: '', isAvailable: true },
      { sku: 'NXG-M-BLK', size: 'M', color: 'Charcoal Black', colorHex: '#111111', price: '', stock: 20, barcode: '', isAvailable: true },
      { sku: 'NXG-L-BLK', size: 'L', color: 'Charcoal Black', colorHex: '#111111', price: '', stock: 15, barcode: '', isAvailable: true },
    ]
  );

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [ogImage, setOgImage] = useState(initialData?.ogImage || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '');
  const [noIndex, setNoIndex] = useState(Boolean(initialData?.noIndex));

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'images' | 'pricing' | 'seo' | 'history'>('basic');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-generate slug and variant SKUs when name or SKU changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSkuChange = (val: string) => {
    setSku(val);
    if (!isEdit) {
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: `${val}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, ''),
        }))
      );
    }
  };

  // Load Categories, Brands, Collections, Attributes
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [catsRes, brandsRes, collsRes, attrsRes] = await Promise.all([
          fetch('/api/categories?all=true'),
          fetch('/api/brands?all=true'),
          fetch('/api/collections?all=true'),
          fetch('/api/attributes'),
        ]);

        const catsData = await catsRes.json();
        const brandsData = await brandsRes.json();
        const collsData = await collsRes.json();
        const attrsData = await attrsRes.json();

        if (catsData.categories) setCategories(catsData.categories);
        if (brandsData.brands) setBrands(brandsData.brands);
        if (collsData.collections) setCollections(collsData.collections);
        if (attrsData.attributes) setAttributes(attrsData.attributes);
      } catch (e) {
        console.error('Failed to load master data:', e);
      }
    }
    loadMasterData();
  }, []);

  // Filter subcategories based on chosen categoryId
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Calculate discount percentage
  const regPriceNum = parseFloat(regularPrice) || 0;
  const salePriceNum = parseFloat(salePrice) || 0;
  const discountPercent =
    salePriceNum > 0 && regPriceNum > salePriceNum
      ? Math.round(((regPriceNum - salePriceNum) / regPriceNum) * 100)
      : null;

  // Total stock computed
  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const uploadedFiles = Array.isArray(data.files) ? data.files : [data];
      const newImages = uploadedFiles.map((f: any, idx: number) => ({
        url: f.url,
        altText: name || 'Product image',
        colorTag: '',
        isPrimary: images.length === 0 && idx === 0,
        displayOrder: images.length + idx + 1,
      }));

      setImages([...images, ...newImages]);
      setSuccessMessage(`Uploaded ${newImages.length} image(s) successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIdx, 0, moved);

    setImages(
      reordered.map((img, i) => ({
        ...img,
        displayOrder: i + 1,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    const filtered = images.filter((_, i) => i !== index);
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    setImages(filtered);
  };

  // Variant Matrix Handlers
  const handleAddVariant = () => {
    const newVariant = {
      sku: `${sku || 'NXG'}-VAR-${variants.length + 1}`.toUpperCase(),
      size: 'M',
      color: 'Charcoal Black',
      colorHex: '#111111',
      price: '',
      stock: 10,
      barcode: '',
      isAvailable: true,
    };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, val: any) => {
    setVariants(
      variants.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, [field]: val };
        if ((field === 'size' || field === 'color') && !isEdit) {
          updated.sku = `${sku || 'NXG'}-${updated.size}-${updated.color}`.toUpperCase().replace(/\s+/g, '');
        }
        return updated;
      })
    );
  };

  // Submit Handler
  const handleSave = async (overrideStatus?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const finalStatus = overrideStatus || status;

    if (!name || !sku || !regularPrice || !description) {
      setErrorMessage('Please fill in required fields: Product Name, SKU, Regular Price, and Description.');
      setActiveTab('basic');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('Please add at least one product variation.');
      setActiveTab('variants');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        sku: sku.trim(),
        shortDescription: shortDescription.trim() || null,
        description: description.trim(),
        gender,
        status: finalStatus,
        productType,
        regularPrice: parseFloat(regularPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        taxPercent: taxPercent ? parseFloat(taxPercent) : 0,
        saleStartDate: saleStartDate ? new Date(saleStartDate).toISOString() : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate).toISOString() : null,
        fabric: fabric.trim() || null,
        fit,
        pattern,
        careInstructions: careInstructions.trim() || null,
        origin,
        weight: weight ? parseFloat(weight) : null,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        collectionId: collectionId || null,
        brandId: brandId || null,
        tags: tags.trim() || null,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 10,
        seoTitle: seoTitle.trim() || name.trim(),
        seoDescription: seoDescription.trim() || shortDescription.trim() || description.slice(0, 150),
        seoKeywords: seoKeywords.trim() || null,
        ogImage: ogImage.trim() || images[0]?.url || null,
        canonicalUrl: canonicalUrl.trim() || null,
        noIndex,
        isFeatured,
        isNewArrival,
        isBestSeller,
        images: images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || name,
          colorTag: img.colorTag || null,
          isPrimary: Boolean(img.isPrimary),
          displayOrder: idx + 1,
        })),
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku.trim(),
          size: v.size.trim(),
          color: v.color.trim(),
          colorHex: v.colorHex || '#111111',
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock.toString(), 10) || 0,
          barcode: v.barcode.trim() || null,
          isAvailable: v.isAvailable,
        })),
      };

      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save product');

      setSuccessMessage(
        isEdit
          ? 'Product updated successfully! Changes reflect on storefront.'
          : 'Product created successfully!'
      );

      if (!isEdit) {
        setTimeout(() => {
          router.push('/admin/products');
        }, 1200);
      } else {
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving the product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 border border-[#EAEAEA] rounded-sm hover:bg-[#F8F7F4] text-[#858585] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-light text-[#111111]">
              {isEdit ? `Edit Product: ${initialData?.name}` : 'Add New Atelier Product'}
            </h1>
            <p className="text-xs text-[#858585] mt-0.5">
              {isEdit
                ? `SKU: ${initialData?.sku} • Status: ${status} • Total Stock: ${totalStock}`
                : 'Configure luxury garments, multi-variants, pricing matrix, and high-res imagery.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEdit && initialData?.slug && (
            <Link
              href={`/product/${initialData.slug}`}
              target="_blank"
              className="px-3 py-2 border border-[#EAEAEA] bg-white text-xs font-medium rounded-sm hover:bg-[#F8F7F4] text-[#111111] flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Storefront</span>
            </Link>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('DRAFT')}
            className="px-4 py-2 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('PUBLISHED')}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Update & Publish' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EAEAEA] bg-white rounded-t-sm px-4 overflow-x-auto">
        {[
          { id: 'basic', label: '1. Basic Information' },
          { id: 'pricing', label: '2. Pricing & Dates' },
          { id: 'variants', label: `3. Variations (${variants.length})` },
          { id: 'images', label: `4. Product Images (${images.length})` },
          { id: 'seo', label: '5. Advanced SEO' },
          ...(isEdit ? [{ id: 'history', label: '6. Inventory History' }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#858585] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BASIC INFORMATION */}
      {activeTab === 'basic' && (
        <div className="bg-white border border-[#EAEAEA] rounded-b-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Minimalist Linen Blazer"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Product SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => handleSkuChange(e.target.value)}
                placeholder="e.g. NXG-BLZ-001"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Product Slug (URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-slug"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Brand
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
              >
                <option value="">Select Brand (Optional)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
              >
                <option value="">Select Main Category</option>
                {categories
                  .filter((c) => !c.parentId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Subcategory
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={!categoryId || availableSubcategories.length === 0}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                <option value="">
                  {availableSubcategories.length === 0
                    ? 'No subcategories available'
                    : 'Select Subcategory'}
                </option>
                {availableSubcategories.map((sc: any) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Curated Collection
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
              >
                <option value="">None / Standard Catalog</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Gender Target
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
              >
                <option value="MEN">Men</option>
                <option value="WOMEN">Women</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
              Short Summary Description
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Master-tailored single-breasted blazer cut from organic Irish linen."
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
              Full Editorial Product Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the silhouette, handfeel, design notes, tailoring construction, and lifestyle pairings..."
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
            />
          </div>

          {/* Textile & Fit Specs */}
          <div className="pt-4 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858585] mb-4">
              Garment Specifications & Atelier Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Fabric Composition</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Giza Cotton"
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Silhouette / Fit</label>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
                >
                  <option value="Slim Fit">Slim Fit</option>
                  <option value="Regular Fit">Regular Fit</option>
                  <option value="Relaxed Fit">Relaxed Fit</option>
                  <option value="Oversized Fit">Oversized Fit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Origin Country</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Bangladesh"
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.45"
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Care & Washing Instructions</label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="e.g. Dry clean only. Cool iron if necessary."
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Product Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="linen, blazer, summer, bespoke, outerwear"
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Publishing & Badges */}
          <div className="pt-4 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858585] mb-3">
              Publishing Status & Merchandising Badges
            </h3>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <label className="block text-[11px] text-[#858585] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="p-2 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white font-medium"
                >
                  <option value="PUBLISHED">Published (Visible to patrons)</option>
                  <option value="DRAFT">Draft (Admin hidden)</option>
                  <option value="ARCHIVED">Archived (Delisted)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded-xs text-[#111111]"
                />
                <span className="font-medium text-[#111111]">Mark as New Arrival</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded-xs text-[#111111]"
                />
                <span className="font-medium text-[#111111]">Feature on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded-xs text-[#111111]"
                />
                <span className="font-medium text-[#111111]">Mark as Best Seller</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING & PROMOTIONS */}
      {activeTab === 'pricing' && (
        <div className="bg-white border border-[#EAEAEA] rounded-b-sm p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Regular Price (BDT ৳) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Sale Price (BDT ৳)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="e.g. 7200 (optional)"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
              />
              {discountPercent !== null && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Save {discountPercent}% discount
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Cost Price (BDT ৳) - Admin Confidential
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="e.g. 4200"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
              />
              <span className="text-[10px] text-[#858585] mt-1 block">
                Used to compute gross profit margins on sales reports.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                VAT / Tax Configuration (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                placeholder="0"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Sale Start Date
              </label>
              <input
                type="date"
                value={saleStartDate}
                onChange={(e) => setSaleStartDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                Sale End Date
              </label>
              <input
                type="date"
                value={saleEndDate}
                onChange={(e) => setSaleEndDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
              Low-Stock Alert Threshold
            </label>
            <div className="max-w-xs">
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="10"
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
              />
              <span className="text-[10px] text-[#858585] mt-1 block">
                Triggers notification on admin dashboard when variant stock drops below this number.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VARIATIONS */}
      {activeTab === 'variants' && (
        <div className="bg-white border border-[#EAEAEA] rounded-b-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Product Variations Matrix</h3>
              <p className="text-xs text-[#858585]">
                Each variation can have unique SKU, stock quantity, price override, and barcode.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variation</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#EAEAEA] rounded-sm">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                  <th className="py-2.5 px-3 uppercase font-semibold">Size</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Color</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Hex</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Variant SKU</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Stock</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Price Override</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Barcode</th>
                  <th className="py-2.5 px-3 uppercase font-semibold text-center">Available</th>
                  <th className="py-2.5 px-3 uppercase font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F7F4]/60">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                        placeholder="M"
                        className="w-16 p-1.5 border border-[#EAEAEA] rounded-sm text-xs font-medium"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                        placeholder="Black"
                        className="w-28 p-1.5 border border-[#EAEAEA] rounded-sm text-xs font-medium"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={v.colorHex || '#111111'}
                          onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                          className="w-6 h-6 border-0 cursor-pointer rounded-xs"
                        />
                        <span className="font-mono text-[10px] text-neutral-500">{v.colorHex}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        className="w-36 p-1.5 border border-[#EAEAEA] rounded-sm text-xs font-mono uppercase"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        className="w-20 p-1.5 border border-[#EAEAEA] rounded-sm text-xs font-semibold text-[#111111]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                        placeholder={`৳${regularPrice || '0'}`}
                        className="w-24 p-1.5 border border-[#EAEAEA] rounded-sm text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.barcode}
                        onChange={(e) => handleVariantChange(idx, 'barcode', e.target.value)}
                        placeholder="EAN-13"
                        className="w-28 p-1.5 border border-[#EAEAEA] rounded-sm text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={v.isAvailable}
                        onChange={(e) => handleVariantChange(idx, 'isAvailable', e.target.checked)}
                        className="rounded-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        disabled={variants.length <= 1}
                        className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-30"
                        title="Delete Variation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-[#858585] pt-2">
            <span>Total Available Inventory across all variations:</span>
            <strong className="text-sm font-semibold text-[#111111]">{totalStock} Units</strong>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCT IMAGES */}
      {activeTab === 'images' && (
        <div className="bg-white border border-[#EAEAEA] rounded-b-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Product Image Gallery</h3>
              <p className="text-xs text-[#858585]">
                Upload high-resolution photography. Star the featured hero image, reorder, and tag images to specific colors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-[#111111] text-white text-xs font-medium rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Photos (JPG/PNG/WebP)'}</span>
              </button>
            </div>
          </div>

          {/* Image List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative border rounded-sm p-2 flex flex-col bg-white transition-all ${
                  img.isPrimary ? 'border-[#C6AE91] shadow-xs' : 'border-[#EAEAEA]'
                }`}
              >
                <div className="relative aspect-3/4 bg-neutral-100 rounded-xs overflow-hidden mb-2">
                  <Image src={img.url} alt={img.altText || 'Preview'} fill className="object-cover" />
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 bg-[#111111] text-[#C6AE91] text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Hero
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 text-xs">
                  <input
                    type="text"
                    value={img.altText}
                    onChange={(e) => {
                      const updated = [...images];
                      updated[idx].altText = e.target.value;
                      setImages(updated);
                    }}
                    placeholder="Alt text / Description"
                    className="w-full p-1.5 border border-[#EAEAEA] rounded-xs text-[11px]"
                  />

                  <input
                    type="text"
                    value={img.colorTag || ''}
                    onChange={(e) => {
                      const updated = [...images];
                      updated[idx].colorTag = e.target.value;
                      setImages(updated);
                    }}
                    placeholder="Color variation tag (e.g. Black)"
                    className="w-full p-1.5 border border-[#EAEAEA] rounded-xs text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#EAEAEA]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, 'up')}
                      className="p-1 text-neutral-400 hover:text-[#111111] disabled:opacity-30"
                      title="Move Left/Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveImage(idx, 'down')}
                      className="p-1 text-neutral-400 hover:text-[#111111] disabled:opacity-30"
                      title="Move Right/Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`p-1 transition-colors ${
                        img.isPrimary ? 'text-[#C6AE91]' : 'text-neutral-400 hover:text-[#C6AE91]'
                      }`}
                      title={img.isPrimary ? 'Primary Featured Hero Image' : 'Set as Primary Image'}
                    >
                      <Star className={`w-4 h-4 ${img.isPrimary ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 text-neutral-400 hover:text-red-600"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADVANCED SEO */}
      {activeTab === 'seo' && (
        <div className="bg-white border border-[#EAEAEA] rounded-b-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-[#858585]">
              Optimize meta descriptions, title tags, open-graph image previews, and canonical links.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#111111]">
                  SEO Page Title
                </label>
                <span className="text-[10px] text-[#858585]">
                  {seoTitle.length} / 60 characters
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name || 'Nexstep Luxury Apparel'}
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#111111]">
                  Meta Description
                </label>
                <span className="text-[10px] text-[#858585]">
                  {seoDescription.length} / 160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Dispatches on luxury apparel, tailored cuts, and organic textiles."
                className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="menswear, blazer, luxury fashion bangladesh"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111] mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://nexstepgallery.com/product/..."
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:border-[#111111] outline-hidden font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                className="rounded-xs text-[#111111]"
              />
              <span className="text-xs font-medium text-[#111111]">
                Hide from Search Engines (noindex, nofollow)
              </span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 6: INVENTORY HISTORY (If Edit) */}
      {activeTab === 'history' && isEdit && (
        <div className="bg-white border border-[#EAEAEA] rounded-b-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#111111]">Inventory Movement Audit Trail</h3>
          <p className="text-xs text-[#858585]">
            Automatic record of every stock change, intake, manual adjustment, and order deduction.
          </p>

          <div className="overflow-x-auto border border-[#EAEAEA] rounded-sm">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                  <th className="py-2.5 px-3 uppercase font-semibold">Date</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Type</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Prev Stock</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Change</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">New Stock</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Reason</th>
                  <th className="py-2.5 px-3 uppercase font-semibold">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {initialData?.inventoryMovements && initialData.inventoryMovements.length > 0 ? (
                  initialData.inventoryMovements.map((m: any) => (
                    <tr key={m.id} className="hover:bg-[#F8F7F4]/60">
                      <td className="py-2 px-3 text-neutral-600 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#111111]">
                        {m.movementType}
                      </td>
                      <td className="py-2 px-3">{m.previousStock}</td>
                      <td
                        className={`py-2 px-3 font-semibold ${
                          m.quantityChange >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </td>
                      <td className="py-2 px-3 font-semibold">{m.newStock}</td>
                      <td className="py-2 px-3 text-neutral-600">{m.reason || '—'}</td>
                      <td className="py-2 px-3 text-neutral-600">{m.performedBy || 'System'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#858585]">
                      No recorded stock adjustments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
