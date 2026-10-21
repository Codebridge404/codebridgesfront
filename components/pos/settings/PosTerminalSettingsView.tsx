'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Building2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { getOutletsApi, getOutletTerminalSettingsApi, updateOutletTerminalSettingsApi, getTenantProfileApi } from '@/lib/api';
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
  kdsEnabled: true,
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

  // Dynamic Bakong State read from Organization Settings
  const [bakongMerchantId, setBakongMerchantId] = useState('');
  const [bakongBankName, setBakongBankName] = useState('');

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
      if (merchant) setBakongMerchantId(merchant);
      if (bank) setBakongBankName(bank);

      if (!merchant) {
        getTenantProfileApi()
          .then((res) => {
            if (res?.success && res.data?.payment_settings) {
              const pay =
                typeof res.data.payment_settings === 'string'
                  ? JSON.parse(res.data.payment_settings)
                  : res.data.payment_settings;

              if (pay.bakong_merchant_id) {
                setBakongMerchantId(pay.bakong_merchant_id);
                localStorage.setItem('cb_bakong_merchant_id', pay.bakong_merchant_id);
              }
              if (pay.bakong_bank_name) {
                setBakongBankName(pay.bakong_bank_name);
                localStorage.setItem('cb_bakong_bank_name', pay.bakong_bank_name);
              }
              if (pay.bakong_secret) {
                localStorage.setItem('cb_bakong_secret', pay.bakong_secret);
              }
            }
          })
          .catch(() => {});
      }
    }

    const handleBakongUpdate = () => {
      if (typeof window !== 'undefined') {
        setBakongMerchantId(localStorage.getItem('cb_bakong_merchant_id') || '');
        setBakongBankName(localStorage.getItem('cb_bakong_bank_name') || '');
      }
    };
    window.addEventListener('cb_bakong_changed', handleBakongUpdate);

    getOutletsApi()
      .then(async (res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setOutlets(list);
        const targetOutletId = settings.outletId || (list.length > 0 ? list[0].id : null);
        if (list.length > 0 && !settings.outletId) {
          setSettings((prev) => ({ ...prev, outletId: list[0].id, outletName: list[0].name }));
        }

        if (targetOutletId) {
          try {
            const termRes = await getOutletTerminalSettingsApi(targetOutletId);
            if (termRes?.status === 'success' && termRes.data) {
              setSettings((prev) => ({
                ...prev,
                kdsEnabled: termRes.data.is_kds_enabled !== undefined ? Boolean(termRes.data.is_kds_enabled) : prev.kdsEnabled,
                cfdEnabled: termRes.data.is_cfd_enabled !== undefined ? Boolean(termRes.data.is_cfd_enabled) : prev.cfdEnabled,
                ...(termRes.data.terminal_settings || {}),
              }));
            }
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('cb_bakong_changed', handleBakongUpdate);
    };
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (settings.outletId) {
      try {
        await updateOutletTerminalSettingsApi(settings.outletId, {
          is_kds_enabled: settings.kdsEnabled !== false,
          is_cfd_enabled: settings.cfdEnabled !== false,
          terminal_settings: {
            printerType: settings.printerType,
            printerIp: settings.printerIp,
            printerPort: settings.printerPort,
            paperWidth: settings.paperWidth,
            autoPrintReceipt: settings.autoPrintReceipt,
            printKitchenTicket: settings.printKitchenTicket,
            drawerKickOnCash: settings.drawerKickOnCash,
            cfdAutoKhqr: settings.cfdAutoKhqr,
          },
        });
      } catch (err) {
        console.warn('Failed to sync terminal settings to backend outlet:', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(settings));
      localStorage.setItem('cb_pos_receipt_header', settings.receiptHeader || '');
      localStorage.setItem('cb_pos_receipt_footer', settings.receiptFooter || '');

      window.dispatchEvent(new CustomEvent('cb_terminal_settings_updated', { detail: settings }));
    }

    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 300);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all terminal hardware, receipt, and policy settings to factory defaults?')) {
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
            <span>POS Hardware, Receipt &amp; Terminal Policies</span>
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
            <span>POS hardware configuration, receipt template &amp; policies successfully updated!</span>
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
        <div className="bg-transparent rounded-3xl border border-slate-300/80 p-6 sm:p-7 space-y-6 shadow-xs animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-transparent border border-brand/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-transparent border border-brand/20 text-brand flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Payment Gateways are Centrally Configured
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Payment gateways, NBC Bakong KHQR credentials, acquiring settlement bank accounts, and SMS notification gateways have moved to the <strong>Organization Workspace Settings</strong>.
                </p>
              </div>
            </div>
            <Link
              href="/organization/settings?tab=payments"
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-sm shadow-brand/20 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Open Organization Payment Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Configuration Status Card */}
          <div className="rounded-xl border border-slate-300/80 bg-transparent p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Active Organization Payment Credentials
                </span>
              </div>
              {bakongMerchantId ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Ready for POS Checkout</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Not Configured Yet</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-transparent p-3.5 rounded-xl border border-slate-300/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Settlement Merchant ID
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {bakongMerchantId || '— (No Merchant ID configured)'}
                </span>
              </div>

              <div className="bg-transparent p-3.5 rounded-xl border border-slate-300/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Acquiring Settlement Bank
                </span>
                <span className="font-bold text-slate-800">
                  {bakongBankName || '— (No Settlement Bank configured)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Every POS register, kitchen terminal, and customer-facing display automatically uses these central credentials when processing sales or dynamic Bakong QR codes.
            </p>
          </div>
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
