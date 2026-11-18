/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0168 - Security & Real-Time Telegram Alerts Studio View
 */

'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, Send, RotateCcw, Eye, Save, History, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  getTelegramAlertStatusApi,
  getTelegramAlertHistoryApi,
  sendTelegramAlertTestApi,
  previewTelegramAlertTemplateApi,
  getTelegramAlertTemplatesApi,
  updateTelegramAlertTemplateApi,
  resetTelegramAlertTemplateApi,
} from '@/lib/api/telegramAlerts';
import { useToast } from '@/components/common';

export function TelegramAlertsStudioView() {
  const toast = useToast();
  const [status, setStatus] = useState<any>(null);
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [selectedType, setSelectedType] = useState<string>('');
  const [draftBody, setDraftBody] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [testChatId, setTestChatId] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadAll = async () => {
    try {
      const [statusRes, tplRes, histRes] = await Promise.all([
        getTelegramAlertStatusApi().catch(() => null),
        getTelegramAlertTemplatesApi().catch(() => null),
        getTelegramAlertHistoryApi({ per_page: 20 }).catch(() => null),
      ]);
      if (statusRes?.data) setStatus(statusRes.data);
      const tplData = tplRes?.data || {};
      setTemplates(tplData);
      const keys = Object.keys(tplData);
      if (keys.length > 0 && !selectedType) {
        setSelectedType(keys[0]);
        setDraftBody(tplData[keys[0]]?.body || tplData[keys[0]] || '');
      }
      const histList = Array.isArray(histRes?.data) ? histRes.data : [];
      setHistory(histList);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load Telegram alerts studio.');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setDraftBody(templates[type]?.body || templates[type] || '');
    setPreviewText('');
  };

  const handlePreview = async () => {
    if (!draftBody.trim()) return;
    try {
      setBusy(true);
      const res = await previewTelegramAlertTemplateApi({ body: draftBody, type: selectedType });
      setPreviewText(res?.data?.rendered || res?.rendered || draftBody);
    } catch (err: any) {
      toast.error(err?.message || 'Preview failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedType || !draftBody.trim()) return;
    try {
      setBusy(true);
      await updateTelegramAlertTemplateApi(selectedType, draftBody);
      toast.success(`Template "${selectedType}" saved.`);
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save template.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!selectedType) return;
    try {
      setBusy(true);
      await resetTelegramAlertTemplateApi(selectedType);
      toast.success(`Template "${selectedType}" reset to factory default.`);
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset template.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      await sendTelegramAlertTestApi({
        chat_id: testChatId.trim() || undefined,
        message: testMsg.trim() || undefined,
      });
      toast.success('Test Telegram alert dispatched.');
      setTestMsg('');
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch test alert.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status + Test Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-brand" />
              <span>Telegram Alert Gateway Status</span>
            </h3>
            {status?.is_configured ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                <AlertTriangle className="w-3 h-3" /> Not Configured
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Active Provider: <strong className="text-slate-800">{status?.provider_name || 'Default Telegram Bot'}</strong>
            {status?.bot_username ? ` (@${status.bot_username})` : ''}
          </p>
        </div>

        <form onSubmit={handleSendTest} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900">Send Test Alert</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="Optional Chat ID override"
              className="sm:w-44 px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <input
              type="text"
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              placeholder="Custom test alert message..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Template Editor */}
      {Object.keys(templates).length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-black text-slate-900">Alert Message Templates</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(templates).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    selectedType === type
                      ? 'bg-brand text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={5}
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800"
          />

          {previewText && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs whitespace-pre-line text-slate-700">
              {previewText}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handlePreview}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSaveTemplate}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Template
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleResetTemplate}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>
        </div>
      )}

      {/* Delivery History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-brand" />
          <span>Recent Alert Delivery History ({history.length})</span>
        </h3>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400">No alert deliveries logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {history.map((item, idx) => (
              <div key={item.id ?? idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{item.title || item.type || 'Telegram Alert'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.message || item.body || 'Dispatched'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                  {item.status || 'sent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
