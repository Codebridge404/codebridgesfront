/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 *
 * Central Dynamic Governance & Configuration Cockpit.
 * Eliminates static code constants across Tier Quotas, NBC Currency/FX,
 * Cash Rounding Rules, Platform VAT, Maintenance Mode, SMTP, and Alerting.
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Power,
  ShieldCheck,
} from 'lucide-react';
import {
  PlatformSettings,
  getPlatformSettings,
  savePlatformSettings,
  resetPlatformSettings,
} from '@/lib/platformSettings';
import { PlatformSettingsSubSidebar, PlatformSettingsTab } from './PlatformSettingsSubSidebar';
import { GeneralMaintenanceSettingsTab } from './GeneralMaintenanceSettingsTab';
import { CurrencyTaxSettingsTab } from './CurrencyTaxSettingsTab';
import { TierQuotasSettingsTab } from './TierQuotasSettingsTab';
import { IntegrationsSettingsTab } from './IntegrationsSettingsTab';
import { EmailSmtpSettingsTab } from './EmailSmtpSettingsTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';
import { AlertsWebhooksSettingsTab } from './AlertsWebhooksSettingsTab';
import { DataRetentionSettingsTab } from './DataRetentionSettingsTab';

const VALID_TABS: PlatformSettingsTab[] = [
  'general',
  'currency-tax',
  'tier-quotas',
  'integrations',
  'email-smtp',
  'policies',
  'alerts',
  'data-retention',
];

function SuperAdminPlatformSettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as PlatformSettingsTab | null;

  const [activeTab, setActiveTab] = useState<PlatformSettingsTab>(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) return tabParam;
    return 'general';
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => getPlatformSettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    // Sync settings on mount
    setSettings(getPlatformSettings());
  }, []);

  const switchTab = (tab: PlatformSettingsTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFieldChange = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated = await savePlatformSettings(settings);
      setSettings(updated);
      setSaved(true);
      showToast('Platform settings saved & synchronized successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      showToast('Error saving platform settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm('Are you sure you want to restore all platform settings to system factory defaults?')) {
      return;
    }
    const defaults = resetPlatformSettings();
    setSettings(defaults);
    showToast('Factory default settings restored.');
  };

  return (
    <div className="w-full font-sans pb-16 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Settings className="w-4 h-4" />
            <span>Platform Governance</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                settings.isMaintenanceMode
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-300'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-300'
              }`}
            >
              {settings.isMaintenanceMode ? (
                <>
                  <Power className="w-3 h-3 text-rose-600 animate-pulse" />
                  <span>Maintenance Mode Active</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Operations Live</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dynamic control over NBC currency pegs, cash rounding, tier quotas, master gateways, SMTP, and maintenance mode
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="self-start sm:self-center px-3.5 py-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Restore Factory Defaults</span>
        </button>
      </div>

      {/* Main 2-Column Layout: Sub-Sidebar + Active Tab Content */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        <PlatformSettingsSubSidebar activeTab={activeTab} onTabChange={switchTab} />

        <main className="flex-1 w-full min-w-0">
          {activeTab === 'general' && (
            <GeneralMaintenanceSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'currency-tax' && (
            <CurrencyTaxSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'tier-quotas' && (
            <TierQuotasSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'email-smtp' && (
            <EmailSmtpSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'policies' && (
            <SecuritySettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsWebhooksSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'data-retention' && (
            <DataRetentionSettingsTab
              settings={settings}
              onChange={handleFieldChange}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export function SuperAdminPlatformSettingsView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading Platform Settings Studio...</span>
          </div>
        </div>
      }
    >
      <SuperAdminPlatformSettingsContent />
    </Suspense>
  );
}
