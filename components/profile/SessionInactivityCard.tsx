/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0167 - Session Inactivity Timeout Settings & Heartbeat Card
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  getSessionSettingsApi,
  updateSessionSettingsApi,
  pingSessionApi,
} from '@/lib/api/sessions';

export function SessionInactivityCard() {
  const [days, setDays] = useState<number>(180);
  const [options, setOptions] = useState<number[]>([7, 30, 90, 180, 365]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSessionSettingsApi()
      .then((res) => {
        if (!mounted || !res?.data) return;
        setDays(res.data.session_inactivity_days || 180);
        if (Array.isArray(res.data.available_options) && res.data.available_options.length > 0) {
          setOptions(res.data.available_options);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (nextDays: number) => {
    setDays(nextDays);
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await updateSessionSettingsApi(nextDays);
      setStatusMsg(`Idle session timeout updated to ${nextDays} days.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update session timeout.');
    } finally {
      setSaving(false);
    }
  };

  const handlePing = async () => {
    setPinging(true);
    setErrorMsg(null);
    try {
      const res = await pingSessionApi();
      setLastPing(res?.data?.last_used_at || new Date().toISOString());
      setStatusMsg('Session heartbeat acknowledged.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Heartbeat failed.');
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center shadow-xs shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Session Inactivity Timeout &amp; Heartbeat</h2>
            <p className="text-xs text-slate-500 font-medium">
              Automatically expire inactive device sessions after the selected retention window.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePing}
          disabled={pinging}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{pinging ? 'Pinging...' : 'Send Heartbeat'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={loading || saving}
            onClick={() => handleSave(opt)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
              days === opt
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {opt} Days
          </button>
        ))}
      </div>

      {lastPing && (
        <p className="text-[11px] text-slate-400">
          Last heartbeat acknowledged: {new Date(lastPing).toLocaleString()}
        </p>
      )}
    </div>
  );
}
