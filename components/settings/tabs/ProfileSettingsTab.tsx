'use client';

import React from 'react';
import {
  Building2,
  Save,
  Check,
  Upload,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

interface ProfileSettingsTabProps {
  formData: {
    name: string;
    legal_name: string;
    tax_id: string;
    currency: string;
    timezone: string;
    phone: string;
    email: string;
    address: string;
    country: string;
    logo_url: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
  setLogoFile: (file: File | null) => void;
  useUrlInput: boolean;
  setUseUrlInput: (useUrl: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  saving: boolean;
  saved: boolean;
  errorMessage: string | null;
  onSave: (e: React.FormEvent) => void;
}

export function ProfileSettingsTab({
  formData,
  setFormData,
  logoPreview,
  setLogoPreview,
  setLogoFile,
  useUrlInput,
  setUseUrlInput,
  fileInputRef,
  saving,
  saved,
  errorMessage,
  onSave,
}: ProfileSettingsTabProps) {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev: any) => ({ ...prev, logo_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev: any) => ({ ...prev, logo_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Organization Branding Section */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Workspace Branding &amp; Visual Identity</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            This logo will appear on POS terminals, customer displays, and printed receipts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand/40 shadow-xs">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Organization Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Building2 className="w-8 h-8 stroke-[1.5]" />
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">No Logo</span>
                </div>
              )}
            </div>

            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-sm transition-transform active:scale-95"
                title="Remove logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseUrlInput(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !useUrlInput
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                Upload File
              </button>

              <button
                type="button"
                onClick={() => setUseUrlInput(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  useUrlInput
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 inline mr-1.5" />
                Image URL
              </button>
            </div>

            {!useUrlInput ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Choose Logo File (PNG, JPG, SVG, WebP up to 5MB)</span>
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, logo_url: val });
                    setLogoPreview(val || null);
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Business Information */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            <span>General Business Information</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Official corporate registration &amp; brand details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Display / Store Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Official Legal / Entity Name</label>
            <input
              type="text"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              placeholder="e.g. CodeBridges Co., Ltd."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Official Contact Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Official Support Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+855 12 345 678"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Physical Business Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Building, Street, Sangkat, Khan, Phnom Penh, Cambodia"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Workspace Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
