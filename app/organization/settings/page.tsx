'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Save, Check, Globe, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { getAuthUser } from '@/lib/api';

import { cardStyles, buttonStyles, inputStyles } from '@/lib/theme';

export default function OrganizationSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: 'Primary Organization',
    legal_name: 'Primary Organization LLC',
    tax_id: 'US-84920491',
    currency: 'USD',
    timezone: 'America/New_York',
    phone: '+1 (555) 019-2834',
    email: 'admin@organization.com',
    address: '124 Market Street, Suite 400',
    country: 'United States',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);
    const active =
      typeof window !== 'undefined'
        ? localStorage.getItem('active_org') || localStorage.getItem('cb_active_org_name') || authUser?.tenant_name || 'Primary Organization'
        : 'Primary Organization';

    setFormData((prev) => ({
      ...prev,
      name: active,
      legal_name: `${active} LLC`,
      email: authUser?.email || prev.email,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_org', formData.name);
        window.dispatchEvent(new CustomEvent('cb_org_changed', { detail: { orgName: formData.name } }));
      }
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-4 w-full font-sans pb-10 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Organization Profile &amp; Governance</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Configure legal identity, currency, fiscal timezone, and global business parameters for your workspace.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Workspace profile and parameters saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${cardStyles.base} p-6 sm:p-7 space-y-6`}>
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-black text-slate-900">General Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Workspace Display Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Legal Registered Entity Name</label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax ID / VAT Registration Number</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Billing &amp; Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>
          </div>
        </div>

        {/* Currency & Regional */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-black text-slate-900">Regional &amp; Fiscal Standards</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Base Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold cursor-pointer"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="KHR">KHR (៛) - Cambodian Riel</option>
                <option value="SGD">SGD ($) - Singapore Dollar</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Workspace Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold cursor-pointer"
              >
                <option value="America/New_York">Eastern Time (US &amp; Canada) - UTC-5</option>
                <option value="America/Los_Angeles">Pacific Time (US &amp; Canada) - UTC-8</option>
                <option value="Europe/London">London (GMT) - UTC+0</option>
                <option value="Asia/Bangkok">Indochina Time (Bangkok, Phnom Penh) - UTC+7</option>
                <option value="Asia/Singapore">Singapore Time - UTC+8</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className={buttonStyles.primary}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Workspace Parameters'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
