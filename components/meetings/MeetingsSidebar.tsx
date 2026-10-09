'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarClock,
  Calendar,
  DoorOpen,
  FileText,
  Send,
  PlusCircle,
  Building2,
  Users,
  BarChart3,
  Tablet,
} from 'lucide-react';
import { getAuthUser, getRoleDisplayName } from '@/lib/api';

interface MeetingsSidebarProps {
  sidebarOpen: boolean;
  onOpenBookingModal?: () => void;
}

export function MeetingsSidebar({ sidebarOpen, onOpenBookingModal }: MeetingsSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('My Workspace');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUser(getAuthUser());
      setOrgName(localStorage.getItem('active_org') || 'My Workspace');
    }
  }, []);

  if (!sidebarOpen) return null;

  const roleName = getRoleDisplayName(user || 'employee', orgName);

  const navLinks = [
    { title: "Today's Agenda", href: '/meetings', icon: CalendarClock },
    { title: 'Schedule Matrix', href: '/meetings/schedule', icon: Calendar },
    { title: 'Room Fleet', href: '/meetings/rooms', icon: DoorOpen },
    { title: 'Minutes & Actions', href: '/meetings/minutes', icon: FileText },
    { title: 'Space Analytics', href: '/meetings/analytics', icon: BarChart3 },
    { title: 'Telegram & Alerts', href: '/meetings/settings', icon: Send },
  ];


  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 h-[calc(100vh-3.5rem)] sticky top-14 flex flex-col justify-between p-3.5 shadow-xs select-none">
      <div className="space-y-4">
        {/* Workspace Identity Mini-Card */}
        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-wider uppercase text-indigo-600">Meeting Space</p>
            <p className="text-xs font-bold text-slate-900 truncate">{orgName}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{roleName}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-indigo-200/70 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        {/* Quick Booking Action Button */}
        {onOpenBookingModal && (
          <button
            type="button"
            onClick={onOpenBookingModal}
            className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-indigo-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Meeting Room</span>
          </button>
        )}

        {/* Navigation Sections */}
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
            Conference Workspace
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{link.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <Link
          href="/meetings/room-display/1"
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
          title="Digital Door Signage Kiosk Mode"
        >
          <Tablet className="w-3.5 h-3.5 text-indigo-600" />
          <span>Door Signage Kiosk</span>
        </Link>
        <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3 text-indigo-500" /> Zero-Conflict Conference Engine
        </p>
      </div>
    </aside>

  );
}
