'use client';

import React from 'react';
import Link from 'next/link';
import { AppIcons } from '@/components/ui/icons';

interface TenantSetupHeaderProps {
  currentUser?: any | null;
  backUrl?: string;
  backLabel?: string;
}

export function TenantSetupHeader({
  currentUser,
  backUrl = '/launchpad',
  backLabel = 'Back to Onboarding Hub',
}: TenantSetupHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto shadow-xs">
      {/* Brand Identity */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center text-white shadow-md shadow-brand/20 group-hover:scale-105 transition-transform">
          <AppIcons.Billing className="w-4 h-4 text-white" />
        </div>
        <span className="text-slate-900 font-black text-lg tracking-tight group-hover:text-brand transition-colors">
          CodeBridges
        </span>
        <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          SaaS Platform
        </span>
      </Link>

      {/* Dynamic Navigation Action */}
      {currentUser ? (
        <Link
          href={backUrl}
          className="text-slate-600 hover:text-brand text-xs font-bold transition-colors flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer shadow-2xs"
        >
          <AppIcons.Back className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="text-slate-600 hover:text-brand text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Already have an account? Sign in</span>
          <AppIcons.Forward className="w-3.5 h-3.5" />
        </Link>
      )}
    </header>
  );
}
