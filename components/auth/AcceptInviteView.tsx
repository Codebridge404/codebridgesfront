'use client';

import React, { Suspense } from 'react';
import { AcceptInviteForm } from './AcceptInviteForm';
import { AuthTechBackground } from './AuthTechBackground';

export function AcceptInviteView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">
          Loading invitation...
        </div>
      }
    >
      <div className="relative min-h-screen bg-canvas flex items-center justify-center font-sans p-4 sm:p-8">
        {/* Cyber-Security Matrix & Interactive Spotlight */}
        <AuthTechBackground />
        <div className="relative z-10 w-full flex items-center justify-center">
          <AcceptInviteForm />
        </div>
      </div>
    </Suspense>
  );
}
