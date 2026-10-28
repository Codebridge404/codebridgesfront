'use client';

import React from 'react';
import { SYSTEM_VERSION_DISPLAY } from '@/lib/version';

export function PlatformFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 border-t border-slate-200/80 bg-white text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-700">CodeBridges Platform</span>
        <span>&copy; {currentYear} All rights reserved.</span>
      </div>
      <div className="flex items-center gap-4 text-slate-400 font-medium">
        <span>Enterprise Edition</span>
        <span>{SYSTEM_VERSION_DISPLAY}</span>
      </div>
    </footer>
  );
}
