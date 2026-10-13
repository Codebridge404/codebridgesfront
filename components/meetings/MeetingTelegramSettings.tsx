'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Key,
  MessageSquare,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  FileCode,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  getMeetingTelegramConfigApi,
  updateMeetingTelegramConfigApi,
  validateMeetingTelegramTokenApi,
  testMeetingTelegramNotificationApi,
  getMeetingTelegramTemplatesApi,
  updateMeetingTelegramTemplateApi,
  resetMeetingTelegramTemplateApi,
  previewMeetingTelegramTemplateApi,
  TelegramConfigItem,
  TelegramTemplateItem,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingTelegramSettings() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'gateway' | 'templates'>('gateway');

  // Gateway config
  const [config, setConfig] = useState<TelegramConfigItem>({
    bot_enabled: false,
    bot_token: '',
    bot_token_masked: '',
    has_token: false,
    bot_username: '',
    default_chat_id: '',
    default_reminder_minutes: 15,
  });
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    bot_username?: string;
    bot_first_name?: string;
    message?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<TelegramTemplateItem[]>([]);
  const [selectedType, setSelectedType] = useState<'confirmation' | 'reminder' | 'change' | 'cancellation'>('confirmation');
  const [templateContent, setTemplateContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfgRes, tplRes] = await Promise.all([
        getMeetingTelegramConfigApi(),
        getMeetingTelegramTemplatesApi(),
      ]);
      if (cfgRes?.data) {
        setConfig(cfgRes.data);
        setTokenInput(cfgRes.data.bot_token_masked || '');
      }
      if (tplRes?.data) {
        setTemplates(tplRes.data);
        const curr = tplRes.data.find((t: any) => t.type === selectedType);
        if (curr) {
          setTemplateContent(curr.content);
        }
      }
    } catch {
      toast.error('Failed to load Telegram configuration and templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update editor when switching template type
  useEffect(() => {
    const curr = templates.find((t) => t.type === selectedType);
    if (curr) {
      setTemplateContent(curr.content);
    }
  }, [selectedType, templates]);

  // Fetch live preview whenever templateContent changes
  useEffect(() => {
    if (!templateContent) return;
    const timer = setTimeout(async () => {
      setLoadingPreview(true);
      try {
        const res = await previewMeetingTelegramTemplateApi({
          type: selectedType,
          content: templateContent,
        });
        if (res?.data?.rendered) {
          setPreviewContent(res.data.rendered);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingPreview(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [templateContent, selectedType]);

  const handleValidateToken = async () => {
    setValidatingToken(true);
    setValidationResult(null);
    try {
      const res = await validateMeetingTelegramTokenApi(tokenInput.includes('••••') ? undefined : tokenInput);
      if (res?.valid) {
        setValidationResult({
          valid: true,
          bot_username: res.bot_username,
          bot_first_name: res.bot_first_name,
          message: res.message,
        });
        setConfig((prev) => ({ ...prev, bot_username: res.bot_username }));
        toast.success(res.message || 'Telegram Bot verified!');
      } else {
        setValidationResult({
          valid: false,
          message: res?.message || 'Token rejected by Telegram.',
        });
        toast.error(res?.message || 'Invalid Bot Token.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Validation request failed.');
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const payload: Partial<TelegramConfigItem> = {
        bot_enabled: config.bot_enabled,
        bot_username: config.bot_username,
        default_chat_id: config.default_chat_id,
        default_reminder_minutes: config.default_reminder_minutes,
      };
      if (tokenInput && !tokenInput.includes('••••')) {
        payload.bot_token = tokenInput;
      }

      const res = await updateMeetingTelegramConfigApi(payload);
      if (res?.status === 'success') {
        toast.success('Telegram Bot settings saved successfully!');
        if (res.data) setConfig(res.data);
      } else {
        toast.error('Failed to save configuration.');
      }
    } catch {
      toast.error('Error saving settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestAlert = async () => {
    if (!config.default_chat_id) {
      toast.error('Please configure a Default Target Chat ID first.');
      return;
    }
    setTesting(true);
    try {
      const res = await testMeetingTelegramNotificationApi({
        chat_id: config.default_chat_id,
      });
      if (res?.status === 'success') {
        toast.success(res.message || 'Test alert dispatched to Telegram!');
      } else {
        toast.error(res?.message || 'Telegram test failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch test notification.');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const res = await updateMeetingTelegramTemplateApi(selectedType, templateContent);
      if (res?.status === 'success') {
        toast.success(`Template "${selectedType}" updated successfully!`);
        // update local list
        setTemplates((prev) =>
          prev.map((t) => (t.type === selectedType ? { ...t, content: templateContent, is_customized: true } : t))
        );
      } else {
        toast.error('Failed to save template.');
      }
    } catch {
      toast.error('Error saving template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!confirm(`Reset "${selectedType}" template to system default?`)) return;
    try {
      const res = await resetMeetingTelegramTemplateApi(selectedType);
      if (res?.status === 'success') {
        toast.success('Template restored to factory default.');
        if (res.data?.content) {
          setTemplateContent(res.data.content);
        }
        setTemplates((prev) =>
          prev.map((t) => (t.type === selectedType ? { ...t, content: res.data?.content, is_customized: false } : t))
        );
      }
    } catch {
      toast.error('Failed to reset template.');
    }
  };

  const insertVariable = (varName: string) => {
    setTemplateContent((prev) => `${prev} {${varName}}`);
  };

  const standardPlaceholders = [
    'title',
    'room',
    'startTime',
    'endTime',
    'organizer',
    'materials',
    'leadMinutes',
    'reason',
  ];

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('gateway')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'gateway'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Bot Gateway &amp; Credentials</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Notification Templates Engine</span>
        </button>
      </div>

      {activeSubTab === 'gateway' && (
        <form onSubmit={handleSaveConfig} className={`${cardStyles.base} p-6 space-y-5 text-xs font-semibold`}>
          {/* Active Switch */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-extrabold text-slate-900 text-sm">Activate Telegram Push Gateway</p>
              <p className="text-slate-500 text-xs">
                Broadcast instant reservation confirmations, auto-release cancellations, and countdown alerts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.bot_enabled}
                onChange={(e) => setConfig({ ...config, bot_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Bot Token with Live Validation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 flex items-center gap-1.5 font-bold">
                <Key className="w-3.5 h-3.5 text-indigo-500" /> Telegram Bot API Token
              </label>
              {config.bot_username && (
                <a
                  href={`https://t.me/${config.bot_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-[11px] font-bold"
                >
                  @{config.bot_username} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. 7123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleValidateToken}
                disabled={validatingToken || !tokenInput}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${validatingToken ? 'animate-spin' : 'text-emerald-600'}`} />
                <span>{validatingToken ? 'Checking...' : 'Verify Token'}</span>
              </button>
            </div>

            {validationResult && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                  validationResult.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {validationResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}
          </div>

          {/* Chat ID & Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1 flex items-center gap-1.5 font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Default Target Channel / Chat ID
              </label>
              <input
                type="text"
                value={config.default_chat_id || ''}
                onChange={(e) => setConfig({ ...config, default_chat_id: e.target.value })}
                placeholder="e.g. -1001234567890 or @company_meetings"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">Broadcast destination for alerts and notifications.</p>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 flex items-center gap-1.5 font-bold">
                <Bell className="w-3.5 h-3.5 text-indigo-500" /> Pre-Meeting Countdown Lead Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={config.default_reminder_minutes || 15}
                  onChange={(e) => setConfig({ ...config, default_reminder_minutes: parseInt(e.target.value, 10) || 15 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                />
                <span className="text-slate-400 text-xs shrink-0">minutes prior</span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={testing || !config.default_chat_id}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>{testing ? 'Dispatching Ping...' : 'Send Test Alert'}</span>
            </button>

            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Templates Engine Tab */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Template Type Selector & Editor (7 cols) */}
          <div className={`lg:col-span-7 ${cardStyles.base} p-5 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Custom Notification Templates</h3>
                <p className="text-[11px] text-slate-500">Edit Markdown templates for automated lifecycle events.</p>
              </div>
              <button
                type="button"
                onClick={handleResetTemplate}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                title="Reset to Factory Corporate Default"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['confirmation', 'reminder', 'change', 'cancellation'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Available Placeholder Chips */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Click Token to Insert:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {standardPlaceholders.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => insertVariable(p)}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[10px] font-mono hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    +{`{${p}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Markdown Text Area */}
            <textarea
              rows={8}
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Enter Telegram Markdown template..."
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingTemplate ? 'Saving...' : 'Save Template'}</span>
              </button>
            </div>
          </div>

          {/* Right: Real-time Live Telegram Message Preview (5 cols) */}
          <div className={`lg:col-span-5 ${cardStyles.base} p-5 space-y-3 h-fit`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Telegram Client Preview</span>
              </div>
              {loadingPreview && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
            </div>

            {/* Telegram Chat Simulation Bubble */}
            <div className="p-4 rounded-2xl bg-[#54a0ff]/10 border border-sky-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  CB
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{config.bot_username || 'CodeBridges Bot'}</p>
                  <p className="text-[9px] text-slate-400">bot</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans shadow-2xs leading-relaxed">
                {previewContent || 'Previewing message...'}
              </div>

              <p className="text-[10px] text-right text-slate-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
