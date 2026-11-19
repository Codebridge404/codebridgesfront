/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  UploadCloud,
  Link,
  Download,
  HelpCircle,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importTab: 'file' | 'google_sheet';
  setImportTab: (val: 'file' | 'google_sheet') => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (val: string) => void;
  fetchingSheet: boolean;
  parsedRows: any[];
  importing: boolean;
  onDownloadTemplate: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFetchGoogleSheet: () => void;
  onExecuteImport: () => void;
}

export function ProductImportModal({
  isOpen,
  onClose,
  importTab,
  setImportTab,
  googleSheetUrl,
  setGoogleSheetUrl,
  fetchingSheet,
  parsedRows,
  importing,
  onDownloadTemplate,
  onFileUpload,
  onFetchGoogleSheet,
  onExecuteImport,
}: ProductImportModalProps) {
  if (!isOpen) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Import Products (Excel &amp; Google Sheets)</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Tab Selector & Download Template */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 text-slate-600 font-semibold">
              <button
                type="button"
                onClick={() => setImportTab('file')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-brand" />
                Excel / CSV File
              </button>

              <button
                type="button"
                onClick={() => setImportTab('google_sheet')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'google_sheet' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-emerald-600" />
                Google Sheets Link
              </button>
            </div>

            <button
              type="button"
              onClick={onDownloadTemplate}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              Download Template (.csv)
            </button>
          </div>

          {/* File Upload */}
          {importTab === 'file' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-200 hover:border-brand/40 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 relative">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-xs mb-1">Click to upload or drag &amp; drop file</p>
                <p className="text-[11px] text-slate-400">Supports .csv, .xlsx, .xls</p>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, .txt"
                  onChange={onFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Google Sheets URL */}
          {importTab === 'google_sheet' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Google Sheets Instructions:</p>
                  <p className="text-[11px] leading-relaxed">
                    1. Ensure headers include: name, sku, selling_price, initial_stock.<br />
                    2. Share sheet publicly as &quot;Anyone with the link can view&quot;.<br />
                    3. Paste sheet link below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={fetchingSheet || !googleSheetUrl}
                  onClick={onFetchGoogleSheet}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${fetchingSheet ? 'animate-spin' : ''}`} />
                  <span>Fetch Data</span>
                </button>
              </div>
            </div>
          )}

          {/* Data Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Parsed Preview ({parsedRows.length} items found)</span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-500 uppercase text-[9px] sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Price ($)</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Initial Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{r.name || '—'}</td>
                        <td className="p-2 font-mono">{r.sku || '—'}</td>
                        <td className="p-2 font-mono">${parseFloat(r.selling_price || r.price || 0).toFixed(2)}</td>
                        <td className="p-2">{r.category_name || r.category || 'General'}</td>
                        <td className="p-2 font-mono">{r.initial_stock || r.stock || 100}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            {parsedRows.length > 0 ? `${parsedRows.length} items ready to import` : 'No data loaded yet'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={importing || parsedRows.length === 0}
              onClick={onExecuteImport}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold shadow-md shadow-brand/20 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
              <span>Confirm &amp; Import</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div></Portal>
  );
}
