'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CalendarClock } from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';
import { MeetingsSidebar, MeetingBookingModal } from '@/components/meetings';

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  if (pathname.includes('/room-display/')) {
    return <>{children}</>;
  }


  return (
    <>
      <UniversalModuleLayout
        currentModuleId="meeting-management"
        moduleTitle="Meeting Management Systems"
        moduleIcon={CalendarClock}
        moduleBadge="MMS SUITE"
        moduleBadgeColor="bg-indigo-50 text-indigo-700 border border-indigo-200"
        customSidebar={({ sidebarOpen }) => (
          <MeetingsSidebar
            sidebarOpen={sidebarOpen}
            onOpenBookingModal={() => setBookingModalOpen(true)}
          />
        )}
        mainClassName="p-2 sm:p-3 lg:p-4 max-w-7xl mx-auto"
      >
        {children}
      </UniversalModuleLayout>

      <MeetingBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />
    </>
  );
}
