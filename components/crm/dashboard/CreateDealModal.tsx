/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { Briefcase, X, Loader2 } from 'lucide-react';
import { Deal } from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

export interface StageOption {
  key: string;
  label: string;
}

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  stages: StageOption[];
  formData: {
    title: string;
    company: string;
    value: string;
    stage: Deal['stage'];
    probability: number;
    owner_name: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      company: string;
      value: string;
      stage: Deal['stage'];
      probability: number;
      owner_name: string;
    }>
  >;
}

export function CreateDealModal({
  isOpen,
  onClose,
  onSubmit,
  saving,
  stages,
  formData,
  setFormData,
}: CreateDealModalProps) {
  if (!isOpen) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand" />
            <span>New Sales Opportunity Deal</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. POS Hardware Bundle & Annual License"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
            <input
              type="text"
              placeholder="e.g. Angkor Gourmet Bistro Group"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Deal Value ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="8400.00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as Deal['stage'] })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
              >
                {stages.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Owner / Rep</label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Deal</span>
            </button>
          </div>
        </form>
      </div>
    </div></Portal>
  );
}
