'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Key,
  ShieldCheck,
  Save,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { GeneralSettingsTab } from './GeneralSettingsTab';
import { IntegrationsSettingsTab } from './IntegrationsSettingsTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';

export function SuperAdminPlatformSettingsView() {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'security'>('general');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Platform Form State
  const [platformName, setPlatformName] = useState('CodeBridges Enterprise');
  const [supportEmail, setSupportEmail] = useState('support@codebridges.io');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTrialDays, setDefaultTrialDays] = useState('14');
  const [defaultTaxRate, setDefaultTaxRate] = useState('10');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Global platform settings and integration keys saved successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
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

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover p-0.5 shadow-md shadow-brand/15 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sliders className="w-6 h-6 text-brand" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Setting
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Platform Config
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Master configuration for payment gateways, default trial limits, Bakong KHQR credentials, and security policies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:scale-98 text-white font-extrabold text-xs shadow-md shadow-brand/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'general'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>General Defaults</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'integrations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Master Integrations (Bakong &amp; SMS)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security &amp; PIN Policies</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {activeTab === 'general' && (
          <GeneralSettingsTab
            platformName={platformName}
            setPlatformName={setPlatformName}
            supportEmail={supportEmail}
            setSupportEmail={setSupportEmail}
            defaultCurrency={defaultCurrency}
            setDefaultCurrency={setDefaultCurrency}
            defaultTrialDays={defaultTrialDays}
            setDefaultTrialDays={setDefaultTrialDays}
            defaultTaxRate={defaultTaxRate}
            setDefaultTaxRate={setDefaultTaxRate}
          />
        )}

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
          />
        )}

        {activeTab === 'security' && (
          <SecuritySettingsTab
            enforce2FA={enforce2FA}
            setEnforce2FA={setEnforce2FA}
            allowCashierPinSwitch={allowCashierPinSwitch}
            setAllowCashierPinSwitch={setAllowCashierPinSwitch}
            sessionTimeout={sessionTimeout}
            setSessionTimeout={setSessionTimeout}
          />
        )}
      </div>
    </div>
  );
}
