'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Receipt, Upload, Trash2 } from 'lucide-react';
import { updateOutletReceiptBrandingApi } from '@/lib/api';
import { ThermalReceiptPaper } from '@/components/receipt/ThermalReceiptPaper';
import { formatReceiptNumber } from '@/lib/posReceiptUtils';

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Phone (Tel)
              </label>
              <input
                type="text"
                value={settings.outletPhone || ''}
                onChange={(e) => onChange('outletPhone', e.target.value)}
                placeholder="e.g. +855 12 345 678"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                value={settings.outletAddress || ''}
                onChange={(e) => onChange('outletAddress', e.target.value)}
                placeholder="e.g. #123 Street 2004, Phnom Penh"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt Starting Number
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={settings.receiptStartNumber ?? 0}
                onChange={(e) => onChange('receiptStartNumber', Math.max(0, parseInt(e.target.value || '0', 10) || 0))}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Sequence preview:{' '}
                <span className="font-mono font-bold text-slate-700">
                  {formatReceiptNumber(settings.receiptStartNumber ?? 0, settings.receiptDigits ?? 5)},{' '}
                  {formatReceiptNumber((settings.receiptStartNumber ?? 0) + 1, settings.receiptDigits ?? 5)}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt Number Digits
              </label>
              <select
                value={settings.receiptDigits ?? 5}
                onChange={(e) => onChange('receiptDigits', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
              >
                {[3, 4, 5, 6, 7, 8].map((d) => (
                  <option key={d} value={d} className="bg-white text-slate-900">
                    {d} Digits ({formatReceiptNumber(settings.receiptStartNumber ?? 0, d)})
                  </option>
                ))}
              </select>
            </div>
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
          Thermal {settings.paperWidth || '80mm'} Live Preview
        </span>
        <ThermalReceiptPaper
          sale={{
            receipt_number: formatReceiptNumber(
              settings.receiptStartNumber ?? 0,
              settings.receiptDigits ?? 5
            ),
            order_type: 'takeaway',
            customer_name: 'Walk-in Customer',
            subtotal: 5.0,
            discount_total: 0,
            tax_total: 0,
            grand_total: 5.0,
          }}
          lines={[
            {
              product_name: 'Organic Avocado Premium Hass',
              quantity: 2,
              unit_price: 1.5,
              subtotal: 3.0,
            },
            {
              product_name: 'Fresh Coconut Water',
              quantity: 1,
              unit_price: 2.0,
              subtotal: 2.0,
            },
          ]}
          outlet={{
            name: settings.outletName || storeName || 'Main Store',
            address: settings.outletAddress,
            phone: settings.outletPhone,
            receipt_header: settings.receiptHeader,
            receipt_footer: settings.receiptFooter,
            logo_url: logoPreview || settings.receiptLogoUrl || '',
            paper_width: settings.paperWidth || '80mm',
            vat_tin: settings.vat_tin || settings.vatTin,
            tax_label: settings.taxLabel,
          }}
          payments={[{ tender_type: 'khqr', amount: 5.0 }]}
          formattedDate="Nov 18, 2026, 12:00 PM"
          hide_badge
        />
      </div>
    </div>
  );
}
