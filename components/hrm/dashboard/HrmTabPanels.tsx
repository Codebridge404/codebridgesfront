'use client';

import React from 'react';
import Link from 'next/link';
import {
  HrmKpiCards,
  AttendanceRateCard,
  LeaveRequestsCard,
  StaffRosterTable,
} from './index';
import {
  FileText,
  BarChart3,
  Settings,
  Plus,
  CheckCircle2,
  Save,
} from 'lucide-react';

interface HrmTabPanelsProps {
  currentTab: string;
  loadingMetrics: boolean;
  staffCount: number;
  grossPayroll: number;
  rolesCount: { directors: number; managers: number; staff: number };
  settingsSaved: boolean;
  setSettingsSaved: (v: boolean) => void;
}

export function HrmTabPanels({
  currentTab,
  loadingMetrics,
  staffCount,
  grossPayroll,
  rolesCount,
  settingsSaved,
  setSettingsSaved,
}: HrmTabPanelsProps) {
  if (currentTab === 'overview') {
    return (
      <div className="space-y-6">
        <HrmKpiCards />
        <StaffRosterTable />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceRateCard />
          <LeaveRequestsCard />
        </div>
      </div>
    );
  }

  if (currentTab === 'roster' || currentTab === 'employees') {
    return (
      <div className="space-y-6">
        <StaffRosterTable />
        <AttendanceRateCard />
      </div>
    );
  }

  if (currentTab === 'attendance') {
    return (
      <div className="space-y-6">
        <AttendanceRateCard />
        <StaffRosterTable />
      </div>
    );
  }

  if (currentTab === 'leaves') {
    return (
      <div className="space-y-6">
        <LeaveRequestsCard />
      </div>
    );
  }

  if (currentTab === 'payroll') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Gross Payroll &amp; Compensation</h3>
            <p className="text-xs text-slate-500 font-medium">Monthly staff disbursements, base salaries, and tax withholdings</p>
          </div>
          <Link
            href="/hrm/employees"
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-active text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Manage Compensation</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Active Salary Contracts</span>
            <p className="text-xl font-black text-slate-900">{loadingMetrics ? '...' : `${staffCount} Staff Members`}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Active payroll profiles</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Net Estimated Disbursement</span>
            <p className="text-xl font-black text-brand font-mono">
              {loadingMetrics ? '...' : `$${grossPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
            <p className="text-[10px] text-brand font-medium">Bank transfer batch ready</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'docs' || currentTab === 'documents') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" />
              <span>Documents &amp; Contracts</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Employment agreements, labor compliance attachments, and identification files</p>
          </div>
          <Link
            href="/hrm/employees"
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-active text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff Contract</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-500">Active Labor Contracts</span>
            <p className="text-2xl font-black text-slate-900 font-mono">{loadingMetrics ? '...' : `${staffCount} Verified Contracts`}</p>
            <p className="text-xs text-slate-400">Registered and active employee profiles</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-500">Contract Compliance Status</span>
            <p className="text-2xl font-black text-emerald-600">100% Up to Date</p>
            <p className="text-xs text-slate-400">All staff profiles comply with labor policies</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'reports') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand" />
              <span>HR Reports</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Headcount turnover rate, overtime spend trends, and attendance punctuality</p>
          </div>
        </div>
        <HrmKpiCards />
      </div>
    );
  }

  if (currentTab === 'access') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">HR Access &amp; RBAC</h3>
            <p className="text-xs text-slate-500 font-medium">Domain-scoped RBAC permissions (module_name = 'hrm')</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-subtle text-brand border border-brand/20">
            Module Scoped
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900">HR Director / Admin</h4>
            <p className="text-xs text-slate-500">Full access to salary ledgers, contract attachments, and employee terminations.</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-bold border border-brand/20">
              {loadingMetrics ? '...' : `${rolesCount.directors} Assigned`}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900">Outlet Manager</h4>
            <p className="text-xs text-slate-500">Approve timesheets, sign off on shift sick leaves, and log performance reviews.</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {loadingMetrics ? '...' : `${rolesCount.managers} Assigned`}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900">Employee Self-Service</h4>
            <p className="text-xs text-slate-500">View personal payslip PDFs, request annual leaves, and clock-in/out.</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {loadingMetrics ? '...' : `${rolesCount.staff} Assigned`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'settings') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand" />
              <span>HR Settings</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Standard working hours, overtime multiplier, and leave allowance policies</p>
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
            <label className="font-bold text-slate-700">Standard Shift Duration</label>
            <select className="w-full mt-1 p-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800">
              <option value="8">8 Hours / Day (Standard)</option>
              <option value="9">9 Hours / Day</option>
              <option value="10">10 Hours / Day (Retail Extended)</option>
            </select>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <label className="font-bold text-slate-700">Overtime Rate Multiplier</label>
            <select className="w-full mt-1 p-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800">
              <option value="1.5">1.5x Base Hourly Rate</option>
              <option value="2.0">2.0x Base Hourly Rate (Sundays/Holidays)</option>
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
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
