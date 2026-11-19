/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import { getCrmActivitiesApi, createCrmActivityApi, CrmActivity } from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

export function CrmActivityTimeline() {
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'call' as CrmActivity['type'],
    title: '',
    contact: '',
    summary: '',
  });

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await getCrmActivitiesApi();
      const list = Array.isArray(res?.data) ? res.data : [];
      setActivities(list);
    } catch (err) {
      console.error('Failed to load CRM activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createCrmActivityApi(formData);
      setIsModalOpen(false);
      setFormData({
        type: 'call',
        title: '',
        contact: '',
        summary: '',
      });
      setToastMessage('Customer interaction logged successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      loadActivities();
    } catch (err: any) {
      alert(err?.message || 'Failed to log touchpoint.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 relative">
      {toastMessage && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 z-20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">Recent Customer Activity</h3>
          <p className="text-xs text-slate-500 font-medium">Logged calls, proposals, and scheduled follow-ups</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Activity</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Loading activity log...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 font-medium space-y-1">
          <p>No customer interaction logs recorded yet.</p>
          <p className="text-[11px] text-slate-300">Log phone calls, client meetings, or sales notes above.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {activities.map((act) => (
            <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-purple-600">
                    {act.type === 'call' && <Phone className="w-3 h-3" />}
                    {act.type === 'meeting' && <Calendar className="w-3 h-3" />}
                    {act.type === 'email' && <Mail className="w-3 h-3" />}
                    {act.type === 'note' && <MessageSquare className="w-3 h-3" />}
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">{act.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Just now'}
                </span>
              </div>

              {act.contact && (
                <p className="text-xs font-bold text-slate-700">{act.contact}</p>
              )}
              <p className="text-xs text-slate-500 leading-relaxed">{act.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Log Activity Modal */}
      {isModalOpen && (
        <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>Log Customer Touchpoint</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interaction Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CrmActivity['type'] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="call">Phone Call</option>
                  <option value="meeting">In-Person / Video Meeting</option>
                  <option value="email">Email Communication</option>
                  <option value="note">Internal Follow-Up Note</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery Phone Call"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vannak Heng"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interaction Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Discussed multi-outlet requirements, demo scheduled for next week..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-sm flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Touchpoint</span>
                </button>
              </div>
            </form>
          </div>
        </div></Portal>
      )}
    </div>
  );
}
