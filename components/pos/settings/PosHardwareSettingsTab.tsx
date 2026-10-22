'use client';

import React from 'react';
import { Printer, Zap, CheckCircle2, ScanBarcode } from 'lucide-react';

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
      {/* 1. Thermal Receipt Printer Card */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">ESC/POS Thermal Receipt Printer</h3>
              <p className="text-xs text-slate-500 font-medium">Configure network, USB, or Bluetooth receipt printing hardware</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTestPrint}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300/80 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Connection Protocol</label>
            <select
              value={settings.printerType}
              onChange={(e) => onChange('printerType', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="network" className="bg-white text-slate-900">TCP / IP (Network Ethernet / WiFi)</option>
              <option value="usb" className="bg-white text-slate-900">USB Direct (WebUSB / RawBT)</option>
              <option value="bluetooth" className="bg-white text-slate-900">Bluetooth ESC/POS (Mobile)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Printer IP Address</label>
            <input
              type="text"
              value={settings.printerIp}
              onChange={(e) => onChange('printerIp', e.target.value)}
              placeholder="192.168.1.200"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Printer Port</label>
            <input
              type="text"
              value={settings.printerPort}
              onChange={(e) => onChange('printerPort', e.target.value)}
              placeholder="9100"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paperWidth === '80mm'}
              onChange={(e) => onChange('paperWidth', e.target.checked ? '80mm' : '58mm')}
              className="w-4 h-4 text-brand rounded focus:ring-brand"
            />
            <span className="text-xs font-bold text-slate-800">80mm Wide Receipt Paper (Standard)</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoPrintReceipt}
              onChange={(e) => onChange('autoPrintReceipt', e.target.checked)}
              className="w-4 h-4 text-brand rounded focus:ring-brand"
            />
            <span className="text-xs font-bold text-slate-800">Auto-Print Receipt on Successful Sale</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
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

      {/* 2. Cash Drawer & Barcode Scanner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cash Drawer */}
        <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">RJ-11 Cash Drawer</h3>
              <p className="text-xs text-slate-500 font-medium">Printer-kick pulse triggers for cash transactions</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
              <input
                type="checkbox"
                checked={settings.drawerKickOnCash}
                onChange={(e) => onChange('drawerKickOnCash', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">Kick Open Cash Drawer on Cash Tenders</span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Solenoid Pulse Voltage</label>
              <select
                value={settings.drawerKickPulse || '24v'}
                onChange={(e) => onChange('drawerKickPulse', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
              >
                <option value="24v" className="bg-white text-slate-900">24V Pulse (Standard Heavy-Duty Drawer)</option>
                <option value="12v" className="bg-white text-slate-900">12V Pulse (Compact / Mobile Drawer)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Barcode Scanner */}
        <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Barcode Scanner &amp; Inputs</h3>
              <p className="text-xs text-slate-500 font-medium">HID Keyboard emulation &amp; serial scanners</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
              <input
                type="checkbox"
                checked={settings.barcodeContinuousMode !== false}
                onChange={(e) => onChange('barcodeContinuousMode', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-800">Auto-Submit Cart Line on Enter Suffix</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
              <input
                type="checkbox"
                checked={settings.barcodeBeeper !== false}
                onChange={(e) => onChange('barcodeBeeper', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-800">Audio Beep Feedback on Successful Scan</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
