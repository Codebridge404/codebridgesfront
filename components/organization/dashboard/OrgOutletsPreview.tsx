'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Plus, MapPin, ArrowRight } from 'lucide-react';
import { cardStyles, buttonStyles } from '@/lib/theme';

interface OrgOutletsPreviewProps {
  outlets: any[];
  loading?: boolean;
}

export function OrgOutletsPreview({ outlets, loading }: OrgOutletsPreviewProps) {
  const displayOutlets = outlets.slice(0, 4);

  return (
    <div className={`${cardStyles.base} p-6 sm:p-7 flex flex-col justify-between space-y-4`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-black text-slate-900">Store Outlets &amp; Hubs</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
              {outlets.length}
            </span>
          </div>
          <Link
            href="/organization/outlets"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Manage Store Outlets"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">Loading store locations...</div>
        ) : displayOutlets.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">No store outlets registered yet.</p>
            <Link
              href="/organization/outlets"
              className={buttonStyles.primary}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Store</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayOutlets.map((outlet) => (
              <div
                key={outlet.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-900 truncate">{outlet.name}</p>
                    {outlet.code && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-[9px] font-mono font-bold text-slate-700">
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

      <div className="pt-3 border-t border-slate-100">
        <Link
          href="/organization/outlets"
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand transition-colors"
        >
          <span>Manage All Store Locations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
