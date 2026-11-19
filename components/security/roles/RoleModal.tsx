/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Check, Sparkles, RefreshCw } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface PermissionItem {
  id: string;
  name: string;
  group: string;
  description: string;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoleId: string | null;
  roleName: string;
  setRoleName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  selectedPerms: string[];
  onTogglePerm: (id: string) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  groupedPermissions: Record<string, PermissionItem[]>;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  editingRoleId,
  roleName,
  setRoleName,
  description,
  setDescription,
  selectedPerms,
  onTogglePerm,
  onSave,
  saving,
  groupedPermissions,
}) => {
  return (
    <Portal><AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-subtle text-brand">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {editingRoleId ? 'Edit Role Metadata & Scope' : 'Create Custom Enterprise Role'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Role Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Shift Supervisor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Role Description & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what duties and department this role oversees..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                  Initial Permissions Grant ({selectedPerms.length} Selected)
                </label>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                  {Object.entries(groupedPermissions).map(([grp, pList]) => (
                    <div key={grp} className="space-y-1.5">
                      <h5 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                        {grp}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pList.map((p) => {
                          const isChecked = selectedPerms.includes(p.id);
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => onTogglePerm(p.id)}
                              className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                                isChecked
                                  ? 'bg-brand-subtle/70 border-brand/30 text-brand font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-xs leading-tight">{p.name}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {p.description}
                                </p>
                              </div>
                              <span
                                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                  isChecked
                                    ? 'bg-brand text-white'
                                    : 'border border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold shadow-md shadow-brand/20 flex items-center gap-1.5"
                >
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {saving ? 'Saving...' : editingRoleId ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence></Portal>
  );
};
