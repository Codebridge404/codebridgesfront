'use client';

import React from 'react';
import { ToastProvider } from './ToastContext';
import { ConfirmProvider } from './ConfirmContext';
import { LoadingProvider } from './LoadingContext';
import { GlobalMaintenanceBanner } from './GlobalMaintenanceBanner';

export function AppProviders({ children }: { children: React.ReactNode }) {
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
