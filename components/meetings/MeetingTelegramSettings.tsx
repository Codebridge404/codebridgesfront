'use client';

import React, { useState, useEffect } from 'react';
import { Send, Key, MessageSquare, Bell, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import {
  getMeetingTelegramConfigApi,
  updateMeetingTelegramConfigApi,
  testMeetingTelegramNotificationApi,
  TelegramConfigItem,
} from '@/lib/api';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingTelegramSettings() {
  const toast = useToast();
  const [formData, setFormData] = useState<TelegramConfigItem>({
    bot_token: '',
    chat_id: '',
    is_enabled: false,
    notify_on_booking: true,
    notify_15m_before: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await getMeetingTelegramConfigApi();
      const d = res?.data;
      if (d) {
        setFormData({
          bot_token: d.bot_token || '',
          chat_id: d.chat_id || '',
          is_enabled: Boolean(d.is_enabled),
          notify_on_booking: Boolean(d.notify_on_booking),
          notify_15m_before: Boolean(d.notify_15m_before),
        });
      }
    } catch {
      toast.error('Failed to load Telegram configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMeetingTelegramConfigApi(formData);
      if (res?.status === 'success') {
        toast.success('Telegram alert settings saved successfully!');
      } else {
        toast.error('Failed to save settings.');
      }
    } catch {
      toast.error('Error saving Telegram settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const res = await testMeetingTelegramNotificationApi();
      if (res?.status === 'success') {
        toast.success('Test alert sent to Telegram!');
      } else {
        toast.error(res?.message || 'Telegram test failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with Telegram.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-5 w-full pb-10 font-sans max-w-3xl">
      {/* Header */}
      <div className={`${cardStyles.base} p-6 flex items-center justify-between gap-4`}>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-indigo-600" />
            Telegram Bot Push Notifications
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Broadcast zero-conflict conference bookings and 15-minute countdown reminders directly to your staff group.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className={`${cardStyles.base} p-6 space-y-5 text-xs font-semibold`}>
        {/* Enable Toggle */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-extrabold text-slate-900 text-sm">Activate Telegram Push Service</p>
            <p className="text-slate-500 text-xs">Allow MMS to dispatch meeting notifications to your channel</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_enabled}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Bot Token & Chat ID */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" /> Telegram Bot API Token
            </label>
            <input
              type="password"
              value={formData.bot_token}
              onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
              placeholder="e.g. 7123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Obtained from Telegram @BotFather</p>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Target Chat / Channel ID
            </label>
            <input
              type="text"
              value={formData.chat_id}
              onChange={(e) => setFormData({ ...formData, chat_id: e.target.value })}
              placeholder="e.g. -1001234567890 or @company_meetings"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Notification Rules */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-black uppercase text-slate-400">Notification Triggers</p>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={formData.notify_on_booking}
              onChange={(e) => setFormData({ ...formData, notify_on_booking: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Instant alert upon new conference reservation</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={formData.notify_15m_before}
              onChange={(e) => setFormData({ ...formData, notify_15m_before: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>15-minute countdown reminder before session start</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={testing || !formData.bot_token || !formData.chat_id}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>{testing ? 'Testing...' : 'Send Test Alert'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
