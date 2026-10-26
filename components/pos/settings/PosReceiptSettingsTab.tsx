'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Receipt, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { updateOutletReceiptBrandingApi } from '@/lib/api';

interface PosReceiptSettingsTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
  storeName?: string;
}

export function PosReceiptSettingsTab({
  settings,
  onChange,
  storeName = 'Store Name',
}: PosReceiptSettingsTabProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings.receiptLogoUrl) {
      setLogoPreview(settings.receiptLogoUrl);
    } else if (typeof window !== 'undefined') {
      const storedLogo = localStorage.getItem('cb_active_org_logo');
      if (storedLogo) setLogoPreview(storedLogo);
    }
  }, [settings.receiptLogoUrl]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      onChange('receiptLogoUrl', base64);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_active_org_logo', base64);
      }
    };
    reader.readAsDataURL(file);

    // If outlet is selected, upload to backend branding endpoint
    if (settings.outletId) {
      try {
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('logo', file);
        if (settings.receiptHeader) formData.append('receipt_header', settings.receiptHeader);
        if (settings.receiptFooter) formData.append('receipt_footer', settings.receiptFooter);

        const res = await updateOutletReceiptBrandingApi(settings.outletId, formData);
        if (res?.data?.receipt_logo_url) {
          onChange('receiptLogoUrl', res.data.receipt_logo_url);
        }
      } catch (err) {
        console.warn('Could not sync receipt logo to backend:', err);
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    onChange('receiptLogoUrl', '');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cb_active_org_logo');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      {/* Left: Receipt Fields */}
      <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Thermal Receipt Paper Settings</h3>
            <p className="text-xs text-slate-500 font-medium">Customer slip branding, custom header slogan &amp; return policies</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thermal Receipt Logo (Monochrome / Grayscale)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="receipt-logo-upload"
              />
              <label
                htmlFor="receipt-logo-upload"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors border border-slate-300"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Receipt Logo'}</span>
              </label>

              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Recommended: High-contrast 1-bit or grayscale PNG logo for clear rendering on 80mm/58mm thermal printers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt Header Subtitle / Slogan
            </label>
            <input
              type="text"
              value={settings.receiptHeader || ''}
              onChange={(e) => onChange('receiptHeader', e.target.value)}
              placeholder="e.g. Welcome to Angkor Fresh Mart - Healthy Living Starts Here"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Appears directly below the organization/outlet name on every customer receipt slip.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt Footer Note / Return Policy
            </label>
            <textarea
              rows={3}
              value={settings.receiptFooter || ''}
              onChange={(e) => onChange('receiptFooter', e.target.value)}
              placeholder="e.g. Thank you for your purchase! Goods sold are exchangeable within 7 days with valid receipt."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Appears at the very bottom of every customer receipt slip.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Paper Width</label>
              <select
                value={settings.paperWidth || '80mm'}
                onChange={(e) => onChange('paperWidth', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
              >
                <option value="80mm" className="bg-white text-slate-900">80mm (Standard Countertop POS)</option>
                <option value="58mm" className="bg-white text-slate-900">58mm (Compact Mobile Thermal)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPrintReceipt ?? true}
                  onChange={(e) => onChange('autoPrintReceipt', e.target.checked)}
                  className="w-4 h-4 text-brand rounded focus:ring-brand"
                />
                <span className="text-xs font-bold text-slate-800">Auto-Print on Checkout</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Thermal Receipt Full Live Preview Paper */}
      <div className="lg:col-span-5 p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col items-center">
        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-3 block">
          Thermal 80mm Live Preview
        </span>
        <div className="w-[280px] bg-white p-5 border border-slate-300 shadow-md rounded-2xl font-mono text-[10px] leading-tight text-slate-900 select-none">
          {/* Original Badge */}
          <div className="text-center mb-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              *** ORIGINAL RECEIPT ***
            </span>
          </div>

          {/* Header branding */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            {logoPreview && (
              <div className="flex justify-center mb-1">
                <img
                  src={logoPreview}
                  alt="Store Logo"
                  className="max-h-10 max-w-[130px] object-contain grayscale contrast-125"
                />
              </div>
            )}
            <h2 className="font-extrabold text-xs uppercase tracking-tight text-slate-900">
              {settings.outletName || storeName || 'Main Store'}
            </h2>
            <p className="text-[9px] text-slate-600 leading-snug">
              Phnom Penh, Cambodia
            </p>
            <p className="text-[9px] text-slate-600">Tel: +855 23 888 999</p>
            {settings.receiptHeader && (
              <p className="text-[9px] italic text-slate-500 pt-1 border-t border-slate-100 mt-1">
                {settings.receiptHeader}
              </p>
            )}
          </div>

          {/* Simulated Order Items */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[9px]">
            <div className="flex justify-between font-bold border-b border-slate-100 pb-1 mb-1">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>TOTAL</span>
            </div>
            <div className="flex justify-between">
              <span className="truncate max-w-[120px]">Organic Avocado</span>
              <span>2 x $1.50</span>
              <span className="font-bold">$3.00</span>
            </div>
            <div className="flex justify-between">
              <span className="truncate max-w-[120px]">Fresh Coconut Water</span>
              <span>1 x $2.00</span>
              <span className="font-bold">$2.00</span>
            </div>
          </div>

          {/* Total */}
          <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[9px]">
            <div className="flex justify-between font-extrabold text-xs">
              <span>GRAND TOTAL:</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Payment Method:</span>
              <span className="font-bold">Bakong KHQR</span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="pt-3 text-center space-y-1.5">
            <p className="text-[9px] text-slate-600 italic leading-snug">
              {settings.receiptFooter || 'Thank you for your visit! Please come again.'}
            </p>
            <div className="pt-1 flex flex-col items-center justify-center gap-0.5">
              <div className="w-40 h-6 bg-slate-900 flex items-center justify-between px-2 text-white font-mono text-[8px] tracking-widest rounded-xs">
                <span>|||||||||||||||||||||||||||||||</span>
              </div>
              <span className="text-[8px] text-slate-400 font-mono">REC-2026-0001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
