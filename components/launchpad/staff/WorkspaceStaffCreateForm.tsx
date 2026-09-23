'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createUserApi } from '@/lib/api';
import { buttonStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

interface WorkspaceStaffCreateFormProps {
  outlets: any[];
  availableRoles: Array<{ value: string; label: string }>;
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

  const isCashier = formData.role === 'cashier';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        outlet_id: formData.outlet_id || undefined,
        phone: formData.phone || undefined,
      };

      if (isCashier) {
        payload.pin_code = formData.pin_code || '1234';
      }

      const res = await createUserApi(payload);
      if (res?.status === 'success' || res?.data) {
        onSuccess(`Staff member ${formData.name} created successfully!`);
        setFormData({ name: '', email: '', password: '', role: 'cashier', outlet_id: '', pin_code: '1234', phone: '' });
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
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">

      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sokha Chan"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="sokha@store.com"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      {/* Row 2: Role & Outlet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Assigned Role *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Store Outlet</label>
          <select
            value={formData.outlet_id}
            onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">All Outlets / Primary Store</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>{o.name || `Outlet #${o.id}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Password & Conditional POS PIN (Cashiers Only) */}
      <div className={`grid grid-cols-1 ${isCashier ? 'sm:grid-cols-2' : ''} gap-4`}>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min 6 characters"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        {isCashier && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              <span>4-Digit POS Register PIN *</span>
              <span className="text-[10px] text-brand font-normal ml-1.5">(Required for Cashier login)</span>
            </label>
            <input
              type="text"
              maxLength={4}
              required
              value={formData.pin_code}
              onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
              placeholder="e.g. 1234"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-end gap-2.5">
        <button type="button" onClick={onCancel} className={buttonStyles.secondary}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={buttonStyles.primary}>
          <UserPlus className="w-3.5 h-3.5" />
          {submitting ? 'Creating Account...' : 'Save & Grant Staff Access'}
        </button>
      </div>
    </form>
  );
}
