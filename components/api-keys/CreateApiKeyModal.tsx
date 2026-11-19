/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Key, X } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface CreateApiKeyModalProps {
  showCreateModal: boolean;
  onClose: () => void;
  keyName: string;
  setKeyName: (name: string) => void;
  expiryDays: string;
  setExpiryDays: (days: string) => void;
  selectedPermissions: string[];
  setSelectedPermissions: (perms: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
}

export function CreateApiKeyModal({
  showCreateModal,
  onClose,
  keyName,
  setKeyName,
  expiryDays,
  setExpiryDays,
  selectedPermissions,
  setSelectedPermissions,
  onSubmit,
  creating,
}: CreateApiKeyModalProps) {
  if (!showCreateModal) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cb-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Generate Merchant API Key</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Description / Client Name</label>
            <input
              type="text"
              required
              placeholder="e.g. WooCommerce Sync, External Inventory Bot"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expiration Period</label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="30">30 Days</option>
              <option value="90">90 Days (Recommended)</option>
              <option value="365">1 Year</option>
              <option value="never">Never Expire</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Permission Scopes</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes('*')}
                  onChange={(e) => setSelectedPermissions(e.target.checked ? ['*'] : [])}
                  className="rounded text-brand focus:ring-brand cursor-pointer"
                />
                <span>Full Access (All Microservices &amp; Endpoints)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {creating ? 'Generating...' : 'Generate API Key'}
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
}
