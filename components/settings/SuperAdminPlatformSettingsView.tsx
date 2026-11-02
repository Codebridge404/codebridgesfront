'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, CheckCircle2, Loader2 } from 'lucide-react';
import { IntegrationsSettingsTab } from './IntegrationsSettingsTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';
import { PlatformSettingsSubSidebar, PlatformSettingsTab } from './PlatformSettingsSubSidebar';

const VALID_TABS: PlatformSettingsTab[] = ['integrations', 'policies'];

function SuperAdminPlatformSettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as PlatformSettingsTab | null;

  const [activeTab, setActiveTab] = useState<PlatformSettingsTab>(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) return tabParam;
    return 'integrations';
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Integrations State
  const [bakongMerchantId, setBakongMerchantId] = useState('CODEBRIDGES_MASTER_HQ');
  const [bakongBankName, setBakongBankName] = useState('ABA Bank (National Bank of Cambodia)');
  const [bakongSecret, setBakongSecret] = useState('khqr_live_sec_9948291048201');
  const [smsGatewayProvider, setSmsGatewayProvider] = useState('plasgate');
  const [smsApiKey, setSmsApiKey] = useState('pls_api_8849204918239');

  // Security Policies State
  const [sessionTimeout, setSessionTimeout] = useState('120');
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [allowCashierPinSwitch, setAllowCashierPinSwitch] = useState(true);

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      showToast('Platform settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    }, 600);
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-xs text-slate-500 font-medium">
            Central payment gateways, Bakong KHQR credentials, and global platform security policies
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout: Sub-Sidebar + Active Global Tab Content */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        <PlatformSettingsSubSidebar activeTab={activeTab} onTabChange={switchTab} />

        <main className="flex-1 w-full min-w-0">
          {activeTab === 'integrations' && (
            <IntegrationsSettingsTab
              bakongMerchantId={bakongMerchantId}
              setBakongMerchantId={setBakongMerchantId}
              bakongBankName={bakongBankName}
              setBakongBankName={setBakongBankName}
              bakongSecret={bakongSecret}
              setBakongSecret={setBakongSecret}
              smsGatewayProvider={smsGatewayProvider}
              setSmsGatewayProvider={setSmsGatewayProvider}
              smsApiKey={smsApiKey}
              setSmsApiKey={setSmsApiKey}
              saving={saving}
              saved={saved}
              onSave={handleSave}
            />
          )}

          {activeTab === 'policies' && (
            <SecuritySettingsTab
              enforce2FA={enforce2FA}
              setEnforce2FA={setEnforce2FA}
              allowCashierPinSwitch={allowCashierPinSwitch}
              setAllowCashierPinSwitch={setAllowCashierPinSwitch}
              sessionTimeout={sessionTimeout}
              setSessionTimeout={setSessionTimeout}
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
            <span>Loading Platform Settings...</span>
          </div>
        </div>
      }
    >
      <SuperAdminPlatformSettingsContent />
    </Suspense>
  );
}