/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, X, UserCheck } from 'lucide-react';
import { Tenant } from './types';
import { Portal } from '@/components/ui/Portal';

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenant: Tenant | null;
  editForm: any;
  setEditForm: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  actionLoading: boolean;
}

export function EditTenantModal({
  isOpen,
  onClose,
  selectedTenant,
  editForm,
  setEditForm,
  onSubmit,
  actionLoading,
}: EditTenantModalProps) {
  if (!isOpen || !selectedTenant) return null;

  return (
    <Portal><AnimatePresence>
      <div className="fixed inset-0 cb-modal-backdrop z-[9999] flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center font-bold">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Edit Organization &amp; Owner
                </h3>
                <p className="text-xs text-slate-500 font-medium">{selectedTenant.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            {/* Organization Settings */}
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">Organization Settings</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Store Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Tier *</label>
                  <select
                    value={editForm.client_tier}
                    onChange={(e) => setEditForm({ ...editForm, client_tier: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none cursor-pointer"
                  >
                    <option value="free_personal">Personal Solopreneur Free</option>
                    <option value="business_runner">Business Runner Pro</option>
                    <option value="enterprise_org">Enterprise Organization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Outlets</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.max_outlets}
                    onChange={(e) => setEditForm({ ...editForm, max_outlets: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Registers</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.max_registers}
                    onChange={(e) => setEditForm({ ...editForm, max_registers: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Users</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.max_users}
                    onChange={(e) => setEditForm({ ...editForm, max_users: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Owner Profile Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand" />
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-600">
                  Workspace Owner &amp; Administrator
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editForm.owner_name}
                    onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                    placeholder="Owner name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={editForm.owner_email}
                    onChange={(e) => setEditForm({ ...editForm, owner_email: e.target.value })}
                    placeholder="owner@company.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Phone</label>
                  <input
                    type="text"
                    value={editForm.owner_phone}
                    onChange={(e) => setEditForm({ ...editForm, owner_phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold shadow-md shadow-brand/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Update Organization'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence></Portal>
  );
}
