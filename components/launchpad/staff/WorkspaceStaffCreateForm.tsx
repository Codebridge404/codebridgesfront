'use client';

import React, { useState } from 'react';
import { UserPlus, KeyRound, Shield, Store, Mail, User, Lock, Phone, AlertCircle } from 'lucide-react';
import { createUserApi } from '@/lib/api';
import { buttonStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export const AVAILABLE_ROLES = [
  { value: 'cashier', label: 'Cashier', description: 'POS register checkout, cash shifts & receipt issuance' },
  { value: 'supervisor', label: 'Store Supervisor', description: 'Void overrides, till safe drops & operational approvals' },
  { value: 'outlet_manager', label: 'Store / Outlet Manager', description: 'Store branch oversight, inventory & shift reconciliations' },
  { value: 'inventory_clerk', label: 'Inventory Clerk', description: 'Stock intakes, branch transfers & purchase orders' },
  { value: 'accountant', label: 'Accountant', description: 'General ledger, expense entries & financial reporting' },
  { value: 'meeting_organizer', label: 'Meeting Coordinator', description: 'Room bookings, equipment tracking & agenda scheduling' },
  { value: 'employee', label: 'General Employee', description: 'Basic workspace member with personal profile access' },
  { value: 'organization', label: 'Organization Administrator', description: 'Full tenant admin capabilities & workspace configuration' },
];

interface WorkspaceStaffCreateFormProps {
  outlets: any[];
  availableRoles: Array<{ value: string; label: string; description?: string }>;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export function WorkspaceStaffCreateForm({
  outlets,
  availableRoles,
  onSuccess,
  onCancel,
}: WorkspaceStaffCreateFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    outlet_id: '',
    pin_code: '1234',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const isCashierOrSupervisor = formData.role === 'cashier' || formData.role === 'supervisor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCashierOrSupervisor && formData.pin_code && !/^\d{4}$/.test(formData.pin_code)) {
      setPinError('PIN must be exactly 4 numeric digits.');
      return;
    }
    setPinError(null);

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        outlet_id: formData.outlet_id || undefined,
        phone: formData.phone.trim() || undefined,
      };

      if (isCashierOrSupervisor) {
        payload.pin_code = formData.pin_code || '1234';
      }

      const res = await createUserApi(payload);
      if (res?.status === 'success' || res?.data) {
        onSuccess(`Staff member ${formData.name} created successfully!`);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'cashier',
          outlet_id: '',
          pin_code: '1234',
          phone: '',
        });
      } else {
        toast.error(res?.message || 'Failed to create staff account.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Section 1: Staff Identity */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Member Identity &amp; Contact</h3>
            <p className="text-xs text-slate-500 font-medium">Personal profile details and primary contact channels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sokha Chan"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Work Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sokha@store.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +855 12 345 678"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Role & Physical Assignment */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Role &amp; Store Placement</h3>
            <p className="text-xs text-slate-500 font-medium">Select operational role and assign to a physical branch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned Operational Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              {availableRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Store Outlet</label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={formData.outlet_id}
                onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
              >
                <option value="">Global / All Store Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name || `Outlet #${o.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Credentials & POS Register PIN */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Security Credentials &amp; Access</h3>
            <p className="text-xs text-slate-500 font-medium">Initial portal login password and optional frontline register PIN</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isCashierOrSupervisor ? 'sm:grid-cols-2' : ''} gap-4`}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Initial Login Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 alphanumeric characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          {isCashierOrSupervisor && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <span>4-Digit POS Register PIN</span>
                <span className="text-[10px] text-amber-600 font-normal ml-1.5">(Required for quick register login)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={formData.pin_code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, pin_code: val });
                  }}
                  placeholder="e.g. 1234"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
              {pinError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          <span>{submitting ? 'Creating Account...' : 'Save & Grant Staff Access'}</span>
        </button>
      </div>
    </form>
  );
}
