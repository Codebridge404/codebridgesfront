/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: Unified Multi-Tenant Notification Providers Studio (BD-0157)
 */

'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Terminal,
} from 'lucide-react';
import {
  NotificationProviderItem,
  testNotificationProviderApi,
  TestNotificationProviderResponse,
} from '@/lib/api/notificationProviders';

interface TestNotificationProviderModalProps {
  provider: NotificationProviderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTestComplete?: () => void;
}

export function TestNotificationProviderModal({
  provider,
  isOpen,
  onClose,
  onTestComplete,
}: TestNotificationProviderModalProps) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestNotificationProviderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !provider) return null;

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await testNotificationProviderApi(provider.id, {
        recipient: recipient.trim() || undefined,
        message: message.trim() || undefined,
      });
      setResult(res);
      onTestComplete?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to perform connectivity handshake probe.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRecipientPlaceholder = () => {
    switch (provider.channel) {
      case 'telegram':
        return 'Telegram Chat ID (e.g. -100123456789 or @channel)';
      case 'email':
        return 'Recipient Email (e.g. devops@company.com)';
      case 'sms':
        return 'E.164 Phone Number (e.g. +85512345678)';
      case 'slack':
      case 'webhook':
        return 'Optional override webhook target or channel';
      default:
        return 'Target endpoint or recipient handle';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 flex items-center justify-center text-brand">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Test Connection Handshake
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dispatch a simulated probe to verify provider credentials and reachability.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleTest} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Provider Summary Badge */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-800">{provider.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                Channel: <span className="font-bold uppercase text-brand">{provider.channel}</span> ({provider.provider})
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                provider.is_enabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {provider.is_enabled ? 'Active' : 'Disabled'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Test Target / Recipient (Optional)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={getRecipientPlaceholder()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to test using configured default target or channel probe.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Probe Message Content (Optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Test connection probe from CodeBridges Engine"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          {/* Result or Error Display */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Handshake Probe Failed</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{result.message}</span>
              </div>
              {result.data?.probe_result && (
                <div className="p-3 bg-white rounded-xl border border-emerald-100 text-[11px] font-mono text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Telemetry Diagnostics</span>
                  </div>
                  <p>
                    <span className="text-slate-400">Status:</span> {result.data.probe_result.status}
                  </p>
                  <p>
                    <span className="text-slate-400">Target:</span> {result.data.probe_result.target}
                  </p>
                  <p>
                    <span className="text-slate-400">Detail:</span> {result.data.probe_result.detail}
                  </p>
                  <p>
                    <span className="text-slate-400">Timestamp:</span> {result.data.tested_at}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing Handshake...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Diagnostic Probe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

