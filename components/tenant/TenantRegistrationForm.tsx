'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { PlanTier } from './PlanTierSelector';

export interface TenantFormData {
  workspaceType: 'personal' | 'company';
  fullName: string;
  email: string;
  phone: string;
  country: string;
  name: string;
  taxId: string;
  industry: string;
  address: string;
}

interface TenantRegistrationFormProps {
  selectedPlan?: PlanTier;
  formData: TenantFormData;
  setFormData: React.Dispatch<React.SetStateAction<TenantFormData>>;
  onBackToPlans?: () => void;
  onSelectPlanType: (type: 'personal' | 'company') => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export function TenantRegistrationForm({
  formData,
  setFormData,
  onSelectPlanType,
  onSubmit,
  loading,
  error,
}: TenantRegistrationFormProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/launchpad"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Launchpad</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">
          Organization Setup
        </span>
      </div>

      {/* Main Glassmorphic Form Card */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-6">
        {/* Header & Workspace Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Create Organization Workspace
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Set up your business identity to unlock modules and store operations.
              </p>
            </div>
          </div>

          {/* Workspace Category Switcher */}
          <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 text-xs font-bold shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onSelectPlanType('company')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                formData.workspaceType === 'company'
                  ? 'bg-white text-brand shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlanType('personal')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                formData.workspaceType === 'personal'
                  ? 'bg-white text-brand shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-rose-50/90 backdrop-blur-sm border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Section 1: Store & Organization Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Organization Details
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {formData.workspaceType === 'personal' ? 'Shop / Brand Display Name *' : 'Registered Company Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.workspaceType === 'personal' ? 'e.g. Sokha Coffee Cart' : 'e.g. Dreams Retail Co., Ltd'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {formData.workspaceType === 'company' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industry Category
                  </label>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
                    >
                      <option value="retail">Retail Store & Boutique</option>
                      <option value="cafe_restaurant">Cafe & Restaurant / F&B</option>
                      <option value="wholesale">Wholesale & Supermarket</option>
                      <option value="service">Services & Healthcare</option>
                      <option value="solopreneur">Solopreneur & Pop-up Shop</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tax / VAT ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g. K001-902102938"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-mono shadow-2xs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Operating Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street No, Sangkat/District, Phnom Penh, Cambodia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Country / Currency
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
                >
                  <option value="KH">🇰🇭 Cambodia (USD & KHR)</option>
                  <option value="TH">🇹🇭 Thailand (THB ฿)</option>
                  <option value="VN">🇻🇳 Vietnam (VND ₫)</option>
                  <option value="SG">🇸🇬 Singapore (SGD $)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Administrator Contact */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="w-3.5 h-3.5 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Workspace Administrator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Sokha Chan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sokha@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (ABA / Bakong)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="012 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Submit Action */}
          <motion.button
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-xs text-white shadow-lg shadow-brand/25 bg-brand hover:bg-brand-hover active:bg-brand-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Provisioning Cloud Workspace...</span>
              </>
            ) : (
              <>
                <span>Create Organization Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <p className="text-center text-slate-400 text-[10px] font-medium">
            By creating an organization, you gain access to multi-store fleet management, POS terminals, and inventory suites.
          </p>
        </form>
      </div>
    </div>
  );
}
