'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Link,
  Download,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { bulkCreateProductsApi } from '@/lib/api';
import { downloadSampleProductCsvTemplate, parseProductImportCsv } from './productCsvUtils';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export function ProductImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ProductImportModalProps) {
  const [importTab, setImportTab] = useState<'file' | 'google_sheet'>('file');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [fetchingSheet, setFetchingSheet] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadSampleTemplate = () => {
    downloadSampleProductCsvTemplate();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const rows = parseProductImportCsv(content);
        if (rows.length === 0) {
          setError('No valid rows found in file. Please ensure columns match the template.');
        } else {
          setParsedRows(rows);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrl.trim()) return;
    try {
      setFetchingSheet(true);
      setError(null);
      const match = googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
        setError('Invalid Google Sheet URL. Please ensure it is a valid Google Sheets link.');
        return;
      }
      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error('Could not fetch Google Sheet. Please ensure it is publicly shared (Anyone with link).');
      const csvText = await res.text();
      const rows = parseProductImportCsv(csvText);
      if (rows.length === 0) {
        setError('Google Sheet parsed 0 product rows. Please ensure header row has: name, sku, selling_price.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Google Sheet.');
    } finally {
      setFetchingSheet(false);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    try {
      setImporting(true);
      setError(null);
      const res = await bulkCreateProductsApi(parsedRows);
      const createdCount = res.created_count || parsedRows.length;
      onImportSuccess(createdCount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import products.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Bulk Import Products</h3>
              <p className="text-[11px] text-slate-500 font-medium">Import multiple SKUs via CSV, Excel, or Google Sheets</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab Selector & Template Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-slate-600 font-bold">
              <button
                type="button"
                onClick={() => setImportTab('file')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-brand" />
                <span>CSV / Excel File</span>
              </button>

              <button
                type="button"
                onClick={() => setImportTab('google_sheet')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'google_sheet' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheets Link</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              <span>Download Sample (.csv)</span>
            </button>
          </div>

          {/* File Upload Tab */}
          {importTab === 'file' && (
            <div className="border-2 border-dashed border-slate-200 hover:border-brand/40 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 relative">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-extrabold text-slate-800 text-xs mb-1">Click to select or drag &amp; drop file</p>
              <p className="text-[11px] text-slate-400">Supports .csv files</p>
              <input
                type="file"
                accept=".csv, .txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}

          {/* Google Sheets Tab */}
          {importTab === 'google_sheet' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Instructions:</strong> Share Google Sheet as <em>&quot;Anyone with the link can view&quot;</em>, then paste the full link below.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <button
                  type="button"
                  disabled={fetchingSheet || !googleSheetUrl.trim()}
                  onClick={handleFetchGoogleSheet}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {fetchingSheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Fetch Sheet</span>
                </button>
              </div>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready to Import: {parsedRows.length} Products
                </span>
                <button type="button" onClick={() => setParsedRows([])} className="text-slate-400 hover:text-slate-600 font-normal underline cursor-pointer">
                  Clear
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold sticky top-0">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Selling</th>
                      <th className="p-2">Cost</th>
                      <th className="p-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {parsedRows.slice(0, 15).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{row.name}</td>
                        <td className="p-2 font-mono text-[10px]">{row.sku}</td>
                        <td className="p-2">{row.category_name}</td>
                        <td className="p-2 font-mono font-bold">${parseFloat(row.selling_price).toFixed(2)}</td>
                        <td className="p-2 font-mono">${parseFloat(row.cost_price).toFixed(2)}</td>
                        <td className="p-2 font-mono font-bold text-emerald-700">{row.initial_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 15 && (
                <p className="text-[10px] text-slate-400 text-center font-medium">
                  Showing first 15 of {parsedRows.length} items. All items will be imported.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || importing}
            onClick={handleExecuteImport}
            className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand/20 flex items-center gap-1.5 cursor-pointer"
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{importing ? 'Importing Products...' : `Confirm & Import ${parsedRows.length} Products`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
