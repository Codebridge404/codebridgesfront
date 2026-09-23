'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, UserPlus, Plus } from 'lucide-react';
import {
  HrmKpiCards,
  AttendanceRateCard,
  LeaveRequestsCard,
  StaffRosterTable,
} from '@/components/hrm/dashboard';

export function HrmDashboard() {
  return (
    <div className="space-y-3 w-full font-sans pb-6 text-slate-900">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-brand via-brand-hover to-brand-active rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Human Resource Management &amp; Payroll</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            HRM &amp; Workforce Operations
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed max-w-2xl">
            Shift rostering, staff clock-in attendance records, leave approvals, salary disbursements, and employment compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/super-admin/hrm/employees"
            className="px-4 py-2.5 rounded-xl bg-white text-brand font-extrabold text-xs shadow-sm hover:bg-brand-subtle transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-brand" />
            <span>Add Employee</span>
          </Link>
          <Link
            href="/super-admin/hrm/departments"
            className="px-4 py-2.5 rounded-xl bg-purple-600/60 hover:bg-purple-600 border border-purple-400 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Departments</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <HrmKpiCards />

      {/* 3. Today's Staff Roster */}
      <StaffRosterTable />

      {/* 4. Attendance & Leave Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceRateCard />
        <LeaveRequestsCard />
      </div>
    </div>
  );
}
