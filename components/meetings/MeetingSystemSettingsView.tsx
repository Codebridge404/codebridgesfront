'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Send,
  Wrench,
  Clock,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import {
  getMeetingSystemSettingsApi,
  updateMeetingSystemSettingsBatchApi,
  resetMeetingSystemSettingsApi,
  getMeetingIssuesApi,
  updateMeetingIssueStatusApi,
  MeetingIssueItem,
} from '@/lib/api/meetings';
import { MeetingTelegramSettings } from './MeetingTelegramSettings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingSystemSettingsView() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'governance' | 'telegram' | 'issues'>('governance');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Record<string, any>>({
    'booking.operating_hours_start': '08:00',
    'booking.operating_hours_end': '19:00',
    'booking.allow_weekend_booking': false,
    'booking.buffer_minutes': 15,
    'booking.approval_threshold_capacity': 20,
    'booking.auto_cancel_unattended_minutes': 15,
  });

  // Facility Issues state
  const [issues, setIssues] = useState<MeetingIssueItem[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getMeetingSystemSettingsApi();
      if (res?.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      toast.error('Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await getMeetingIssuesApi();
      if (res?.data) {
        setIssues(res.data);
      }
    } catch {
      toast.error('Failed to load facility issues.');
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadIssues();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMeetingSystemSettingsBatchApi(settings);
      if (res?.status === 'success') {
        toast.success('Dynamic governance policies updated successfully!');
      } else {
        throw new Error(res?.message || 'Update failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Reset all policies to factory corporate defaults?')) return;
    setSaving(true);
    try {
      const res = await resetMeetingSystemSettingsApi();
      if (res?.status === 'success') {
        toast.success('Settings reset to system defaults.');
        loadSettings();
      }
    } catch {
      toast.error('Failed to reset settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateIssueStatus = async (issueId: number, status: string) => {
    const notes = prompt(`Resolution notes for status "${status}":`, '');
    if (notes === null) return;
    try {
      const res = await updateMeetingIssueStatusApi(issueId, status, notes);
      if (res?.status === 'success') {
        toast.success(`Defect ticket marked as ${status}.`);
        loadIssues();
      }
    } catch {
      toast.error('Failed to update issue ticket.');
    }
  };

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {/* Header Banner */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Runtime Governance &amp; Administration
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Adaptive Dynamic Policies</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Meeting System Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure dynamic operating hours, boardroom capacity gates, Telegram alerts, and facility defects.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('governance')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Governance</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('telegram')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'issues'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Room Defects ({issues.filter((i) => i.status === 'reported').length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DYNAMIC GOVERNANCE */}
      {activeTab === 'governance' && (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className={`${cardStyles.base} p-6 space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Operating Hours &amp; Booking Boundaries</span>
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Enforced in Booking Wizard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Daily Operating Start Time</label>
                <input
                  type="time"
                  value={settings['booking.operating_hours_start']}
                  onChange={(e) =>
                    setSettings({ ...settings, 'booking.operating_hours_start': e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">Earliest time slots available for meetings.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Daily Operating End Time</label>
                <input
                  type="time"
                  value={settings['booking.operating_hours_end']}
                  onChange={(e) =>
                    setSettings({ ...settings, 'booking.operating_hours_end': e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">Latest time when meeting slots must terminate.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Turnaround Buffer Minutes</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={settings['booking.buffer_minutes']}
                  onChange={(e) =>
                    setSettings({ ...settings, 'booking.buffer_minutes': Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">Cleaning &amp; restock gap enforced between consecutive meetings.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Auto-Cancel Unattended Sessions (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={settings['booking.auto_cancel_unattended_minutes']}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      'booking.auto_cancel_unattended_minutes': Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">Releases room if organizer does not check in via door display.</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings['booking.allow_weekend_booking'])}
                  onChange={(e) =>
                    setSettings({ ...settings, 'booking.allow_weekend_booking': e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Allow Weekend Reservations</p>
                  <p className="text-[11px] text-slate-500">
                    If disabled, users cannot select Saturdays or Sundays in the booking calendar.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Boardroom Gate Section */}
          <div className={`${cardStyles.base} p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Executive Boardroom Approval Threshold Gate</span>
              </h2>
              <span className="text-xs text-amber-600 font-bold">Policy Protection</span>
            </div>

            <div className="max-w-md space-y-1 text-xs">
              <label className="font-bold text-slate-700">Capacity Approval Threshold (Seats)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={settings['booking.approval_threshold_capacity']}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      'booking.approval_threshold_capacity': Number(e.target.value),
                    })
                  }
                  className="w-28 p-2.5 rounded-xl border border-slate-200 outline-hidden font-bold text-center"
                />
                <span className="text-slate-500 font-medium">
                  Seats or more triggers mandatory Boardroom Approval triage.
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Any conference room with capacity greater than or equal to this threshold will not be instantly confirmed, but routed to the executive queue.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Defaults</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Policies...' : 'Save Governance Policies'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: TELEGRAM ALERTS */}
      {activeTab === 'telegram' && <MeetingTelegramSettings />}

      {/* TAB 3: FACILITY DEFECT ISSUES INBOX */}
      {activeTab === 'issues' && (
        <div className={`${cardStyles.base} p-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Reported In-Room Defects &amp; Facility Issues ({issues.length})</span>
            </h2>
            <button
              type="button"
              onClick={loadIssues}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Refresh Tickets
            </button>
          </div>

          {loadingIssues ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              Loading defect tickets...
            </div>
          ) : issues.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">All conference facilities in pristine condition!</p>
              <p className="text-[11px] text-slate-400">No open hardware or facility defects reported.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{issue.room_name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {issue.category.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          issue.priority === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : issue.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium">{issue.description}</p>
                    <p className="text-[10px] text-slate-400">
                      Reported {new Date(issue.created_at).toLocaleString()} by {issue.reporter_name || 'Kiosk Guest'}
                    </p>
                    {issue.resolution_notes && (
                      <p className="text-[10px] text-emerald-700 font-semibold italic">
                        Resolution: {issue.resolution_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                        issue.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : issue.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {issue.status}
                    </span>

                    {issue.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateIssueStatus(issue.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
