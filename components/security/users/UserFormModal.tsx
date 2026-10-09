'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, KeyRound } from 'lucide-react';
import { OutletSelector } from '@/components/inventory-suite';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  outlet_id: string;
  pin_code: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  editingUser: any | null;
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  dynamicRoles: Array<{ id: string; name: string; slug: string; is_system?: boolean }>;
}

export function UserFormModal({
  isOpen,
  editingUser,
  formData,
  setFormData,
  onClose,
  onSubmit,
  saving,
  dynamicRoles,
}: UserFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] space-y-5 border border-slate-200/80"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-lg">
            {editingUser ? 'Edit User Account' : 'Add New Staff Account'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sokha Chan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-all"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sokha@pos.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-all"
            />
          </div>

          {/* Assigned Role & PIN Grid */}
          <div className={`grid ${formData.role === 'cashier' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role (RBAC) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white capitalize cursor-pointer transition-all"
              >
                {dynamicRoles.length > 0 ? (
                  dynamicRoles.map((r) => (
                    <option key={r.id} value={r.slug}>
                      {r.name} {!r.is_system ? '(Custom Role)' : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="organization">Organization Admin</option>
                    <option value="employee">General Employee</option>
                    <option value="cashier">Cashier</option>
                    <option value="inventory_clerk">Stock Clerk</option>
                    <option value="accountant">Accountant</option>
                    <option value="meeting_organizer">Meeting Coordinator</option>
                    <option value="outlet_manager">Store Manager</option>
                  </>
                )}
              </select>
            </div>

            {formData.role === 'cashier' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">4-Digit POS PIN (Cashier)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={formData.pin_code}
                  onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                  placeholder="e.g. 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white font-mono transition-all"
                />
              </div>
            )}
          </div>

          {/* Assigned Outlet */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Outlet</label>
            <OutletSelector
              value={formData.outlet_id}
              onChange={(id) => setFormData({ ...formData, outlet_id: id })}
              showLabel={false}
              autoSelectFirst={true}
              className="w-full [&>div]:w-full [&>div>select]:w-full"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              {editingUser ? 'Password (Leave blank to keep unchanged)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white font-mono transition-all"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-xs shadow-md shadow-brand/20 cursor-pointer transition-all"
            >
              {saving ? 'Saving...' : editingUser ? 'Update Account' : 'Create User Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
