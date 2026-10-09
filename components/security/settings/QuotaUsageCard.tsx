'use client';

import React from 'react';
import { Layers } from 'lucide-react';

interface QuotaUsageCardProps {
  quotaData: any;
}

export const QuotaUsageCard: React.FC<QuotaUsageCardProps> = ({ quotaData }) => {
  if (!quotaData) return null;

  return (
    <div className="bg-transparent border border-slate-300/80 rounded-3xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300/60 pb-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" />
            Subscription Plan Resource Quotas
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Active Tier:{' '}
            <span className="font-extrabold text-brand uppercase">
              {quotaData.tenant?.client_tier?.replace('_', ' ')}
            </span>
          </p>
        </div>
        <span className="px-3 py-1 bg-brand-subtle border border-brand/20 text-brand text-xs font-black rounded-xl">
          {quotaData.tenant?.status?.toUpperCase()} STATUS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Users */}
        <div className="p-4 bg-transparent rounded-2xl border border-slate-300/80 space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-slate-700">
            <span>Staff Accounts</span>
            <span className="text-brand">
              {quotaData.quotas?.users?.used} / {quotaData.quotas?.users?.limit}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden border border-slate-300/40">
            <div
              className={`h-full transition-all ${
                quotaData.quotas?.users?.is_exceeded ? 'bg-red-500' : 'bg-brand'
              }`}
              style={{ width: `${Math.min(quotaData.quotas?.users?.percentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {quotaData.quotas?.users?.percentage}% capacity used
          </p>
        </div>

        {/* Outlets */}
        <div className="p-4 bg-transparent rounded-2xl border border-slate-300/80 space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-slate-700">
            <span>Store Outlets</span>
            <span className="text-emerald-600">
              {quotaData.quotas?.outlets?.used} / {quotaData.quotas?.outlets?.limit}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden border border-slate-300/40">
            <div
              className={`h-full transition-all ${
                quotaData.quotas?.outlets?.is_exceeded ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(quotaData.quotas?.outlets?.percentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {quotaData.quotas?.outlets?.percentage}% capacity used
          </p>
        </div>

        {/* Registers */}
        <div className="p-4 bg-transparent rounded-2xl border border-slate-300/80 space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-slate-700">
            <span>POS Registers</span>
            <span className="text-blue-600">
              {quotaData.quotas?.registers?.used} / {quotaData.quotas?.registers?.limit}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden border border-slate-300/40">
            <div
              className={`h-full transition-all ${
                quotaData.quotas?.registers?.is_exceeded ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(quotaData.quotas?.registers?.percentage || 0, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {quotaData.quotas?.registers?.percentage}% capacity used
          </p>
        </div>
      </div>
    </div>
  );
};
