'use client';

import React, { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { AuthTechBackground } from './AuthTechBackground';

export function LoginView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans text-xs text-slate-500 font-bold">
          Loading sign in...
        </div>
      }
    >
      <div className="relative min-h-screen w-full flex items-center justify-center bg-canvas text-slate-900 p-4 font-sans selection:bg-brand selection:text-white">
        {/* Cyber-Security Matrix & Interactive Spotlight */}
        <AuthTechBackground />
        <div className="relative z-10 w-full flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </Suspense>
  );
}
