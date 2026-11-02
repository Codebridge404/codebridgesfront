'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Plus, MapPin, ArrowRight } from 'lucide-react';

interface OrgOutletsPreviewProps {
  outlets: any[];
  loading?: boolean;
}

export function OrgOutletsPreview({ outlets, loading }: OrgOutletsPreviewProps) {
  const displayOutlets = outlets.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-slate-300/80 transition-all flex flex-col justify-between space-y-3 select-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Store Outlets &amp; Hubs</h3>
              <p className="text-xs text-slate-500 font-medium">Physical registers and retail branches</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80">
              {outlets.length} Active
            </span>
            <Link
              href="/organization/outlets"
              className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Add New Outlet"
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading store locations from live cloud database...
          </div>
        ) : displayOutlets.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 font-medium">No store outlets registered yet.</p>
            <Link
              href="/organization/outlets"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold shadow-xs hover:bg-brand-hover transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Create First Store</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {displayOutlets.map((outlet, idx) => (
              <div
                key={`outlet-preview-${outlet.id ?? idx}-${idx}`}
                className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-3 hover:border-brand/40 transition-all"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-900 truncate">{outlet.name}</p>
                    {outlet.code && (
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[9px] font-mono font-bold text-slate-700">
                        {outlet.code}
                      </span>
                    )}
                  </div>
                  {outlet.address && (
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{outlet.address}</span>
                    </p>
                  )}
                </div>
                {outlet.phone && (
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block shrink-0">
                    {outlet.phone}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <Link
          href="/organization/outlets"
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-brand transition-colors"
        >
          <span>Manage All Store Locations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
