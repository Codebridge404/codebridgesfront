/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Mail,
  Phone,
  Flame,
  Plus,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { getCrmLeadsApi, createCrmLeadApi, Lead } from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

export function LeadsInboxCard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    score: 'Warm (70)',
    source: 'Web Form',
    notes: '',
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await getCrmLeadsApi();
      const list = Array.isArray(res?.data) ? res.data : [];
      setLeads(list);
    } catch (err) {
      console.error('Failed to load CRM leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createCrmLeadApi(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        score: 'Warm (70)',
        source: 'Web Form',
        notes: '',
      });
      setToastMessage('Inbound lead captured successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      loadLeads();
    } catch (err: any) {
      alert(err?.message || 'Failed to capture lead.');
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Inbound Leads Inbox</h3>
            <p className="text-xs text-slate-500 font-medium">Scored leads ready for sales qualification</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-subtle text-brand border border-brand/20">
            {leads.length} Received
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-lg bg-brand-subtle hover:bg-brand-subtle/80 text-brand transition-colors cursor-pointer"
            title="Add Lead"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
          <span>Loading inbound leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 font-medium space-y-1">
          <p>No new inbound leads received for this organization.</p>
          <p className="text-[11px] text-slate-300">New customer inquiries via web form or store walk-ins will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <div key={lead.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 truncate">{lead.name}</span>
                  {lead.company && (
                    <span className="text-[10px] font-bold text-slate-500 font-mono">({lead.company})</span>
                  )}
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                      String(lead.score || '').includes('Hot')
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {lead.score || 'Warm'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{lead.email || 'No email'}</span>
                  <span>•</span>
                  <span>{lead.phone || 'No phone'}</span>
                  <span>•</span>
                  <span>{lead.source || 'Direct'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
      {isModalOpen && (
        <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand" />
                <span>Capture Inbound Lead</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vannak Heng"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Business</label>
                <input
                  type="text"
                  placeholder="e.g. Battambang Organic Produce"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+855 12 884 921"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="lead@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Score</label>
                  <select
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
                  >
                    <option value="Hot (95)">Hot (95) - High Urgency</option>
                    <option value="Warm (70)">Warm (70) - Qualified Interest</option>
                    <option value="Cold (40)">Cold (40) - Discovery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inbound Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
                  >
                    <option value="Web Form">Web Form</option>
                    <option value="Referral">Customer Referral</option>
                    <option value="Store Walk-in">Store Walk-in</option>
                    <option value="Exhibition">Exhibition / Event</option>
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-extrabold shadow-md shadow-brand/20 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div></Portal>
      )}
    </div>
  );
}
