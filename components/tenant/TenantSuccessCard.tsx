'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Building2, ShieldCheck } from 'lucide-react';

interface TenantSuccessCardProps {
  registeredTenant: {
    name: string;
    company_code: string;
    client_tier?: string;
  };
  onLaunchHub: () => void;
  onEnterAdmin: () => void;
}

export function TenantSuccessCard({
  registeredTenant,
  onLaunchHub,
  onEnterAdmin,
}: TenantSuccessCardProps) {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.06)] p-6 sm:p-8">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Organization Workspace Created
          </h2>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Your <span className="text-brand font-black">{registeredTenant.name}</span> organization has been provisioned successfully. You can now enable and launch system modules.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 sm:p-5 text-left space-y-3 text-xs shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand" />
              Company Code
            </span>
            <span className="font-mono font-black text-brand bg-brand-subtle px-2.5 py-0.5 rounded-lg border border-brand/20">
              {registeredTenant.company_code}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Workspace Status
            </span>
            <span className="font-extrabold text-emerald-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Workspace
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onLaunchHub}
            className="w-full py-3.5 rounded-2xl bg-brand hover:bg-brand-hover active:scale-98 text-white font-black text-xs shadow-lg shadow-brand/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch App Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onEnterAdmin}
            className="w-full py-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200/60"
          >
            Enter Organization Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
