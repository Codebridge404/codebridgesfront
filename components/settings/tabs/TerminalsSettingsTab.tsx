'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  ChefHat,
  Tv,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  getOutletsApi,
  getOutletTerminalSettingsApi,
  updateOutletTerminalSettingsApi,
} from '@/lib/api';
import { buttonStyles } from '@/lib/theme';

export function TerminalsSettingsTab() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [kdsEnabled, setKdsEnabled] = useState(true);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [cfdAutoKhqr, setCfdAutoKhqr] = useState(true);

  // Load initial settings from localStorage and API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cb_pos_terminal_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.kdsEnabled !== undefined) setKdsEnabled(Boolean(parsed.kdsEnabled));
          if (parsed.cfdEnabled !== undefined) setCfdEnabled(Boolean(parsed.cfdEnabled));
          if (parsed.cfdAutoKhqr !== undefined) setCfdAutoKhqr(Boolean(parsed.cfdAutoKhqr));
        } catch {}
      }
    }

    getOutletsApi()
      .then(async (res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setOutlets(list);
        if (list.length > 0) {
          const initialId = String(list[0].id);
          setSelectedOutletId(initialId);
          await loadOutletSettings(initialId);
        }
      })
      .catch((err) => {
        setErrorMessage('Failed to load outlets list from backend.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadOutletSettings = async (outletId: string) => {
    try {
      const res = await getOutletTerminalSettingsApi(outletId);
      if (res?.status === 'success' && res.data) {
        if (res.data.is_kds_enabled !== undefined) setKdsEnabled(Boolean(res.data.is_kds_enabled));
        if (res.data.is_cfd_enabled !== undefined) setCfdEnabled(Boolean(res.data.is_cfd_enabled));
        if (res.data.terminal_settings?.cfdAutoKhqr !== undefined) {
          setCfdAutoKhqr(Boolean(res.data.terminal_settings.cfdAutoKhqr));
        }
      }
    } catch (err) {
      console.warn('Could not load specific outlet terminal settings:', err);
    }
  };

  const handleOutletChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedOutletId(newId);
    setLoading(true);
    await loadOutletSettings(newId);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      if (selectedOutletId) {
        await updateOutletTerminalSettingsApi(selectedOutletId, {
          is_kds_enabled: kdsEnabled,
          is_cfd_enabled: cfdEnabled,
          terminal_settings: {
            cfdAutoKhqr,
          },
        });
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cb_pos_terminal_settings');
        const existing = stored ? JSON.parse(stored) : {};
        const updated = {
          ...existing,
          outletId: selectedOutletId,
          kdsEnabled,
          cfdEnabled,
          cfdAutoKhqr,
        };
        localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cb_terminal_settings_updated', { detail: updated }));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save sub-terminal settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-brand" />
            <span>Sub-Terminals &amp; Display Displays</span>
          </h2>
          <p className="text-xs text-slate-500">
            Enable or hide Kitchen Display Systems (KDS) and Customer-Facing Displays (CFD) for store operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} px-5 py-2 text-xs font-black shadow-xs flex items-center gap-1.5`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saved &amp; Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Terminals</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Outlet Selection */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800">Assigned Store / Outlet</label>
            <p className="text-[11px] text-slate-500">Select which outlet to configure sub-terminal displays for</p>
          </div>

          <select
            value={selectedOutletId}
            onChange={handleOutletChange}
            className="w-full sm:w-72 px-3.5 py-2 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
          >
            {outlets.length === 0 ? (
              <option value="" className="text-slate-900 bg-white">Loading outlets...</option>
            ) : (
              outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id} className="text-slate-900 bg-white">
                  {outlet.name} ({outlet.code || `ID: ${outlet.id}`})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Terminal Cards Grid */}
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
                  checked={kdsEnabled}
                  onChange={(e) => setKdsEnabled(e.target.checked)}
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

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600">Module Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                kdsEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {kdsEnabled ? 'Active in POS' : 'Hidden'}
            </span>
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
                  checked={cfdEnabled}
                  onChange={(e) => setCfdEnabled(e.target.checked)}
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

            {cfdEnabled && (
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={cfdAutoKhqr}
                    onChange={(e) => setCfdAutoKhqr(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>Automatically display dynamic KHQR on payment checkout</span>
                </label>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600">Module Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                cfdEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {cfdEnabled ? 'Active in POS' : 'Hidden'}
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
