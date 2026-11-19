/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0140
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu, Building2, Settings, Shield, LogOut } from 'lucide-react';
import { getAuthUser, getAuthToken, logoutApi, getRoleDisplayName } from '@/lib/api';
import { getMeetingNotificationsApi } from '@/lib/api/meetings';
import { GlobalNotificationsDrawer } from '@/components/header/GlobalNotificationsDrawer';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles } from '@/lib/theme';
import { ProfileSettingsDrawer } from '@/components/settings/ProfileSettingsDrawer';
import { resolveMediaUrl } from '@/lib/mediaUtils';

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

  const loadNotificationsCount = async () => {
    const token = getAuthToken();
    if (!token) {
      setUnreadNotifCount(0);
      return;
    }
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

    if (getAuthToken()) {
      loadNotificationsCount();
    }
    const interval = setInterval(() => {
      if (getAuthToken()) {
        loadNotificationsCount();
      }
    }, 20000);

    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
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
  const hasOrganization = Boolean(
    (activeOrg &&
      activeOrg !== 'CodeBridges' &&
      activeOrg !== 'No Organization Yet! Please Create' &&
      activeOrg !== 'Guest Workspace') ||
      user?.tenant_id
  );
  const profileRoute = isSuperAdmin
    ? '/super-admin/security/profile'
    : hasOrganization
    ? '/organization/profile'
    : '/profile';
  const roleTitle = user ? getRoleDisplayName(user, activeOrg) : '';
  const avatarUrl = resolveMediaUrl(user?.avatar_url || user?.profile_image_url || null);
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

          {/* Interactive User Profile Slide Drawer Trigger */}
          <div className="relative pl-2 sm:pl-3 border-l border-slate-200">
            <button
              type="button"
              onClick={() => setUserMenuOpen(true)}
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
                  <AppIcons.Dropdown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? '-rotate-90' : ''}`} />
                </p>
                <p className="text-[10px] text-brand font-bold capitalize truncate max-w-[120px]">{roleTitle}</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notifications Center Drawer */}
      <GlobalNotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          loadNotificationsCount();
        }}
      />

      {/* Unified Right-Side Profile & Display Preferences Drawer */}
      <ProfileSettingsDrawer
        isOpen={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        side="right"
        user={user}
        avatarUrl={avatarUrl}
        userInitials={userInitials}
        roleTitle={roleTitle}
        profileRoute={profileRoute}
        onLogout={handleLogout}
      />
    </>
  );
}
