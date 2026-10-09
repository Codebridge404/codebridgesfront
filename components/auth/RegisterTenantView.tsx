'use client';

import React, { Suspense } from 'react';
import { RegisterTenantForm } from './RegisterTenantForm';
import { AuthTechBackground } from './AuthTechBackground';

export function RegisterTenantView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">
          Loading workspace setup...
        </div>
      }
    >
      <div className="relative min-h-screen bg-canvas font-sans text-slate-900 selection:bg-brand selection:text-white">
        {/* Cyber-Security Matrix & Interactive Spotlight */}
        <AuthTechBackground />
        <div className="relative z-10">
          <RegisterTenantForm />
        </div>
      </div>
    </Suspense>
  );
}
