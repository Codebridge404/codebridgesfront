'use client';

import React from 'react';
import { Settings, CheckCircle2, Save } from 'lucide-react';

interface AccountingAccessTabProps {
  loadingStaff: boolean;
  staffCounts: { accountants: number; clerks: number; auditors: number };
}

export function AccountingAccessTab({ loadingStaff, staffCounts }: AccountingAccessTabProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Accounting Access &amp; RBAC</h3>
          <p className="text-xs text-slate-500 font-medium">Domain-scoped RBAC permissions (module_name = 'accounting')</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-subtle text-brand border border-brand/20">
          Module Scoped
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="font-extrabold text-sm text-slate-900">Chief Accountant / CFO</h4>
          <p className="text-xs text-slate-500">Approve journal adjustments, lock fiscal periods, and generate tax filings.</p>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-bold border border-brand/20">
            {loadingStaff ? '...' : `${staffCounts.accountants} Assigned`}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="font-extrabold text-sm text-slate-900">Accounts Clerk</h4>
          <p className="text-xs text-slate-500">Record vendor bills, issue B2B tax invoices, and reconcile bank statements.</p>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            {loadingStaff ? '...' : `${staffCounts.clerks} Assigned`}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="font-extrabold text-sm text-slate-900">Tax Auditor</h4>
          <p className="text-xs text-slate-500">Read-only audit access to historical journals, vouchers, and VAT returns.</p>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            {loadingStaff ? '...' : `${staffCounts.auditors} Assigned`}
          </span>
        </div>
      </div>
    </div>
  );
}

interface AccountingSettingsTabProps {
  settingsSaved: boolean;
  setSettingsSaved: (v: boolean) => void;
}

export function AccountingSettingsTab({ settingsSaved, setSettingsSaved }: AccountingSettingsTabProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand" />
            <span>Setting</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Fiscal year start month, tax / VAT defaults, and multi-currency rounding</p>
        </div>
        {settingsSaved && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <label className="font-bold text-slate-700">Fiscal Year Start</label>
          <select className="w-full mt-1 p-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800">
            <option value="1">January 1st (Calendar Year)</option>
            <option value="4">April 1st</option>
            <option value="7">July 1st</option>
            <option value="10">October 1st</option>
          </select>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <label className="font-bold text-slate-700">Default Currency &amp; Rounding</label>
          <select className="w-full mt-1 p-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800">
            <option value="USD">USD ($) - 2 Decimal Digits</option>
            <option value="KHR">KHR (៛) - Whole Integer (No Cents)</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2500);
          }}
          className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
}
