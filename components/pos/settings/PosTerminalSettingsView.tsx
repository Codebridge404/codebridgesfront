'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Sliders,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Receipt,
  QrCode,
} from 'lucide-react';
import { getOutletsApi, createBankAccountApi } from '@/lib/api';
import { IntegrationsSettingsTab } from '@/components/settings';
import { PosHardwareSettingsTab } from './PosHardwareSettingsTab';
import { PosPolicySettingsTab } from './PosPolicySettingsTab';
import { PosReceiptSettingsTab } from './PosReceiptSettingsTab';

const DEFAULT_SETTINGS = {
  terminalName: 'Register 01 - Main Counter',
  terminalId: 'POS-TERM-001',
  outletId: '',
  outletName: 'Main Store',
  baseCurrency: 'USD',
  secondaryCurrency: 'KHR',
  exchangeRate: 4100,
  khrRounding: '100',
  printerType: 'network',
  printerIp: '192.168.1.200',
  printerPort: '9100',
  paperWidth: '80mm',
  autoPrintReceipt: true,
  printKitchenTicket: true,
  drawerKickOnCash: true,
  drawerKickPulse: '24v',
  barcodeContinuousMode: true,
  barcodeBeeper: true,
  cfdEnabled: true,
  cfdAutoKhqr: true,
  autoLockMinutes: '2',
  requirePinForVoid: true,
  requirePinForRefund: true,
  requirePinForDiscount: true,
  receiptHeader: '',
  receiptFooter: 'Thank you for shopping with us! Please come again.',
};

function PosTerminalSettingsContent() {
  const [activeTab, setActiveTab] = useState<'hardware' | 'receipt' | 'payments' | 'policies'>('hardware');
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Dynamic Bakong Integration State for POS Checkout
  const [bakongMerchantId, setBakongMerchantId] = useState('');
  const [bakongBankName, setBakongBankName] = useState('');
  const [bakongSecret, setBakongSecret] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cb_pos_terminal_settings');
      if (saved) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch {}
      }
      const savedHeader = localStorage.getItem('cb_pos_receipt_header');
      const savedFooter = localStorage.getItem('cb_pos_receipt_footer');
      if (savedHeader !== null) setSettings((prev) => ({ ...prev, receiptHeader: savedHeader }));
      if (savedFooter !== null) setSettings((prev) => ({ ...prev, receiptFooter: savedFooter }));

      const merchant = localStorage.getItem('cb_bakong_merchant_id') || '';
      const bank = localStorage.getItem('cb_bakong_bank_name') || '';
      const secret = localStorage.getItem('cb_bakong_secret') || '';
      if (merchant) setBakongMerchantId(merchant);
      if (bank) setBakongBankName(bank);
      if (secret) setBakongSecret(secret);
    }

    getOutletsApi()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setOutlets(list);
        if (list.length > 0 && !settings.outletId) {
          setSettings((prev) => ({ ...prev, outletId: list[0].id, outletName: list[0].name }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(settings));
      localStorage.setItem('cb_pos_receipt_header', settings.receiptHeader || '');
      localStorage.setItem('cb_pos_receipt_footer', settings.receiptFooter || '');

      localStorage.setItem('cb_bakong_merchant_id', bakongMerchantId);
      localStorage.setItem('cb_bakong_bank_name', bakongBankName);
      localStorage.setItem('cb_bakong_secret', bakongSecret);

      window.dispatchEvent(new CustomEvent('cb_terminal_settings_updated', { detail: settings }));
      window.dispatchEvent(
        new CustomEvent('cb_bakong_changed', {
          detail: { merchantId: bakongMerchantId, bankName: bakongBankName },
        })
      );
    }

    if (bakongMerchantId && bakongBankName) {
      try {
        await createBankAccountApi({
          bank_name: bakongBankName,
          account_name: settings.outletName || 'Store Merchant Account',
          account_number: bakongMerchantId,
          currency: settings.baseCurrency || 'USD',
          status: 'connected',
        });
      } catch {}
    }

    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 300);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all terminal hardware, receipt, and payment settings to factory defaults?')) {
      const reset = { ...DEFAULT_SETTINGS, outletId: outlets[0]?.id || '' };
      setSettings(reset);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(reset));
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Settings className="w-4 h-4" />
            <span>POS Hardware, Receipt &amp; Payment Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Point of Sale Settings</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>POS configuration, receipt template &amp; Bakong KHQR credentials successfully updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold max-w-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('hardware')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hardware' ? 'bg-white text-brand shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Hardware &amp; Peripherals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('receipt')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'receipt' ? 'bg-white text-brand shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Receipt Customization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments' ? 'bg-white text-brand shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Payment &amp; KHQR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'policies' ? 'bg-white text-brand shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Currency &amp; Security</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'hardware' && (
        <PosHardwareSettingsTab
          settings={settings}
          onChange={handleChange}
          onTestPrint={() => {
            setTestPrintSuccess(true);
            setTimeout(() => setTestPrintSuccess(false), 3000);
          }}
          testPrintSuccess={testPrintSuccess}
        />
      )}

      {activeTab === 'receipt' && (
        <PosReceiptSettingsTab
          settings={settings}
          onChange={handleChange}
          storeName={settings.outletName || 'Main Store'}
        />
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <IntegrationsSettingsTab
            bakongMerchantId={bakongMerchantId}
            setBakongMerchantId={setBakongMerchantId}
            bakongBankName={bakongBankName}
            setBakongBankName={setBakongBankName}
            bakongSecret={bakongSecret}
            setBakongSecret={setBakongSecret}
            title="NBC Bakong KHQR Store Payment Gateway"
            description="Connect your Bakong Account ID or Merchant ID to collect real-time payments directly into your store bank account during POS checkout."
            merchantIdLabel="Bakong Account ID / Merchant ID"
            merchantIdPlaceholder="e.g. yourname@aba or 012345678@aba"
            secretKeyLabel="Bakong Open API Developer Token"
            showSmsGateway={false}
          />
        </div>
      )}

      {activeTab === 'policies' && (
        <PosPolicySettingsTab
          settings={settings}
          outlets={outlets}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

export function PosTerminalSettingsView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading Terminal Settings...</span>
          </div>
        </div>
      }
    >
      <PosTerminalSettingsContent />
    </Suspense>
  );
}
