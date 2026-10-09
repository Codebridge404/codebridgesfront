'use client';

import React from 'react';
import { X } from 'lucide-react';

interface CreateOrgModalHeaderProps {
  onClose: () => void;
}

export function CreateOrgModalHeader({ onClose }: CreateOrgModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-brand-subtle/60 shrink-0">
      <div className="flex items-center gap-3">
        <img
          src="/module/Workspace.svg"
          alt="Workspace"
          className="w-10 h-10 object-contain shrink-0"
        />
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Create New Workspace
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Instant setup for your store or business
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
