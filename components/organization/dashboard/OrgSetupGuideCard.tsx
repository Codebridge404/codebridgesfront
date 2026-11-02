'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Store,
  Users,
  Layers,
  Settings,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface OrgSetupGuideCardProps {
  outletsCount: number;
  staffCount: number;
  activeModulesCount: number;
  onOpenManageStaff: () => void;
}

export function OrgSetupGuideCard({
  outletsCount,
  staffCount,
  activeModulesCount,
  onOpenManageStaff,
}: OrgSetupGuideCardProps) {
  const steps = [
    {
      step: '1',
      title: 'Store Outlets & Terminals',
      desc: 'Create physical retail branches and POS register terminals.',
      completed: outletsCount > 0,
      badge: outletsCount > 0 ? `${outletsCount} Outlets Active` : 'Setup Required',
      action: (
        <Link
          href="/organization/outlets"
          className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Outlets</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
      icon: Store,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      step: '2',
      title: 'Staff & Dynamic Roles',
      desc: 'Invite store employees and assign permissions (Cashiers, Managers, Accountants).',
      completed: staffCount > 0,
      badge: staffCount > 0 ? `${staffCount} Team Members` : 'Invite Team',
      action: (
        <button
          type="button"
          onClick={onOpenManageStaff}
          className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Assign Staff Roles</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
      icon: Users,
      iconBg: 'bg-brand-subtle text-brand',
    },
    {
      step: '3',
      title: 'Subscribed Service Suites',
      desc: 'Launch your licensed modules (POS, Meeting System MMS, Inventory, HRM).',
      completed: activeModulesCount > 0,
      badge: `${activeModulesCount} Suites Ready`,
      action: (
        <a
          href="#business-suites"
          className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Active Suites</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      ),
      icon: Layers,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      step: '4',
      title: 'Branding & Store Settings',
      desc: 'Configure receipt print headers, dual currencies (USD/KHR), and tax rates.',
      completed: outletsCount > 0,
      badge: outletsCount > 0 ? 'Configured' : 'Defaults Active',
      action: (
        <Link
          href="/organization/settings"
          className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Store Settings</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
      icon: Settings,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-slate-300/80 transition-all space-y-4 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Business Operations Roadmap</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Getting Started
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Essential milestones to operate and scale your enterprise workspace after subscribing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={`setup-step-${st.step}`}
              className={`p-3.5 rounded-2xl border bg-white transition-all flex flex-col justify-between ${
                st.completed
                  ? 'border-emerald-300/80 hover:border-emerald-400'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 font-black text-xs shadow-2xs">
                    {st.step}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      st.completed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {st.completed && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                    <span>{st.badge}</span>
                  </span>
                </div>

                <div className="pt-0.5">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-md ${st.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <span className="truncate">{st.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100/80">
                {st.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
