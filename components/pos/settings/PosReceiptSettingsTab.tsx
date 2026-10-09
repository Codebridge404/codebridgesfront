'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, FileText, Check, Printer } from 'lucide-react';
import { cardStyles } from '@/lib/theme';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLogo = localStorage.getItem('cb_active_org_logo');
      if (storedLogo) setLogoPreview(storedLogo);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      {/* Left: Receipt Fields */}
      <div className={`lg:col-span-7 ${cardStyles.base} p-6 sm:p-7 space-y-5`}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Receipt className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-black text-slate-900">Thermal Receipt Paper Settings</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Receipt Header Subtitle / Slogan
            </label>
            <input
              type="text"
              value={settings.receiptHeader || ''}
              onChange={(e) => onChange('receiptHeader', e.target.value)}
              placeholder="e.g. Welcome to Angkor Fresh Mart - Healthy Living Starts Here"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Appears directly below the organization/outlet name on every customer receipt slip.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Receipt Footer Note / Return Policy
            </label>
            <textarea
              rows={3}
              value={settings.receiptFooter || ''}
              onChange={(e) => onChange('receiptFooter', e.target.value)}
              placeholder="e.g. Thank you for your purchase! Goods sold are exchangeable within 7 days with valid receipt."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Appears at the very bottom of every customer receipt slip.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Receipt Paper Width</label>
              <select
                value={settings.paperWidth || '80mm'}
                onChange={(e) => onChange('paperWidth', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                <option value="80mm">80mm (Standard Countertop POS)</option>
                <option value="58mm">58mm (Compact Mobile Thermal)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPrintReceipt ?? true}
                  onChange={(e) => onChange('autoPrintReceipt', e.target.checked)}
                  className="rounded text-brand focus:ring-brand"
                />
                <span className="font-bold text-slate-700">Auto-Print on Checkout</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Thermal Receipt Full Live Preview Paper */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 block">
          Thermal 80mm Printed Preview
        </span>
        <div className="w-[280px] bg-white p-5 border border-slate-300 shadow-md rounded-xl font-mono text-[10px] leading-tight text-slate-900 select-none">
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
