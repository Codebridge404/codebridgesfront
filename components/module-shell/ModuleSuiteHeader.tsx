'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu } from 'lucide-react';
import { getAuthUser, logoutApi, getRoleDisplayName } from '@/lib/api';
import { getMeetingNotificationsApi } from '@/lib/api/meetings';
import { MeetingNotificationsDrawer } from '@/components/meetings/MeetingNotificationsDrawer';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles } from '@/lib/theme';

interface ModuleSuiteHeaderProps {
  currentModuleId: 'pos' | 'crm' | 'hrm' | 'accounting' | 'inventory' | 'organization' | 'meeting-management' | 'meetings' | string;
  moduleTitle: string;
  moduleIcon: any;
  onToggleSidebar?: () => void;
}

export function ModuleSuiteHeader({
  currentModuleId,
  moduleTitle,
  moduleIcon: ModuleIcon,
  onToggleSidebar,
}: ModuleSuiteHeaderProps) {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeOrg, setActiveOrg] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadNotificationsCount = async () => {
    try {
      const res = await getMeetingNotificationsApi();
      if (res?.data && Array.isArray(res.data)) {
        const unread = res.data.filter((n: any) => n.status === 'unread').length;
        setUnreadNotifCount(unread);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const currentUser = getAuthUser();
    setUser(currentUser);
    const storedOrg =
      localStorage.getItem('active_org') ||
      currentUser?.tenant_name ||
      currentUser?.company ||
      'Primary Organization';
    setActiveOrg(storedOrg);

    const handleOrgChange = (e: any) => {
      const newOrg = e.detail?.orgName || localStorage.getItem('active_org') || '';
      setActiveOrg(newOrg);
    };

    window.addEventListener('cb_org_changed', handleOrgChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    loadNotificationsCount();
    const interval = setInterval(loadNotificationsCount, 20000);

    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore
    }
    localStorage.clear();
    router.push('/launchpad');
  };

  const avatarUrl = user?.avatar_url || user?.profile_image_url || null;
  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';

  return (
    <>
      <header className="h-14 px-4 flex items-center justify-between z-30 shrink-0 select-none bg-white border-b border-slate-200/80 shadow-2xs">
        {/* Left: Sidebar Toggle + Active Module Branding */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Current Module Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-subtle border border-brand-border shadow-2xs">
            <ModuleIcon className="w-4 h-4 text-brand" />
            <span className="font-extrabold text-xs text-slate-900">{moduleTitle}</span>
          </div>
        </div>

        {/* Right: Org Picker + Notifications + User Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Workspace Organization Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            <AppIcons.Organization className="w-3.5 h-3.5 text-brand" />
            <span className="truncate max-w-[180px]">{activeOrg}</span>
          </div>

          {/* Interactive Global Notification Bell */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="System &amp; Module Notifications"
          >
            <AppIcons.Bell className="w-4 h-4" />
            {unreadNotifCount > 0 ? (
              <span className="absolute top-1 right-1 px-1 min-w-[15px] h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-2xs">
                {unreadNotifCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-300" />
            )}
          </button>

          {/* User Profile Pill & Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all text-xs cursor-pointer"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-black text-[11px] shadow-2xs shrink-0">
                  {userInitials}
                </div>
              )}
              <span className="font-bold text-slate-800 hidden md:inline truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <AppIcons.Dropdown className="w-3 h-3 text-slate-400" />
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || 'User'}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email || ''}</p>
                    <span className={`inline-block mt-1 ${badgeStyles.brand}`}>
                      {getRoleDisplayName(user, activeOrg)}
                    </span>
                  </div>
                </div>

                {/* Switch Action Block (Go / Switch Back) */}
                <div className="p-1.5 space-y-1">
                  {currentModuleId === 'organization' ? (
                    <Link
                      href="/launchpad"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-3 py-2 rounded-xl bg-brand-subtle hover:bg-purple-100 text-brand border border-brand-border flex items-center gap-2.5 font-bold text-xs transition-colors"
                    >
                      <AppIcons.Compass className="w-4 h-4 text-brand" />
                      <span>Switch to Launchpad</span>
                    </Link>
                  ) : (
                    <>
                      {['organization', 'admin', 'super_admin', 'owner', 'organization_owner', 'manager', 'accountant', 'staff'].includes(user?.role) && (
                        <Link
                          href="/organization/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-xl bg-brand-subtle hover:bg-purple-100 text-brand border border-brand-border flex items-center gap-2.5 font-bold text-xs transition-colors"
                        >
                          <AppIcons.Organization className="w-4 h-4 text-brand" />
                          <span>Organization Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/launchpad"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 font-bold text-xs transition-colors"
                      >
                        <AppIcons.Compass className="w-4 h-4 text-slate-400" />
                        <span>All Apps Launchpad</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'super_admin' && (
                    <Link
                      href="/super-admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-brand hover:bg-brand-subtle flex items-center gap-2.5 transition-colors"
                    >
                      <AppIcons.Security className="w-4 h-4 text-brand" />
                      <span>Super Admin Console</span>
                    </Link>
                  )}
                </div>

                {/* Profile Link (Universal /profile) */}
                <div className="py-1 border-t border-slate-100">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>User Profile Settings</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 font-bold text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <AppIcons.LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Notifications Center Drawer */}
      <MeetingNotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          loadNotificationsCount();
        }}
      />
    </>
  );
}
