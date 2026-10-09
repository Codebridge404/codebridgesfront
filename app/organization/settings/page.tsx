'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Save,
  Check,
  Globe,
  Upload,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  getAuthUser,
  getTenantProfileApi,
  updateTenantProfileApi,
} from '@/lib/api';
import { cardStyles, buttonStyles } from '@/lib/theme';

export default function OrganizationSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    tax_id: '',
    currency: 'USD',
    timezone: 'Asia/Bangkok',
    phone: '',
    email: '',
    address: '',
    country: 'KH',
    logo_url: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDynamicSettings() {
      try {
        const authUser = getAuthUser();
        const fallbackOrgName =
          (typeof window !== 'undefined'
            ? localStorage.getItem('active_org') || localStorage.getItem('cb_active_org_name')
            : '') ||
          authUser?.tenant_name ||
          authUser?.company_name ||
          '';

        const storedLogo =
          (typeof window !== 'undefined' ? localStorage.getItem('cb_active_org_logo') : null) ||
          authUser?.tenant_logo_url ||
          authUser?.logo_url ||
          null;

        setFormData((prev) => ({
          ...prev,
          name: fallbackOrgName,
          legal_name: fallbackOrgName,
          email: authUser?.email || '',
          logo_url: storedLogo || '',
        }));

        if (storedLogo) {
          setLogoPreview(storedLogo);
        }

        // Fetch live workspace details from backend
        try {
          const profileRes = await getTenantProfileApi();
          if (profileRes?.success && profileRes.data) {
            const data = profileRes.data;
            setFormData((prev) => ({
              ...prev,
              name: data.name || prev.name,
              legal_name: data.legal_name || prev.legal_name || data.name || '',
              logo_url: data.logo_url || prev.logo_url || '',
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              country: data.country || prev.country,
              currency: data.currency || prev.currency,
            }));

            if (data.logo_url) {
              setLogoPreview(data.logo_url);
              if (typeof window !== 'undefined') {
                localStorage.setItem('cb_active_org_logo', data.logo_url);
              }
            }
            if (data.name && typeof window !== 'undefined') {
              localStorage.setItem('active_org', data.name);
            }
          }
        } catch (profileErr) {
          console.warn('[Settings] Failed to fetch tenant cloud profile:', profileErr);
        }
      } catch (err) {
        console.warn('[Settings] Load dynamic settings error:', err);
      }
    }

    loadDynamicSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image size exceeds 10MB limit. Please choose a smaller file.');
        return;
      }
      setErrorMessage(null);
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, logo_url: url }));
    setLogoFile(null);
    setLogoPreview(url || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      let updatedLogoUrl = formData.logo_url;

      // 1. Submit Profile to Backend API
      if (logoFile) {
        const payloadData = new FormData();
        payloadData.append('name', formData.name);
        if (formData.legal_name) payloadData.append('legal_name', formData.legal_name);
        if (formData.phone) payloadData.append('phone', formData.phone);
        if (formData.email) payloadData.append('email', formData.email);
        if (formData.address) payloadData.append('address', formData.address);
        if (formData.country) payloadData.append('country', formData.country);
        if (formData.currency) payloadData.append('currency', formData.currency);
        payloadData.append('logo', logoFile);

        const res = await updateTenantProfileApi(payloadData);
        if (res?.data?.logo_url) {
          updatedLogoUrl = res.data.logo_url;
          setLogoPreview(updatedLogoUrl);
          setFormData((prev) => ({ ...prev, logo_url: updatedLogoUrl }));
          setLogoFile(null);
        }
      } else {
        const payloadData: Record<string, any> = {
          name: formData.name,
          legal_name: formData.legal_name,
          logo_url: formData.logo_url,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          country: formData.country,
          currency: formData.currency,
        };

        const res = await updateTenantProfileApi(payloadData);
        if (res?.data?.logo_url !== undefined) {
          updatedLogoUrl = res.data.logo_url || '';
          setLogoPreview(updatedLogoUrl || null);
          setFormData((prev) => ({ ...prev, logo_url: updatedLogoUrl }));
        }
      }

      // 2. Sync Local Storage & Notify All Global UI Components
      if (typeof window !== 'undefined' && formData.name) {
        localStorage.setItem('active_org', formData.name);
        if (updatedLogoUrl) {
          localStorage.setItem('cb_active_org_logo', updatedLogoUrl);
        } else {
          localStorage.removeItem('cb_active_org_logo');
        }

        window.dispatchEvent(
          new CustomEvent('cb_org_changed', {
            detail: { orgName: formData.name, logoUrl: updatedLogoUrl },
          })
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('[Settings] Error saving dynamic parameters:', err);
      setErrorMessage(err?.message || 'Failed to save organization profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans pb-16 max-w-5xl">
      {/* Page Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Organization Identity &amp; Governance
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Customize your organization brand logo, legal entity name, corporate contact info, and regional fiscal standards.
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Workspace profile and custom logo branding updated across the platform!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Brand Identity & Logo Card */}
        <div className={`${cardStyles.base} p-6 sm:p-7 space-y-6`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-black text-slate-900">Brand Identity &amp; Logo</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-subtle text-brand uppercase tracking-wider">
              Live Global Header Sync
            </span>
          </div>

          {/* Logo Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Upload and Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization Workspace Logo
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  This logo appears in your header bar, mobile drawer, PDF reports, and exported documents.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload Box / Drag Target */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-brand rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-brand-subtle/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-500 group-hover:text-brand group-hover:border-brand/40 group-hover:scale-105 transition-all mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-brand">
                    Click to upload new logo image
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    PNG, SVG, WEBP, or JPG (max 10MB). Square transparent PNG recommended.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setUseUrlInput(!useUrlInput)}
                    className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{useUrlInput ? 'Hide image URL input' : 'Or paste direct image URL'}</span>
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>

                {useUrlInput && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Direct Image Asset URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-domain.com/assets/logo.png"
                      value={formData.logo_url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Preview Panel */}
            <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Live Brand Preview
              </span>

              {/* Preview in Mock Header */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600">Header Display Preview:</span>
                <div className="h-14 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <img src="/logo/Codebridge.png" alt="CodeBridges" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 truncate max-w-[150px]">
                      {formData.name || 'Your Brand Name'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      Workspace Operations Hub
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Legal Entity & Organization Profile Card */}
        <div className={`${cardStyles.base} p-6 sm:p-7 space-y-5`}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-black text-slate-900">Legal Entity &amp; Operating Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Display Organization Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dreams Retail Co., Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Registered Legal Entity Name
              </label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                placeholder="Official registered company name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Billing / Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="finance@yourcompany.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+855 12 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Operating Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="#123 Street 2004, Phnom Penh, Cambodia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax ID / VAT Registration Number</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="K001-9021034"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Regional & Fiscal Standards Card */}
        <div className={`${cardStyles.base} p-6 sm:p-7 space-y-5`}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-black text-slate-900">Regional &amp; Fiscal Standards</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Base Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold cursor-pointer"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="KHR">KHR (៛) - Cambodian Riel</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="SGD">SGD ($) - Singapore Dollar</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Workspace Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold cursor-pointer"
              >
                <option value="Asia/Bangkok">Indochina Time (Phnom Penh, Bangkok) - UTC+7</option>
                <option value="Asia/Singapore">Singapore Time - UTC+8</option>
                <option value="America/New_York">Eastern Time (US) - UTC-5</option>
                <option value="Europe/London">London (GMT) - UTC+0</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Changes apply in real time across the entire organization.
          </p>
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} flex items-center gap-2`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Workspace Parameters'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
