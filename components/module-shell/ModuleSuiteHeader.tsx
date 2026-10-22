'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu, Building2, Settings, Shield, LogOut } from 'lucide-react';
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
  const [activeOrg, setActiveOrg] = useState<string>('CodeBridges');
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
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
      'CodeBridges';
    setActiveOrg(storedOrg);

    const storedLogo =
      localStorage.getItem('cb_active_org_logo') ||
      currentUser?.tenant_logo_url ||
      currentUser?.logo_url ||
      null;
    setOrgLogo(storedLogo);

    const handleOrgChange = (e: any) => {
      const newOrg = e.detail?.orgName || localStorage.getItem('active_org') || '';
      setActiveOrg(newOrg);
      if (e.detail?.logoUrl !== undefined) {
        setOrgLogo(e.detail.logoUrl);
      }
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

  const isSuperAdmin = user?.role === 'super_admin';
  const roleTitle = user ? getRoleDisplayName(user, activeOrg) : '';
  const avatarUrl = user?.avatar_url || user?.profile_image_url || null;
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <>
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between relative z-30 select-none bg-canvas shrink-0">
        {/* Left: Sidebar Toggle + Brand Identity + Active Module Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Dynamic Brand Logo & Identity matching AppHeader */}
          <Link href="/launchpad" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              {orgLogo ? (
                <img src={orgLogo} alt={activeOrg} className="w-full h-full object-contain" />
              ) : (
                <img src="/logo/Codebridge.png" alt="CodeBridges Logo" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-extrabold text-base tracking-tight text-slate-900 block truncate max-w-[160px] lg:max-w-[200px]">
                {activeOrg || 'CodeBridges'}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Workspace Operations
              </span>
            </div>
          </Link>

          {/* Active Module Indicator Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/20 shadow-2xs">
            <ModuleIcon className="w-3.5 h-3.5 text-brand" />
            <span className="font-extrabold text-xs text-brand tracking-tight">{moduleTitle}</span>
          </div>
        </div>

        {/* Right: Quick Launchpad Switcher + Notification Bell + User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick 1-Click Return to Launchpad */}
          <Link
            href="/launchpad"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
            title="App Directory Launchpad"
          >
            <AppIcons.Compass className="w-3.5 h-3.5 text-brand" />
            <span className="hidden sm:inline">Launchpad</span>
          </Link>

          {/* Dynamic Notifications Bell */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="System &amp; Module Notifications"
          >
            <AppIcons.Bell className="w-5 h-5" />
            {unreadNotifCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 px-1 min-w-[15px] h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-2xs">
                {unreadNotifCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-brand absolute top-2 right-2 border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Interactive User Profile Dropdown matching AppHeader */}
          <div className="relative pl-2 sm:pl-3 border-l border-slate-200" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-xs">
                  {userInitials}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-xs font-bold leading-tight text-slate-900 flex items-center gap-1">
                  {user?.name || 'User'}
                  <AppIcons.Dropdown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </p>
                <p className="text-[10px] text-brand font-bold capitalize truncate max-w-[120px]">{roleTitle}</p>
              </div>
            </button>

            {/* User Menu Dropdown matching AppHeader styling */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 divide-y divide-slate-100 font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 bg-slate-50/70 flex items-start gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || 'User'}
                      className="w-10 h-10 rounded-xl object-cover shadow-2xs border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
                    <span className={`inline-block mt-1 ${badgeStyles.brand}`}>
                      {roleTitle}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" /> My Profile
                  </Link>

                  {['organization', 'admin', 'super_admin', 'owner', 'organization_owner', 'manager', 'accountant', 'staff'].includes(user?.role) && (
                    <>
                      <Link
                        href="/organization/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" /> Workspace Dashboard
                      </Link>
                      <Link
                        href="/organization/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" /> Setting
                      </Link>
                    </>
                  )}

                  {isSuperAdmin && (
                    <Link
                      href="/super-admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                    >
                      <Shield className="w-4 h-4 text-brand" /> Super Admin Console
                    </Link>
                  )}

                  {/* Return to Launchpad */}
                  <Link
                    href="/launchpad"
                    onClick={() => setUserMenuOpen(false)}
                    className="px-4 py-2.5 hover:bg-brand/5 flex items-center gap-2.5 font-bold text-brand transition-colors border-t border-slate-100"
                  >
                    <AppIcons.Compass className="w-4 h-4 text-brand" />
                    <span>App Directory Launchpad</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
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
