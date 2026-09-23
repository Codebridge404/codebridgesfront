'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HrmTabPanels } from './dashboard';
import { UserPlus, Sparkles, Plus } from 'lucide-react';
import { getEmployeesApi, getUsersApi } from '@/lib/api';

function HrmManagementViewContent({ initialTab }: { initialTab?: string } = {}) {
  const searchParams = useSearchParams();
  const currentTab = initialTab || searchParams?.get('tab') || 'overview';
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [staffCount, setStaffCount] = useState(0);
  const [grossPayroll, setGrossPayroll] = useState(0);
  const [rolesCount, setRolesCount] = useState({
    directors: 0,
    managers: 0,
    staff: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingMetrics(true);
        const [empRes, usersRes] = await Promise.allSettled([
          getEmployeesApi(),
          getUsersApi(),
        ]);

        let count = 0;
        let salarySum = 0;
        if (empRes.status === 'fulfilled') {
          const empList = Array.isArray(empRes.value?.data)
            ? empRes.value.data
            : empRes.value?.data?.data || [];
          count = empList.length;
          salarySum = empList.reduce(
            (acc: number, item: any) => acc + (parseFloat(item.salary) || 0),
            0
          );
        }
        setStaffCount(count);
        setGrossPayroll(salarySum);

        if (usersRes.status === 'fulfilled') {
          const uList = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value?.data || [];
          let directors = 0;
          let managers = 0;
          let staff = 0;

          uList.forEach((u: any) => {
            const r = (u.role || u.role_name || '').toLowerCase();
            if (r === 'customer' || r === 'client' || r === 'guest') return;
            if (r.includes('admin') || r.includes('director') || r.includes('owner')) directors++;
            else if (r.includes('manager') || r.includes('supervisor')) managers++;
            else if (r.includes('cashier') || r.includes('clerk') || r.includes('accountant') || r.includes('staff')) staff++;
          });

          setRolesCount({ directors, managers, staff });
        }
      } catch (err) {
        console.error('Failed to load HRM overview metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    loadData();
  }, [currentTab]);

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
            href="/hrm/employees"
            className="px-4 py-2.5 rounded-xl bg-white text-brand font-extrabold text-xs shadow-sm hover:bg-brand-subtle transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-brand" />
            <span>Add Employee</span>
          </Link>
          <Link
            href="/hrm/departments"
            className="px-4 py-2.5 rounded-xl bg-purple-600/60 hover:bg-purple-600 border border-purple-400 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Departments</span>
          </Link>
        </div>
      </div>

      {/* 2. Tab Panel Rendering */}
      <HrmTabPanels
        currentTab={currentTab}
        loadingMetrics={loadingMetrics}
        staffCount={staffCount}
        grossPayroll={grossPayroll}
        rolesCount={rolesCount}
        settingsSaved={settingsSaved}
        setSettingsSaved={setSettingsSaved}
      />
    </div>
  );
}

export function HrmManagementView(props: { initialTab?: string } = {}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400 font-bold">
          Loading HR &amp; Workforce Suite...
        </div>
      }
    >
      <HrmManagementViewContent {...props} />
    </Suspense>
  );
}
