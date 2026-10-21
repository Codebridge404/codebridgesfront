'use client';

import React from 'react';
import { Printer, ScanBarcode, Tv, Zap, CheckCircle2, ChefHat } from 'lucide-react';

interface PosHardwareSettingsTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
  onTestPrint: () => void;
  testPrintSuccess: boolean;
}

export function PosHardwareSettingsTab({
  settings,
  onChange,
  onTestPrint,
  testPrintSuccess,
}: PosHardwareSettingsTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Thermal Printer Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">ESC/POS Thermal Receipt Printer</h3>
              <p className="text-xs text-slate-500">Configure receipt &amp; kitchen ticket printing hardware</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTestPrint}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {testPrintSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Test Printed!</span>
              </>
            ) : (
              'Send Test Print'
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Connection Protocol</label>
            <select
              value={settings.printerType}
              onChange={(e) => onChange('printerType', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="network">TCP / IP (Network Ethernet/WiFi)</option>
              <option value="usb">USB Direct (WebUSB / RawBT)</option>
              <option value="bluetooth">Bluetooth ESC/POS (Mobile)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Printer IP Address</label>
            <input
              type="text"
              value={settings.printerIp}
              onChange={(e) => onChange('printerIp', e.target.value)}
              placeholder="192.168.1.200"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Paper Roll Width</label>
            <select
              value={settings.paperWidth}
              onChange={(e) => onChange('paperWidth', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="80mm">Standard 80mm (48 characters)</option>
              <option value="58mm">Compact 58mm (32 characters)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoPrintReceipt}
              onChange={(e) => onChange('autoPrintReceipt', e.target.checked)}
              className="w-4 h-4 text-brand rounded focus:ring-brand"
            />
            <span className="text-xs font-bold text-slate-800">Auto-Print Receipt on Successful Payment</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.printKitchenTicket}
              onChange={(e) => onChange('printKitchenTicket', e.target.checked)}
              className="w-4 h-4 text-brand rounded focus:ring-brand"
            />
            <span className="text-xs font-bold text-slate-800">Duplicate Kitchen Order Ticket (KOT)</span>
          </label>
        </div>
      </div>

      {/* POS Fleet Terminals: CFD & KDS & Cash Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Display (CFD) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Customer Display (CFD)</h3>
              <p className="text-xs text-slate-500">Secondary screen facing customer</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cfdEnabled !== false}
                onChange={(e) => onChange('cfdEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800">Enable Customer Display (CFD)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cfdAutoKhqr}
                onChange={(e) => onChange('cfdAutoKhqr', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800">Auto-render Bakong KHQR</span>
            </label>
            <p className="text-[11px] text-slate-400 pl-1">
              Uncheck to hide CFD terminal from POS navigation if not used.
            </p>
          </div>
        </div>

        {/* Kitchen Display (KDS) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Kitchen Display (KDS)</h3>
              <p className="text-xs text-slate-500">Kitchen order ticket station</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.kdsEnabled !== false}
                onChange={(e) => onChange('kdsEnabled', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800">Enable Kitchen Display (KDS)</span>
            </label>
            <p className="text-[11px] text-slate-400 pl-1 pt-1">
              Uncheck to hide KDS terminal from POS navigation if your business does not prepare kitchen orders.
            </p>
          </div>
        </div>

        {/* Cash Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">RJ-11 Cash Drawer</h3>
              <p className="text-xs text-slate-500">Printer-kick pulse triggers</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.drawerKickOnCash}
                onChange={(e) => onChange('drawerKickOnCash', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">Kick Drawer on Cash Tenders</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
