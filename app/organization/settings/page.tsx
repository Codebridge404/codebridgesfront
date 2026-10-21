'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  QrCode,
  Store,
  Wallet,
  Loader2,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Sliders,
  Settings,
} from 'lucide-react';
import {
  getAuthUser,
  getTenantProfileApi,
  updateTenantProfileApi,
  createBankAccountApi,
} from '@/lib/api';
import { buttonStyles } from '@/lib/theme';
import { IntegrationsSettingsTab } from '@/components/settings';

type SettingsTab = 'profile' | 'regional' | 'payments' | 'sms';

function OrganizationSettingsContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (tabParam && ['profile', 'regional', 'payments', 'sms'].includes(tabParam)) {
      return tabParam;
    }
    return 'profile';
  });

  useEffect(() => {
    const currentTab = searchParams.get('tab') as SettingsTab | null;
    if (currentTab && ['profile', 'regional', 'payments', 'sms'].includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const switchTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Profile Form Data
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

  // Dynamic Payment & KHQR Configuration State
  const [bakongMerchantId, setBakongMerchantId] = useState('');
  const [bakongBankName, setBakongBankName] = useState('');
  const [bakongSecret, setBakongSecret] = useState('');
  const [smsGatewayProvider, setSmsGatewayProvider] = useState('plasgate');
  const [smsApiKey, setSmsApiKey] = useState('');

  const [paymentSaved, setPaymentSaved] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

        // Check local storage for initial payment values and regional preferences
        if (typeof window !== 'undefined') {
          const localMerchant = localStorage.getItem('cb_bakong_merchant_id') || '';
          const localBank = localStorage.getItem('cb_bakong_bank_name') || '';
          const localSecret = localStorage.getItem('cb_bakong_secret') || '';
          const localTax = localStorage.getItem('cb_org_tax_id') || '';
          const localTz = localStorage.getItem('cb_org_timezone') || '';
          if (localMerchant) setBakongMerchantId(localMerchant);
          if (localBank) setBakongBankName(localBank);
          if (localSecret) setBakongSecret(localSecret);
          if (localTax) setFormData((prev) => ({ ...prev, tax_id: localTax }));
          if (localTz) setFormData((prev) => ({ ...prev, timezone: localTz }));
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

            // Sync payment credentials from backend JSON column
            if (data.payment_settings) {
              const pay =
                typeof data.payment_settings === 'string'
                  ? JSON.parse(data.payment_settings)
                  : data.payment_settings;

              if (pay.bakong_merchant_id !== undefined) {
                setBakongMerchantId(pay.bakong_merchant_id);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cb_bakong_merchant_id', pay.bakong_merchant_id);
                }
              }
              if (pay.bakong_bank_name !== undefined) {
                setBakongBankName(pay.bakong_bank_name);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cb_bakong_bank_name', pay.bakong_bank_name);
                }
              }
              if (pay.bakong_secret !== undefined) {
                setBakongSecret(pay.bakong_secret);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cb_bakong_secret', pay.bakong_secret);
                }
              }
              if (pay.sms_gateway_provider) setSmsGatewayProvider(pay.sms_gateway_provider);
              if (pay.sms_api_key) setSmsApiKey(pay.sms_api_key);
              if (pay.tax_id) {
                setFormData((prev) => ({ ...prev, tax_id: pay.tax_id }));
                if (typeof window !== 'undefined') localStorage.setItem('cb_org_tax_id', pay.tax_id);
              }
              if (pay.timezone) {
                setFormData((prev) => ({ ...prev, timezone: pay.timezone }));
                if (typeof window !== 'undefined') localStorage.setItem('cb_org_timezone', pay.timezone);
              }
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

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      let updatedLogoUrl = formData.logo_url;

      const paymentPayload = {
        bakong_merchant_id: bakongMerchantId,
        bakong_bank_name: bakongBankName,
        bakong_secret: bakongSecret,
        sms_gateway_provider: smsGatewayProvider,
        sms_api_key: smsApiKey,
        tax_id: formData.tax_id,
        timezone: formData.timezone,
      };

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
        payloadData.append('payment_settings', JSON.stringify(paymentPayload));
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
          payment_settings: paymentPayload,
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

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaving(true);
    setPaymentError(null);

    try {
      const paymentPayload = {
        bakong_merchant_id: bakongMerchantId,
        bakong_bank_name: bakongBankName,
        bakong_secret: bakongSecret,
        sms_gateway_provider: smsGatewayProvider,
        sms_api_key: smsApiKey,
        tax_id: formData.tax_id,
        timezone: formData.timezone,
      };

      // 1. Persist to Backend Tenant Record
      await updateTenantProfileApi({
        name: formData.name,
        payment_settings: paymentPayload,
      });

      // 2. Sync to Local Storage for Instant POS Checkout Pickup
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_bakong_merchant_id', bakongMerchantId);
        localStorage.setItem('cb_bakong_bank_name', bakongBankName);
        localStorage.setItem('cb_bakong_secret', bakongSecret);

        // Notify active POS terminals and modals
        window.dispatchEvent(
          new CustomEvent('cb_bakong_changed', {
            detail: { merchantId: bakongMerchantId, bankName: bakongBankName },
          })
        );
      }

      // 3. Sync Acquiring Bank Account to Operations Service if populated
      if (bakongMerchantId && bakongBankName) {
        try {
          await createBankAccountApi({
            bank_name: bakongBankName,
            account_name: formData.name || 'Organization Primary Merchant Account',
            account_number: bakongMerchantId,
            currency: formData.currency || 'USD',
            status: 'connected',
          });
        } catch (bankErr) {
          console.warn('[Settings] Sync bank account err:', bankErr);
        }
      }

      setPaymentSaved(true);
      setTimeout(() => setPaymentSaved(false), 4000);
    } catch (err: any) {
      console.error('[Settings] Error saving payment parameters:', err);
      setPaymentError(err?.message || 'Failed to save payment configuration. Please try again.');
    } finally {
      setPaymentSaving(false);
    }
  };

  return (
    <div className="w-full font-sans pb-16 space-y-6">
      {/* Page Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Settings className="w-4 h-4" />
            <span>Organization Workspace Settings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Governance &amp; Integrations
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Centrally manage brand identity, regional fiscal standards, NBC Bakong KHQR payment gateway, and SMS communications.
          </p>
        </div>
      </div>

      {/* Two-Column Transparent Layout: Left Settings Sub-Sidebar + Right Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* ========================================================= */}
        {/* SETTINGS SUB-SIDEBAR (Secondary Navigation Column)       */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-72 shrink-0 bg-transparent rounded-3xl border border-slate-300/80 p-3.5 shadow-2xs space-y-4 lg:sticky lg:top-4 select-none">
          {/* Sub-sidebar Brand Context */}
          <div className="px-3 pt-2 pb-1 border-b border-slate-300/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-brand" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Settings Menu
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-brand-subtle text-brand px-1.5 py-0.5 rounded uppercase">
              Global
            </span>
          </div>

          {/* Group 1: Workspace & Identity */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Workspace &amp; Identity
            </span>

            <button
              type="button"
              onClick={() => switchTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
                <span>Profile &amp; Brand Logo</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-white/80' : 'text-slate-300'}`} />
            </button>

            <button
              type="button"
              onClick={() => switchTab('regional')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'regional'
                  ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className={`w-4 h-4 shrink-0 ${activeTab === 'regional' ? 'text-white' : 'text-slate-400'}`} />
                <span>Regional &amp; Fiscal</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'regional' ? 'text-white/80' : 'text-slate-300'}`} />
            </button>
          </div>

          {/* Group 2: Financial & Gateways */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Financial Gateways
            </span>

            <button
              type="button"
              onClick={() => switchTab('payments')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <QrCode className={`w-4 h-4 shrink-0 ${activeTab === 'payments' ? 'text-white' : 'text-brand'}`} />
                <span>Payment Gateways &amp; KHQR</span>
              </div>
              {bakongMerchantId ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected" />
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'payments' ? 'text-white/80' : 'text-slate-300'}`} />
              )}
            </button>

            <button
              type="button"
              onClick={() => switchTab('sms')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'sms'
                  ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className={`w-4 h-4 shrink-0 ${activeTab === 'sms' ? 'text-white' : 'text-slate-400'}`} />
                <span>SMS &amp; Communications</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'sms' ? 'text-white/80' : 'text-slate-300'}`} />
            </button>
          </div>

          {/* Group 3: Subscribed Systems Links */}
          <div className="space-y-1 border-t border-slate-300/80 pt-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Hardware Terminals
            </span>

            <Link
              href="/pos/settings"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-slate-400 group-hover:text-brand" />
                <span>Store &amp; POS Hardware</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-70 group-hover:opacity-100" />
            </Link>
          </div>

          {/* Quick Workspace Info Footer Card */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-300/80">
            <div className="p-3 rounded-2xl bg-transparent border border-slate-300/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Tenant</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="font-black text-slate-800 text-xs truncate">
                {formData.name || 'Organization'}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Base Currency:</span>
                <span className="font-bold text-slate-700">{formData.currency}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN SETTINGS PANEL CONTENT (Transparent Architecture)     */}
        {/* ========================================================= */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Feedback Alerts for Profile */}
          {saved && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Workspace profile parameters updated across the platform!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Feedback Alerts for Payment Settings */}
          {paymentSaved && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Organization payment credentials, acquiring settlement bank &amp; Bakong KHQR updated successfully!</span>
            </div>
          )}

          {paymentError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* SUB-TAB 1: WORKSPACE PROFILE & BRAND LOGO */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile} className="space-y-6 animate-in fade-in duration-200">
              {/* 1. Brand Identity & Logo Card */}
              <div className="bg-transparent rounded-3xl border border-slate-300/80 p-6 sm:p-7 space-y-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <h3 className="text-sm font-black text-slate-900">Brand Identity &amp; Logo</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-subtle text-brand uppercase tracking-wider">
                    Live Global Header Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Organization Workspace Logo
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3">
                        This logo appears in your header bar, mobile drawer, PDF reports, and customer receipt printouts.
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300/80 hover:border-brand rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-transparent hover:bg-brand-subtle/15 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-transparent border border-slate-300/80 shadow-2xs flex items-center justify-center text-slate-500 group-hover:text-brand group-hover:border-brand/40 group-hover:scale-105 transition-all mb-3">
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
                            className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-transparent rounded-2xl p-5 border border-slate-300/80 space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Live Brand Preview
                    </span>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600">Header Display Preview:</span>
                      <div className="h-14 px-4 bg-transparent border border-slate-300/80 rounded-xl flex items-center gap-3 shadow-2xs">
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

              {/* 2. Legal Entity & Operating Profile Card */}
              <div className="bg-transparent rounded-3xl border border-slate-300/80 p-6 sm:p-7 space-y-5 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-300/80 pb-2">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Billing / Official Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="finance@yourcompany.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+855 12 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Operating Street Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="#123 Street 2004, Phnom Penh, Cambodia"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button Bar */}
              <div className="pt-4 border-t border-slate-300/80 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Changes apply in real time across the entire organization.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className={`${buttonStyles.primary} flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Parameters'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 2: REGIONAL & FISCAL STANDARDS */}
          {activeTab === 'regional' && (
            <form onSubmit={handleSubmitProfile} className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-transparent rounded-3xl border border-slate-300/80 p-6 sm:p-7 space-y-5 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-300/80 pb-2">
                  <Globe className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-black text-slate-900">Regional &amp; Fiscal Standards</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Base Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold cursor-pointer transition-all"
                    >
                      <option value="USD" className="bg-white text-slate-900">USD ($) - US Dollar</option>
                      <option value="KHR" className="bg-white text-slate-900">KHR (៛) - Cambodian Riel</option>
                      <option value="EUR" className="bg-white text-slate-900">EUR (€) - Euro</option>
                      <option value="SGD" className="bg-white text-slate-900">SGD ($) - Singapore Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Workspace Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold cursor-pointer transition-all"
                    >
                      <option value="Asia/Bangkok" className="bg-white text-slate-900">Indochina Time (Phnom Penh, Bangkok) - UTC+7</option>
                      <option value="Asia/Singapore" className="bg-white text-slate-900">Singapore Time - UTC+8</option>
                      <option value="America/New_York" className="bg-white text-slate-900">Eastern Time (US) - UTC-5</option>
                      <option value="Europe/London" className="bg-white text-slate-900">London (GMT) - UTC+0</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Tax ID / VAT Registration Number</label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      placeholder="K001-9021034"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-300/80 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Fiscal currencies format all POS, invoicing, and inventory totals.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className={`${buttonStyles.primary} flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Regional Standards'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 3: PAYMENT GATEWAYS & KHQR */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSavePayments} className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="bg-transparent rounded-3xl border border-slate-300/80 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-transparent border border-brand/30 flex items-center justify-center text-brand shadow-2xs">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Centralized Organization Payment Gateway
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Credentials configured here automatically process payments across all POS registers, kiosks, and customer-facing displays.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Global Outlet Sync</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings Fields Card */}
              <div className="bg-transparent rounded-3xl border border-slate-300/80 p-6 sm:p-7 space-y-6 shadow-2xs">
                <IntegrationsSettingsTab
                  bakongMerchantId={bakongMerchantId}
                  setBakongMerchantId={setBakongMerchantId}
                  bakongBankName={bakongBankName}
                  setBakongBankName={setBakongBankName}
                  bakongSecret={bakongSecret}
                  setBakongSecret={setBakongSecret}
                  title="National Bank of Cambodia (NBC) Bakong KHQR Gateway"
                  description="Connect your organization Bakong Account ID or Merchant ID to collect instant interbank payments directly into your settlement account during POS customer checkout."
                  merchantIdLabel="Organization Bakong Account ID / Merchant ID"
                  merchantIdPlaceholder="e.g. yourname@aba or 012345678@aba"
                  secretKeyLabel="Bakong Open API Developer Token (Optional for Real-time Hash Verification)"
                  secretKeyPlaceholder="Paste your Bakong bearer JWT token or developer secret"
                  showSmsGateway={false}
                />
              </div>

              <div className="pt-4 border-t border-slate-300/80 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Credentials are securely stored in your tenant cloud vault.
                </p>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className={`${buttonStyles.primary} flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  <span>{paymentSaving ? 'Saving Credentials...' : 'Save Payment Configuration'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 4: SMS & COMMUNICATIONS */}
          {activeTab === 'sms' && (
            <form onSubmit={handleSavePayments} className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-transparent rounded-3xl border border-slate-300/80 p-6 sm:p-7 space-y-6 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-300/80 pb-2">
                  <Smartphone className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-black text-slate-900">SMS OTP &amp; Notifications Gateway</h3>
                </div>

                <div className="p-4 rounded-2xl bg-transparent border border-brand/30 flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-brand">SMS Messaging &amp; Staff 2FA Route</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Used for sending instant SMS order receipts to customers, shift supervisor alerts, and two-factor authentication tokens.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SMS Gateway Provider
                    </label>
                    <select
                      value={smsGatewayProvider}
                      onChange={(e) => setSmsGatewayProvider(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    >
                      <option value="plasgate" className="bg-white text-slate-900">Plasgate (Cambodia Direct Route)</option>
                      <option value="twilio" className="bg-white text-slate-900">Twilio Global SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Master SMS API Token
                    </label>
                    <input
                      type="password"
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                      placeholder="Paste your Plasgate or Twilio secret API key"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-300/80 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  SMS routing keys are encrypted at rest.
                </p>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className={`${buttonStyles.primary} flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  <span>{paymentSaving ? 'Saving SMS Gateway...' : 'Save SMS Configuration'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-6 font-sans">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading Organization Settings...</span>
          </div>
        </div>
      }
    >
      <OrganizationSettingsContent />
    </Suspense>
  );
}
