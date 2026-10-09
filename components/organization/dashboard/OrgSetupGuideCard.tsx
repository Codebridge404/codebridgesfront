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
  Sparkles,
} from 'lucide-react';
import { cardStyles } from '@/lib/theme';

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
      desc: 'Create store locations, physical branches, and POS cash registers.',
      completed: outletsCount > 0,
      badge: outletsCount > 0 ? `${outletsCount} Outlets Active` : 'Setup Required',
      action: (
        <Link
          href="/organization/outlets"
          className="text-xs font-bold text-brand hover:text-brand-hover inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Branches</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
      icon: Store,
    },
    {
      step: '2',
      title: 'Staff & Dynamic Roles',
      desc: 'Invite store employees and assign permissions (Cashiers, Managers, Accountants).',
      completed: staffCount > 0,
      badge: staffCount > 0 ? `${staffCount} Staff Members` : 'Invite Team',
      action: (
        <button
          type="button"
          onClick={onOpenManageStaff}
          className="text-xs font-bold text-brand hover:text-brand-hover inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Assign Staff Roles</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
      icon: Users,
    },
    {
      step: '3',
      title: 'Subscribed Service Suites',
      desc: 'Launch your licensed modules (POS, Meeting System MMS, Inventory, HRM).',
      completed: activeModulesCount > 0,
      badge: `${activeModulesCount} Modules Active`,
      action: (
        <a
          href="#business-suites"
          className="text-xs font-bold text-brand hover:text-brand-hover inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Active Suites</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      ),
      icon: Layers,
    },
    {
      step: '4',
      title: 'Branding & Store Settings',
      desc: 'Configure receipt print headers, dual currencies (USD/KHR), and tax rates.',
      completed: true,
      badge: 'Ready',
      action: (
        <Link
          href="/organization/settings"
          className="text-xs font-bold text-brand hover:text-brand-hover inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Store Settings</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
      icon: Settings,
    },
  ];

  return (
    <div className={`${cardStyles.base} p-6 sm:p-7 space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center font-bold shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Business Operations Roadmap</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Getting Started
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Four essential steps to operate and scale your enterprise workspace after subscribing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                st.completed
                  ? 'bg-white border-slate-200/90 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs">
                    {st.step}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      st.completed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {st.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                    <span>{st.badge}</span>
                  </span>
                </div>

                <div className="pt-1">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-brand" />
                    <span>{st.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                {st.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
