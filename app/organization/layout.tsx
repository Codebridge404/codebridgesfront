'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, logoutApi } from '@/lib/api';
import { AppHeader } from '@/components/header/AppHeader';
import { OrganizationSidebar } from '@/components/sidebars/OrganizationSidebar';
import { ImpersonationBanner, PlatformAnnouncementBanner } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login?redirect=/organization/dashboard');
      return;
    }

    // Cashiers without workspace privileges go straight to POS Terminal
    if (currentUser.role === 'cashier') {
      router.push('/cashier/pos-terminal');
      return;
    }

    // Users without an active tenant organization cannot access organization workspace
    if (!currentUser.tenant_id && currentUser.role !== 'super_admin') {
      router.push('/launchpad');
      return;
    }

    setUser(currentUser);
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = async () => {
    await logoutApi();
    router.push('/launchpad');
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-canvas text-slate-800 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Verifying Workspace Access</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Synchronizing organization workspace credentials and subscribed suites.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent text-slate-800 flex flex-col font-sans">
      <ImpersonationBanner />
      <PlatformAnnouncementBanner />

      <AppHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <Suspense fallback={<aside className="h-full w-64 bg-transparent border-r border-slate-200/80" />}>
          <OrganizationSidebar sidebarOpen={sidebarOpen} userRole={user?.role} />
        </Suspense>

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-transparent p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
