'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  ChefHat,
  Tv,
  ExternalLink,
} from 'lucide-react';
import {
  getOutletsApi,
  getOutletTerminalSettingsApi,
  updateOutletTerminalSettingsApi,
} from '@/lib/api';
import { buttonStyles } from '@/lib/theme';
import { PosHardwareSettingsTab } from './PosHardwareSettingsTab';
import { PosPolicySettingsTab } from './PosPolicySettingsTab';
import { PosReceiptSettingsTab } from './PosReceiptSettingsTab';
import { PosBusinessProfileTab } from './PosBusinessProfileTab';
import { PosSettingsSubSidebar, PosSettingsTab } from './PosSettingsSubSidebar';
import { PosAccessManagementView } from '../access';

const VALID_POS_TABS: PosSettingsTab[] = ['profile', 'hardware', 'receipt', 'terminals', 'policies', 'security'];

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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as PosSettingsTab | null;
  const [activeTab, setActiveTab] = useState<PosSettingsTab>(() => {
    if (tabParam && VALID_POS_TABS.includes(tabParam)) {
      return tabParam;
    }
    return 'hardware';
  });

  useEffect(() => {
    const currentTab = searchParams.get('tab') as PosSettingsTab | null;
    if (currentTab && VALID_POS_TABS.includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const switchTab = (tab: PosSettingsTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

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
    }

    getOutletsApi()
      .then(async (res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setOutlets(list);
        const targetOutletId = settings.outletId || (list.length > 0 ? String(list[0].id) : null);
        if (list.length > 0 && !settings.outletId) {
          setSettings((prev) => ({ ...prev, outletId: String(list[0].id), outletName: list[0].name }));
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
      const reset = { ...DEFAULT_SETTINGS, outletId: outlets[0]?.id ? String(outlets[0].id) : '' };
      setSettings(reset);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(reset));
      }
    }
  };

  return (
    <div className="w-full font-sans pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Settings className="w-4 h-4" />
            <span>POS Module</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Setting</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure hardware peripherals, receipt printouts, sub-terminal screens (KDS/CFD), and cashier policies
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className={`${buttonStyles.primary} px-5 py-2 text-xs font-black shadow-xs flex items-center gap-1.5 disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved &amp; Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>POS hardware configuration, receipt template &amp; terminal policies successfully updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Layout matching Organization Settings: Sub-Sidebar + Active Tab Content */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        <PosSettingsSubSidebar activeTab={activeTab} onTabChange={switchTab} />

        <main className="flex-1 w-full min-w-0">
          {/* Tab 0: Business Profile & Mode */}
          {activeTab === 'profile' && (
            <PosBusinessProfileTab outletName={settings.outletName || 'Main Store'} />
          )}

          {/* Tab 1: Hardware & Peripherals */}
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

          {/* Tab 2: Receipt Customization */}
          {activeTab === 'receipt' && (
            <PosReceiptSettingsTab
              settings={settings}
              onChange={handleChange}
              storeName={settings.outletName || 'Main Store'}
            />
          )}

          {/* Tab 3: Sub-Terminals (KDS & CFD) */}
          {activeTab === 'terminals' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">Assigned Store / Outlet</label>
                    <p className="text-[11px] text-slate-500">Select which outlet to configure sub-terminal displays for</p>
                  </div>

                  <select
                    value={settings.outletId}
                    onChange={(e) => {
                      const sel = outlets.find((o) => String(o.id) === e.target.value);
                      handleChange('outletId', e.target.value);
                      if (sel) handleChange('outletName', sel.name);
                    }}
                    className="w-full sm:w-72 px-3.5 py-2 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                  >
                    {outlets.length === 0 ? (
                      <option value="" className="text-slate-900 bg-white">Loading outlets...</option>
                    ) : (
                      outlets.map((outlet) => (
                        <option key={outlet.id} value={String(outlet.id)} className="text-slate-900 bg-white">
                          {outlet.name} ({outlet.code || `ID: ${outlet.id}`})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* KDS Card */}
                <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <ChefHat className="w-5 h-5" />
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.kdsEnabled !== false}
                          onChange={(e) => handleChange('kdsEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                      </label>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Kitchen Display System (KDS)</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Paperless kitchen order display terminal with color-coded timers, preparation queues, and order bump capabilities.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600">Module Status</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                          settings.kdsEnabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {settings.kdsEnabled !== false ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {settings.kdsEnabled !== false && (
                      <Link
                        href="/pos/kitchen-display"
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                        title="Open Kitchen Display System in new window"
                      >
                        <span>Open KDS</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* CFD Card */}
                <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <Tv className="w-5 h-5" />
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.cfdEnabled !== false}
                          onChange={(e) => handleChange('cfdEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                      </label>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Customer-Facing Display (CFD)</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Secondary screen facing shoppers that displays line items in real-time and renders dynamic Bakong KHQR for contactless payments.
                      </p>
                    </div>

                    {settings.cfdEnabled !== false && (
                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={settings.cfdAutoKhqr}
                            onChange={(e) => handleChange('cfdAutoKhqr', e.target.checked)}
                            className="w-4 h-4 rounded text-brand focus:ring-brand"
                          />
                          <span>Automatically display dynamic KHQR on payment checkout</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600">Module Status</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                          settings.cfdEnabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {settings.cfdEnabled !== false ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {settings.cfdEnabled !== false && (
                      <Link
                        href="/pos/customer-display"
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                        title="Open Customer-Facing Display in new window"
                      >
                        <span>Open CFD</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Currency & Policies */}
          {activeTab === 'policies' && (
            <PosPolicySettingsTab
              settings={settings}
              outlets={outlets}
              onChange={handleChange}
            />
          )}

          {/* Tab 5: Security & Staff PINs */}
          {activeTab === 'security' && (
            <PosAccessManagementView embedded={true} />
          )}
        </main>
      </div>
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
