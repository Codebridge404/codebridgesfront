/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, X } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface StoreFormData {
  name: string;
  code: string;
  phone: string;
  address: string;
  receipt_header: string;
  receipt_footer: string;
}

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStore: any;
  formData: StoreFormData;
  setFormData: React.Dispatch<React.SetStateAction<StoreFormData>>;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  editingStore,
  formData,
  setFormData,
  onSave,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand" />
            {editingStore ? 'Edit Store Location' : 'Register New Store Outlet'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Store / Outlet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Freshmart Toul Kork Branch"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Store Code / Branch ID</label>
              <input
                type="text"
                disabled={Boolean(editingStore)}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="e.g. +855 12 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. St 598, Phnom Penh"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Receipt Header Message</label>
              <input
                type="text"
                value={formData.receipt_header}
                onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={formData.receipt_footer}
                onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold shadow-md shadow-brand/20"
            >
              {saving ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
};
