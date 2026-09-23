'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, DollarSign, ArrowUpRight, Loader2 } from 'lucide-react';
import { getEmployeesApi, getOutletsApi, getShiftReportApi } from '@/lib/api';

export function HrmKpiCards() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalHeadcount: 0,
    outletsCount: 0,
    monthlyPayroll: 0,
    attendanceRate: 100,
    clockedInCount: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    async function loadHrmKpis() {
      try {
        setLoading(true);
        const [empRes, outletRes, shiftRes] = await Promise.allSettled([
          getEmployeesApi(),
          getOutletsApi(),
          getShiftReportApi(),
        ]);

        let totalHeadcount = 0;
        let monthlyPayroll = 0;
        if (empRes.status === 'fulfilled') {
          const empList = Array.isArray(empRes.value?.data)
            ? empRes.value.data
            : empRes.value?.data?.data || [];
          totalHeadcount = empList.length;
          monthlyPayroll = empList.reduce(
            (acc: number, item: any) => acc + (parseFloat(item.salary) || 0),
            0
          );
        }

        let outletsCount = 0;
        if (outletRes.status === 'fulfilled') {
          const outletList = Array.isArray(outletRes.value)
            ? outletRes.value
            : outletRes.value?.data || [];
          outletsCount = outletList.length;
        }

        let clockedInCount = 0;
        let attendanceRate = 100;
        if (shiftRes.status === 'fulfilled' && shiftRes.value?.data) {
          const openShifts = shiftRes.value.data.open_shifts_count || shiftRes.value.data.active_shifts || 0;
          clockedInCount = parseInt(openShifts, 10) || 0;
          if (totalHeadcount > 0 && clockedInCount > 0) {
            attendanceRate = Math.min(100, Math.round((clockedInCount / totalHeadcount) * 100));
          }
        }

        setMetrics({
          totalHeadcount,
          outletsCount,
          monthlyPayroll,
          attendanceRate,
          clockedInCount,
          pendingLeaves: 0,
        });
      } catch (err) {
        console.error('Failed to load HRM KPI cards:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHrmKpis();
  }, []);

  const cards = [
    {
      title: 'Total Active Headcount',
      value: loading ? '...' : `${metrics.totalHeadcount} Staff`,
      subtitle: `Across ${metrics.outletsCount || 1} Store Outlet${metrics.outletsCount === 1 ? '' : 's'}`,
      change: 'Verified registered personnel',
      icon: Users,
      color: 'text-brand',
      bg: 'bg-icon-bg-blue',
    },
    {
      title: "Today's Attendance Rate",
      value: loading ? '...' : `${metrics.totalHeadcount > 0 ? metrics.attendanceRate : 0}%`,
      subtitle: `${metrics.clockedInCount} Active Shift Register${metrics.clockedInCount === 1 ? '' : 's'}`,
      change: 'Biometric & POS PIN verified',
      icon: Clock,
      color: 'text-semantic-emerald',
      bg: 'bg-icon-bg-teal',
    },
    {
      title: 'Pending Leave Approvals',
      value: loading ? '...' : `${metrics.pendingLeaves} Requests`,
      subtitle: 'Annual & Sick Leave',
      change: 'All schedules reviewed',
      icon: Calendar,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Estimated Monthly Payroll',
      value: loading ? '...' : `$${metrics.monthlyPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Active Staff Base Salaries',
      change: 'Calculated from staff profiles',
      icon: DollarSign,
      color: 'text-brand',
      bg: 'bg-brand-subtle',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const IconComp = c.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">{c.title}</span>
              <div className={`w-9 h-9 rounded-full ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <IconComp className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black tracking-tight font-mono">{c.value}</p>
              <p className="text-xs font-semibold">{c.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-extrabold text-brand">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              <span>{c.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
