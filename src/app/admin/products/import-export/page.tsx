'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export default function BulkImportExportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<Array<{ row: number; error: string }>>([]);
  const [updateIfExists, setUpdateIfExists] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    importedCount?: number;
    updatedCount?: number;
    errors?: any[];
  } | null>(null);

  // Template CSV Download
  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'sku',
      'regularPrice',
      'salePrice',
      'costPrice',
      'category',
      'brand',
      'gender',
      'fabric',
      'fit',
      'sizes',
      'colors',
      'stock',
      'imageUrl',
      'shortDescription',
      'description',
    ];

    const sampleRow = [
      'Atelier Silk Minimalist Shirt',
      'NXG-SHRT-100',
      '6500',
      '5500',
      '3000',
      'Men',
      'Nexstep Atelier',
      'MEN',
      '100% Mulberry Silk',
      'Relaxed Fit',
      'S, M, L, XL',
      'Charcoal Black, Off White',
      '40',
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000',
      'Breathable organic mulberry silk luxury shirt.',
      'Designed for effortless elegance and warm-weather drape.',
    ];

    const csvContent = [headers.join(','), sampleRow.map((s) => `"${s}"`).join(',')].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nexstep_product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple client CSV parser
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setPreviewErrors([{ row: 1, error: 'CSV file must contain a header row and at least one product row.' }]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
      const rows: any[] = [];
      const errors: Array<{ row: number; error: string }> = [];
      const seenSkus = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        // Parse CSV line handling quoted commas
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const values: string[] = [];
        let match;
        while ((match = regex.exec(lines[i])) !== null) {
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
          }
          values.push(val.trim());
          if (regex.lastIndex >= lines[i].length) break;
        }

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });

        // Validation
        if (!rowObj.name) {
          errors.push({ row: i + 1, error: 'Product name is missing' });
        }
        if (!rowObj.sku) {
          errors.push({ row: i + 1, error: 'Product SKU is missing' });
        } else if (seenSkus.has(rowObj.sku.toUpperCase())) {
          errors.push({ row: i + 1, error: `Duplicate SKU "${rowObj.sku}" found within this file` });
        } else {
          seenSkus.add(rowObj.sku.toUpperCase());
        }
        if (!rowObj.regularPrice || isNaN(parseFloat(rowObj.regularPrice))) {
          errors.push({ row: i + 1, error: 'Valid Regular Price is required' });
        }

        rows.push(rowObj);
      }

      setParsedRows(rows);
      setPreviewErrors(errors);
    };

    reader.readAsText(file);
  };

  // Submit Import
  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsImporting(true);
      setImportResult(null);

      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedRows,
          updateIfExists,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportResult({
        success: true,
        message: data.message,
        importedCount: data.importedCount,
        updatedCount: data.updatedCount,
        errors: data.errors,
      });
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || 'Import failed',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#EAEAEA]">
        <Link
          href="/admin/products"
          className="p-2 border border-[#EAEAEA] rounded-sm hover:bg-[#F8F7F4] text-[#858585] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-light text-[#111111]">
            Bulk Product Import & Export
          </h1>
          <p className="text-xs text-[#858585] mt-0.5">
            Synchronize hundreds of luxury garments, variant inventories, and prices via standard CSV spreadsheets.
          </p>
        </div>
      </div>

      {/* Grid: 2 Columns (Export vs Import) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. EXPORT SECTION */}
        <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-[#111111]">
            <Download className="w-5 h-5 text-[#C6AE91]" />
            <h2 className="text-base font-semibold">Export Catalog to CSV</h2>
          </div>
          <p className="text-xs text-[#858585]">
            Export all current products including variants, SKU, pricing, category links, inventory levels, and image URLs.
          </p>

          <div className="pt-4 border-t border-[#EAEAEA]">
            <a
              href="/api/products/export"
              download
              className="w-full py-2.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Catalog (.CSV)</span>
            </a>
          </div>
        </div>

        {/* 2. TEMPLATE DOWNLOAD */}
        <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-[#111111]">
            <FileSpreadsheet className="w-5 h-5 text-[#C6AE91]" />
            <h2 className="text-base font-semibold">Sample CSV Template</h2>
          </div>
          <p className="text-xs text-[#858585]">
            Download the pre-formatted spreadsheet template with the exact column headers required by our catalog import engine.
          </p>

          <div className="pt-4 border-t border-[#EAEAEA]">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="w-full py-2.5 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#F8F7F4] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample Template (.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CSV UPLOAD & EXECUTION */}
      <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 space-y-6">
        <div className="flex items-center gap-2.5 text-[#111111]">
          <Upload className="w-5 h-5 text-[#C6AE91]" />
          <div>
            <h2 className="text-base font-semibold">Import Products from CSV</h2>
            <p className="text-xs text-[#858585]">
              Upload a valid CSV file. The system will parse each row, check for missing values or duplicates, and allow you to review before committing.
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-[#EAEAEA] hover:border-[#111111] transition-colors rounded-sm p-8 text-center bg-[#F8F7F4]/50">
          <input
            type="file"
            id="csv-file-input"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-[#C6AE91] mx-auto" />
            <p className="text-xs font-semibold text-[#111111]">
              {csvFile ? csvFile.name : 'Click to select CSV spreadsheet or drag & drop'}
            </p>
            <p className="text-[11px] text-[#858585]">Supports UTF-8 encoded .csv files</p>
          </label>
        </div>

        {/* Preview & Options */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#EAEAEA]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[#111111] font-semibold">
                Parsed {parsedRows.length} product row(s) from spreadsheet.
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateIfExists}
                  onChange={(e) => setUpdateIfExists(e.target.checked)}
                  className="rounded-xs text-[#111111]"
                />
                <span className="font-medium text-[#111111]">
                  Update existing products if SKU matches
                </span>
              </label>
            </div>

            {/* Validation errors warning if any */}
            {previewErrors.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Found {previewErrors.length} validation issue(s) in spreadsheet:</span>
                </p>
                <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                  {previewErrors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>
                      Row {err.row}: {err.error}
                    </li>
                  ))}
                  {previewErrors.length > 5 && (
                    <li>...and {previewErrors.length - 5} more issues.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            <div className="overflow-x-auto border border-[#EAEAEA] rounded-sm max-h-60">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-[#F8F7F4] border-b border-[#EAEAEA] text-[#858585]">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Sizes</th>
                    <th className="py-2 px-3">Colors</th>
                    <th className="py-2 px-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {parsedRows.slice(0, 10).map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F7F4]/60">
                      <td className="py-2 px-3 text-neutral-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-medium">{r.sku}</td>
                      <td className="py-2 px-3 font-semibold text-[#111111]">{r.name}</td>
                      <td className="py-2 px-3 font-mono">৳{r.regularPrice}</td>
                      <td className="py-2 px-3 text-[#858585]">{r.category || '—'}</td>
                      <td className="py-2 px-3 text-[#858585]">{r.sizes || 'M'}</td>
                      <td className="py-2 px-3 text-[#858585]">{r.colors || 'Black'}</td>
                      <td className="py-2 px-3 font-semibold">{r.stock || '10'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Execute Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isImporting}
                onClick={handleExecuteImport}
                className="px-6 py-2.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Import...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Execute Bulk Import ({parsedRows.length} Products)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Report */}
        {importResult && (
          <div
            className={`p-4 rounded-sm text-xs border ${
              importResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span>{importResult.message}</span>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-3 p-3 bg-white/70 rounded-xs border border-emerald-300">
                <p className="font-semibold text-neutral-800 mb-1">Items requiring attention:</p>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-neutral-700">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row} (SKU: {err.sku}): {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
