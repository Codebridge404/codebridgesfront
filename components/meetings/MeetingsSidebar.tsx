'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarClock,
  Calendar,
  DoorOpen,
  FileText,
  PlusCircle,
  Building2,
  BarChart3,
  Tablet,
  Package,
  UserCheck,
  CheckSquare,
  ShieldAlert,
  Sliders,
  Settings,
  User,
  ChevronRight,
} from 'lucide-react';
import { getAuthUser, getRoleDisplayName } from '@/lib/api';
import { getMeetingsApi, getMyActionItemsApi } from '@/lib/api/meetings';

interface MeetingsSidebarProps {
  sidebarOpen: boolean;
  onOpenBookingModal?: () => void;
}

export function MeetingsSidebar({ sidebarOpen, onOpenBookingModal }: MeetingsSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('My Workspace');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0);

  const syncState = () => {
    const authUser = getAuthUser();
    setUser(authUser);
    setOrgName(localStorage.getItem('active_org') || authUser?.tenant_name || 'My Workspace');
  };

  const loadBadges = async () => {
    try {
      const [meetingsRes, actionsRes] = await Promise.allSettled([
        getMeetingsApi(),
        getMyActionItemsApi(),
      ]);

      if (meetingsRes.status === 'fulfilled') {
        const d = meetingsRes.value?.data ?? meetingsRes.value;
        if (Array.isArray(d)) {
          const pending = d.filter((m: any) => m.status === 'pending_approval').length;
          setPendingApprovalsCount(pending);
        }
      }

      if (actionsRes.status === 'fulfilled' && actionsRes.value?.data) {
        if (Array.isArray(actionsRes.value.data)) {
          const pending = actionsRes.value.data.filter((a: any) => a.status !== 'completed').length;
          setPendingActionsCount(pending);
        }
      }
    } catch {
      // silently handle
    }
  };

  useEffect(() => {
    syncState();
    loadBadges();

    const handleOrgChange = () => {
      syncState();
      loadBadges();
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    const interval = setInterval(loadBadges, 25000);

    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      clearInterval(interval);
    };
  }, []);

  const roleName = getRoleDisplayName(user || 'employee', orgName);
  const avatarUrl = user?.avatar_url || user?.profile_image_url || null;
  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';

  const navLinks = [
    { title: "Today's Agenda", href: '/meetings', icon: CalendarClock },
    { title: 'Schedule Matrix', href: '/meetings/schedule', icon: Calendar },
    {
      title: 'Boardroom Approvals',
      href: '/meetings/approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-black',
    },
    { title: 'Room Fleet', href: '/meetings/rooms', icon: DoorOpen },
    { title: 'Equipment Logistics', href: '/meetings/equipment', icon: Package },
    { title: 'Support Specialists', href: '/meetings/staff', icon: UserCheck },
    {
      title: 'Action Items & RSVPs',
      href: '/meetings/action-items',
      icon: CheckSquare,
      badge: pendingActionsCount > 0 ? pendingActionsCount : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700 font-black',
    },
    { title: 'Minutes & MOM', href: '/meetings/minutes', icon: FileText },
    { title: 'Space Analytics', href: '/meetings/analytics', icon: BarChart3 },
    { title: 'Setting', href: '/meetings/settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-full bg-transparent border-r border-slate-300/80 transition-all duration-300 flex flex-col justify-between p-2.5 select-none shrink-0 overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      <div className={`space-y-4 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
        {/* Quick Booking Action Button */}
        {onOpenBookingModal && (
          sidebarOpen ? (
            <button
              type="button"
              onClick={onOpenBookingModal}
              className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-indigo-200 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Meeting Room</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenBookingModal}
              title="Book Meeting Room"
              className="w-11 h-10 mx-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          )
        )}

        {/* Navigation Sections */}
        <div className={`space-y-1 w-full overflow-y-auto`}>
          {sidebarOpen ? (
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
              Conference Workspace
            </p>
          ) : (
            <div className="h-px bg-slate-200/60 my-2 mx-1" />
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={!sidebarOpen ? link.title : undefined}
                className={`flex items-center ${
                  sidebarOpen ? 'justify-between px-3' : 'justify-center px-0 w-11 h-10 mx-auto'
                } py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className={`flex items-center ${sidebarOpen ? 'gap-2.5 min-w-0' : 'justify-center'}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {sidebarOpen && <span className="truncate">{link.title}</span>}
                </div>
                {sidebarOpen && link.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : link.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Interactive User Profile Mini-Card */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2 mt-4 shrink-0">
        {sidebarOpen ? (
          <>
            {/* User Profile Mini-Card */}
            <Link
              href="/profile"
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 flex items-center gap-2.5 transition-all cursor-pointer group"
              title="Manage Your Profile Settings"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {userInitials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {user?.name || 'My Profile'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{roleName}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
            </Link>

            {/* Digital Door Signage Kiosk Button */}
            <Link
              href="/meetings/room-display/1"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
              title="Digital Door Signage Kiosk Mode"
            >
              <Tablet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Door Signage Kiosk</span>
            </Link>

            <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-500" /> Zero-Conflict Conference Engine
            </p>
          </>
        ) : (
          <div className="flex justify-center" title={user?.name || 'My Profile'}>
            <Link
              href="/profile"
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/80 hover:border-indigo-300 transition-colors"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {userInitials}
                </div>
              )}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
