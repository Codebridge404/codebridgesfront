'use client';

import React from 'react';
import { Monitor } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { UniversalModuleLayout } from '@/components/module-shell';
import { getAuthUser } from '@/lib/api';
import { POSSidebar } from '@/components/sidebars/POSSidebar';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Cashiers are restricted exclusively to the frontline Cashier Terminal and Customer Display
  React.useEffect(() => {
    const authUser = getAuthUser();
    const isAllowedForCashier =
      pathname === '/pos/pos-terminal' ||
      pathname.startsWith('/pos/pos-terminal/') ||
      pathname === '/pos/customer-display' ||
      pathname.startsWith('/pos/customer-display/');

    if (authUser?.role === 'cashier' && !isAllowedForCashier) {
      router.replace('/cashier/pos-terminal');
    }
  }, [pathname, router]);

  // Dedicated operational displays (POS Terminal, Customer Display CFD, Kitchen Display KDS)
  // are standalone full-screen interfaces without the outer suite header or module sidebar.
  const isStandalone =
    pathname === '/pos/pos-terminal' ||
    pathname.startsWith('/pos/pos-terminal/') ||
    pathname === '/pos/customer-display' ||
    pathname.startsWith('/pos/customer-display/') ||
    pathname === '/pos/kitchen-display' ||
    pathname.startsWith('/pos/kitchen-display/');

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <UniversalModuleLayout
      currentModuleId="pos"
      moduleTitle="POS Management"
      moduleIcon={Monitor}
      moduleBadge="CORE"
      moduleBadgeColor="bg-brand-subtle text-brand border border-brand-border/40"
      customSidebar={({ sidebarOpen, onToggleSidebar }) => (
        <POSSidebar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />
      )}
      mainClassName="p-1 sm:p-1.5 lg:p-2 h-full flex flex-col overflow-hidden"
    >
      {children}
    </UniversalModuleLayout>
  );
}
