/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0144
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveMediaUrl } from '@/lib/mediaUtils';
import {
  X,
  KeyRound,
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Lock,
  Store,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { OutletSelector } from '@/components/inventory-suite';

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  password?: string;
  role: string;
  tenant_id?: string | number;
  outlet_id: string;
  pin_code: string;
  is_active?: boolean;
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
  tenants?: Array<{ id: string | number; name?: string; company_name?: string }>;
  existingUsers?: any[];
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
  tenants = [],
  existingUsers = [],
}: UserFormModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Check for duplicate email in real time
  const trimmedEmail = formData.email?.trim().toLowerCase();
  const duplicateUser = trimmedEmail
    ? existingUsers.find(
        (u) => u.email?.trim().toLowerCase() === trimmedEmail && String(u.id) !== String(editingUser?.id)
      )
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200/90 font-sans my-8 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center font-bold shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingUser ? 'Edit User Account' : 'Create User Account'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {editingUser
                  ? `Update credentials, RBAC permissions, and organization affiliation for #${editingUser.id}`
                  : 'Provision a new team member with multi-tenant access controls'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Row 1: Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vibol Sen"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-3 ${duplicateUser ? 'text-rose-500' : 'text-slate-400'}`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vibol@codebridge.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-900 focus:outline-none focus:ring-2 transition-all font-mono ${
                    duplicateUser
                      ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-brand/30 focus:border-brand focus:bg-white'
                  }`}
                />
              </div>
              {duplicateUser && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Email already belongs to {duplicateUser.name} ({duplicateUser.role || 'user'}). Duplicates are not allowed.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Phone Number & Optional Assigned Tenant Organization (Super Admin only) */}
          <div className={`grid grid-cols-1 ${tenants && tenants.length > 0 ? 'sm:grid-cols-2' : ''} gap-3.5`}>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+855 12 345 678"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {tenants && tenants.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tenant Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={formData.tenant_id ? String(formData.tenant_id) : ''}
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white cursor-pointer transition-all font-medium"
                  >
                    <option value="">CodeBridges Platform (Global)</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name || t.company_name || `Tenant #${t.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Row 2.5: Profile Avatar Picture */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                Profile Picture URL (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Direct image link (JPG, PNG, WebP)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden select-none">
                <span>{formData.name ? formData.name.substring(0, 2).toUpperCase() : 'US'}</span>
                {resolveMediaUrl(formData.avatar_url) && (
                  <img
                    src={resolveMediaUrl(formData.avatar_url)!}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              <input
                type="url"
                value={formData.avatar_url || ''}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://images.unsplash.com/... or uploaded photo link"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white font-mono text-xs transition-all"
              />
            </div>
          </div>

          {/* Row 3: Assigned Role & 4-Digit PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assigned Role (RBAC) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white capitalize cursor-pointer transition-all font-medium"
                >
                  {dynamicRoles.length > 0 ? (
                    dynamicRoles.map((r) => (
                      <option key={r.id} value={r.slug}>
                        {r.name} {!r.is_system ? '(Custom Role)' : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="super_admin">Platform Super Admin</option>
                      <option value="organization">Organization Owner</option>
                      <option value="admin">Administrator</option>
                      <option value="outlet_manager">Store Manager</option>
                      <option value="cashier">Cashier</option>
                      <option value="inventory_clerk">Stock Clerk</option>
                      <option value="accountant">Accountant</option>
                      <option value="meeting_organizer">Meeting Coordinator</option>
                      <option value="employee">General Employee</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                4-Digit POS PIN Code
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  maxLength={6}
                  value={formData.pin_code}
                  onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                  placeholder="e.g. 1234"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white font-mono transition-all font-bold tracking-widest"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Store Outlet Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assigned Outlet / Branch Location
            </label>
            <OutletSelector
              value={formData.outlet_id}
              onChange={(id) => setFormData({ ...formData, outlet_id: id })}
              showLabel={false}
              autoSelectFirst={true}
              className="w-full [&>div]:w-full [&>div>select]:w-full"
            />
          </div>

          {/* Row 5: Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                {editingUser ? 'Password (Leave blank to keep unchanged)' : 'Initial Password'}
                {!editingUser && <span className="text-rose-500">*</span>}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Min 6 characters</span>
            </label>
            <input
              type="password"
              required={!editingUser}
              minLength={6}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Enter account password'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white font-mono transition-all"
            />
          </div>

          {/* Row 6: Account Status Toggle (Active vs Suspended) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 block text-xs">Account Status</span>
              <span className="text-[11px] text-slate-500">
                {formData.is_active !== false
                  ? 'Account is active and permitted to sign in to platform suites'
                  : 'Account is suspended and locked out of all microservices'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: formData.is_active === false ? true : false })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                formData.is_active !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300'
              }`}
            >
              {formData.is_active !== false ? 'Active' : 'Suspended'}
            </button>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || Boolean(duplicateUser)}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-extrabold text-xs shadow-md shadow-brand/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Processing...' : editingUser ? 'Update Account' : 'Create User Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
