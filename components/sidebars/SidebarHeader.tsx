'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles } from '@/lib/theme';

interface SidebarHeaderProps {
  orgName: string;
  roleName: string;
  activeShift: any;
  offlineCount: number;
}

export function SidebarHeader({
  orgName,
  roleName,
  activeShift,
  offlineCount,
}: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-slate-300/60 bg-transparent">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-brand text-white flex items-center justify-center font-black shadow-sm shrink-0">
          <AppIcons.Organization className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="font-extrabold text-xs text-slate-900 truncate"
            title={orgName}
          >
            {orgName}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              POS Management System
            </span>
          </div>
        </div>
      </div>

      {/* Context Pill */}
      <div className="mt-3 flex items-center justify-between text-[11px] bg-transparent rounded-xl px-2.5 py-1.5 border border-slate-300/70">
        <span className="font-bold text-slate-600 truncate">{roleName}</span>
        {activeShift ? (
          <span className={badgeStyles.active}>
            Shift Active
          </span>
        ) : (
          <span className={badgeStyles.inactive}>
            Till Closed
          </span>
        )}
      </div>

      {offlineCount > 0 && (
        <div className="mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 rounded-lg px-2 py-1 border border-amber-200 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>{offlineCount} offline sales pending sync</span>
        </div>
      )}
    </div>
  );
}
