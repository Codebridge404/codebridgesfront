'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Settings, Loader2 } from 'lucide-react';
import {
  getAuthUser,
  getTenantProfileApi,
  updateTenantProfileApi,
} from '@/lib/api';
import {
  SettingsSubSidebar,
  SettingsTab,
  ProfileSettingsTab,
  RegionalSettingsTab,
  PaymentsSettingsTab,
  HardwareSettingsTab,
  ReceiptsSettingsTab,
  TerminalsSettingsTab,
  InventorySettingsTab,
  FinanceSettingsTab,
  HrmSettingsTab,
  SmsSettingsTab,
  TelegramSettingsTab,
} from '@/components/settings';

const VALID_TABS: SettingsTab[] = [
  'profile',
  'regional',
  'payments',
  'hardware',
  'receipts',
  'terminals',
  'inventory',
  'finance',
  'hrm',
  'sms',
  'telegram',
];

function UnifiedSettingsContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
    return 'profile';
  });

  useEffect(() => {
    const currentTab = searchParams.get('tab') as SettingsTab | null;
    if (currentTab && VALID_TABS.includes(currentTab)) {
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
    timezone: 'Asia/Phnom_Penh',
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

        // Check local storage for initial tax and timezone
        if (typeof window !== 'undefined') {
          const localTax = localStorage.getItem('cb_org_tax_id') || '';
          const localTz = localStorage.getItem('cb_org_timezone') || '';
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

            // Sync payment and regional credentials from backend JSON column
            if (data.payment_settings) {
              const pay =
                typeof data.payment_settings === 'string'
                  ? JSON.parse(data.payment_settings)
                  : data.payment_settings;

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

  const handleSubmitProfile = async (e: React.FormEvent) => {
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

  const handleSaveRegional = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const paymentPayload = {
        tax_id: formData.tax_id,
        timezone: formData.timezone,
      };

      await updateTenantProfileApi({
        currency: formData.currency,
        country: formData.country,
        payment_settings: paymentPayload,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_org_tax_id', formData.tax_id);
        localStorage.setItem('cb_org_timezone', formData.timezone);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update regional configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full font-sans pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Settings className="w-4 h-4" />
            <span>Central SaaS Settings Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System &amp; Workspace Settings</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage organization branding, regional localization, payment gateways, POS hardware, and module policies
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout: Sub-Sidebar + Active Tab Content */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        <SettingsSubSidebar activeTab={activeTab} onTabChange={switchTab} />

        <main className="flex-1 w-full min-w-0">
          {activeTab === 'profile' && (
            <ProfileSettingsTab
              formData={formData}
              setFormData={setFormData}
              logoPreview={logoPreview}
              setLogoPreview={setLogoPreview}
              setLogoFile={setLogoFile}
              useUrlInput={useUrlInput}
              setUseUrlInput={setUseUrlInput}
              fileInputRef={fileInputRef}
              saving={saving}
              saved={saved}
              errorMessage={errorMessage}
              onSave={handleSubmitProfile}
            />
          )}

          {activeTab === 'regional' && (
            <RegionalSettingsTab
              formData={formData}
              setFormData={setFormData}
              saving={saving}
              saved={saved}
              onSave={handleSaveRegional}
            />
          )}

          {activeTab === 'payments' && <PaymentsSettingsTab />}

          {activeTab === 'hardware' && <HardwareSettingsTab />}

          {activeTab === 'receipts' && <ReceiptsSettingsTab />}

          {activeTab === 'terminals' && <TerminalsSettingsTab />}

          {activeTab === 'inventory' && <InventorySettingsTab />}

          {activeTab === 'finance' && <FinanceSettingsTab />}

          {activeTab === 'hrm' && <HrmSettingsTab />}

          {activeTab === 'sms' && <SmsSettingsTab />}

          {activeTab === 'telegram' && <TelegramSettingsTab />}
        </main>
      </div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading Unified Settings Hub...</span>
          </div>
        </div>
      }
    >
      <UnifiedSettingsContent />
    </Suspense>
  );
}
