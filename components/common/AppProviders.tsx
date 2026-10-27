'use client';

import React from 'react';
import { ToastProvider } from './ToastContext';
import { ConfirmProvider } from './ConfirmContext';
import { LoadingProvider } from './LoadingContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
