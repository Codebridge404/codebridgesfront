/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Power, X } from 'lucide-react';
import { getPlatformSettings, PlatformSettings } from '@/lib/platformSettings';

export function GlobalMaintenanceBanner() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Read initial settings
    setSettings(getPlatformSettings());

    // Listen for live platform settings updates
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        setDismissed(false);
      }
    };

    window.addEventListener('cb_platform_settings_updated', handleUpdate);
    return () => window.removeEventListener('cb_platform_settings_updated', handleUpdate);
  }, []);

  if (!settings || !settings.isMaintenanceMode || dismissed) {
    return null;
  }

  return (
    <div className="relative z-50 bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
          <Power className="w-3.5 h-3.5 text-white animate-pulse" />
        </div>
        <p className="truncate">
          <strong className="font-black uppercase tracking-wider mr-2">System Maintenance Active:</strong>
          <span>{settings.maintenanceMessage}</span>
          {settings.maintenanceEndAt && (
            <span className="ml-2 opacity-90">
              (Expected completion: {new Date(settings.maintenanceEndAt).toLocaleTimeString()})
            </span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer shrink-0"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

