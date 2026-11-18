/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0170 - Global Theme & System Preference Synchronization Provider
 */
'use client';

import React, { useEffect } from 'react';
import { ToastProvider } from './ToastContext';
import { ConfirmProvider } from './ConfirmContext';
import { LoadingProvider } from './LoadingContext';
import { GlobalMaintenanceBanner } from './GlobalMaintenanceBanner';
import {
  applyUserThemePreferences,
  getUserThemePreferences,
} from '@/components/settings/UserSettingsModal';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncTheme = () => {
      applyUserThemePreferences(getUserThemePreferences());
    };

    syncTheme();

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const prefs = getUserThemePreferences();
      if (prefs.theme === 'system') {
        applyUserThemePreferences(prefs);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'cb_user_preferences') {
        syncTheme();
      }
    };

    mediaQuery?.addEventListener?.('change', handleSystemChange);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cb_theme_updated', syncTheme);

    return () => {
      mediaQuery?.removeEventListener?.('change', handleSystemChange);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cb_theme_updated', syncTheme);
    };
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <LoadingProvider>
          <GlobalMaintenanceBanner />
          {children}
        </LoadingProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
