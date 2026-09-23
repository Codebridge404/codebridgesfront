'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, logoutApi } from '@/lib/api';
import { SuperAdminHeader } from '@/components/header/SuperAdminHeader';
import { SuperAdminSidebar } from '@/components/sidebars/SuperAdminSidebar';
import { ImpersonationBanner } from '@/components/ui/ImpersonationBanner';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login?redirect=/super-admin/dashboard');
      return;
    }

    // Enforce strict platform isolation: Only super_admin can access /super-admin/*
    if (currentUser.role !== 'super_admin') {
      if (currentUser.role === 'cashier') {
        router.push('/pos/pos-terminal');
      } else {
        router.push('/launchpad');
      }
      return;
    }

    setUser(currentUser);
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = async () => {
    await logoutApi();
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-canvas text-slate-800 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Verifying Platform Credentials</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Restricting access strictly to authorized Platform Super Administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-canvas text-slate-800 flex flex-col font-sans">
      <ImpersonationBanner />

      <SuperAdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        <Suspense fallback={<aside className="h-full w-64 bg-white border-r border-slate-200" />}>
          <SuperAdminSidebar sidebarOpen={sidebarOpen} userRole="super_admin" />
        </Suspense>

        <main className="flex-1 overflow-y-auto bg-canvas p-1 sm:p-1.5 lg:p-2">
          {children}
        </main>
      </div>
    </div>
  );
}
