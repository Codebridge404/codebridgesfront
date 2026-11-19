/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0140
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Building2,
  Users,
  Settings,
  Shield,
  FileText,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles } from '@/lib/theme';
import { getAuthUser, getAuthToken, logoutApi, getRoleDisplayName } from '@/lib/api';
import { getMeetingNotificationsApi } from '@/lib/api/meetings';
import { GlobalNotificationsDrawer } from './GlobalNotificationsDrawer';
import { isSuperAdmin as checkSuperAdmin, isOrgAdmin, isEmployee } from '@/lib/rbac';
import { CreateOrgModal } from '@/components/tenant/CreateOrgModal';
import { ProfileSettingsDrawer } from '@/components/settings/ProfileSettingsDrawer';
import { resolveMediaUrl } from '@/lib/mediaUtils';

export interface AppHeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  user?: any;
  handleLogout?: () => void;
}

export function AppHeader({
  sidebarOpen,
  setSidebarOpen,
  user: initialUser,
  handleLogout: customLogout,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(initialUser !== undefined ? initialUser : null);
  const [orgName, setOrgName] = useState<string>('CodeBridges');
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [impersonating, setImpersonating] = useState<any>(null);

  // Live Notification Drawer state matching ModuleSuiteHeader
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

  const syncState = () => {
    const authUser = initialUser !== undefined ? initialUser : getAuthUser();
    setUser(authUser);
    if (typeof window !== 'undefined') {
      try {
        const rawImp = localStorage.getItem('cb_impersonation');
        setImpersonating(rawImp ? JSON.parse(rawImp) : null);
      } catch {
        setImpersonating(null);
      }

      if (authUser) {
        const active =
          localStorage.getItem('active_org') ||
          localStorage.getItem('cb_active_org_name') ||
          authUser?.tenant_name ||
          authUser?.company_name ||
          'CodeBridges';
        setOrgName(active);

        const activeLogo =
          localStorage.getItem('cb_active_org_logo') ||
          authUser?.tenant_logo_url ||
          authUser?.logo_url ||
          null;
        setOrgLogo(activeLogo);
      } else {
        setOrgName('CodeBridges');
        setOrgLogo(null);
      }
    }
  };

  useEffect(() => {
    syncState();
    const handleSync = (e?: any) => {
      syncState();
      if (e?.detail?.logoUrl !== undefined) {
        setOrgLogo(e.detail.logoUrl);
      }
      if (e?.detail?.orgName) {
        setOrgName(e.detail.orgName);
      }
    };

    const handleUserSync = (e?: any) => {
      const updatedUser = e?.detail?.user !== undefined ? e.detail.user : getAuthUser();
      setUser(updatedUser);
      if (!updatedUser) {
        setOrgName('CodeBridges');
        setOrgLogo(null);
        setImpersonating(null);
      } else {
        syncState();
      }
    };

    ['cb_org_changed', 'cb_impersonation_changed', 'storage'].forEach((ev) =>
      window.addEventListener(ev, handleSync as EventListener)
    );
    window.addEventListener('cb_user_updated', handleUserSync as EventListener);

    if (getAuthToken()) {
      loadNotificationsCount();
    }
    const notifInterval = setInterval(() => {
      if (getAuthToken()) {
        loadNotificationsCount();
      }
    }, 20000);

    return () => {
      ['cb_org_changed', 'cb_impersonation_changed', 'storage'].forEach((ev) =>
        window.removeEventListener(ev, handleSync as EventListener)
      );
      window.removeEventListener('cb_user_updated', handleUserSync as EventListener);
      clearInterval(notifInterval);
    };
  }, [initialUser]);

  const onLogout = async () => {
    setShowProfileDropdown(false);
    setUser(null);
    setOrgLogo(null);
    setOrgName('CodeBridges');
    if (customLogout) {
      await customLogout();
    } else {
      await logoutApi();
      router.push('/launchpad');
    }
  };

  const isSuperAdmin = checkSuperAdmin(user);
  const isEmp = isEmployee(user);
  const hasOrganization = Boolean(
    user?.tenant_id &&
    (!isSuperAdmin || impersonating) &&
    user?.tenant_id !== 1 &&
    user?.tenant_id !== '1'
  );
  const isOrg = (isOrgAdmin(user) || !isEmp) && hasOrganization;
  const roleTitle = user ? getRoleDisplayName(user, orgName) : '';
  const homeUrl = isSuperAdmin
    ? '/super-admin/dashboard'
    : hasOrganization
    ? '/organization/dashboard'
    : '/launchpad';

  const profileRoute = isSuperAdmin
    ? '/super-admin/security/profile'
    : hasOrganization
    ? '/organization/profile'
    : '/profile';

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const avatarUrl = resolveMediaUrl(user?.avatar_url || user?.profile_image_url || null);

  // Context Pill Badge matching ModuleSuiteHeader
  const contextBadge = useMemo(() => {
    if (!pathname) return null;
    if (pathname.startsWith('/super-admin')) {
      return { icon: Shield, title: 'Super Admin Console' };
    }
    if (pathname.startsWith('/organization')) {
      return { icon: Building2, title: 'Workspace Hub' };
    }
    if (pathname.startsWith('/profile')) {
      return { icon: User, title: 'Profile & Account' };
    }
    if (pathname.startsWith('/cashier')) {
      return { icon: AppIcons.POS, title: 'Cashier Terminal' };
    }
    if (pathname.startsWith('/launchpad')) {
      return { icon: AppIcons.Compass, title: 'Launchpad Directory' };
    }
    return null;
  }, [pathname]);

  const subTitle = useMemo(() => {
    if (!user) return 'Ecosystem Platform';
    if (isSuperAdmin && !impersonating) return 'Platform Super Admin';
    if (isOrg) return 'Workspace Operations';
    if (isEmp) return 'Staff Workspace Portal';
    return 'Workspace Member';
  }, [user, isSuperAdmin, impersonating, isOrg, isEmp]);

  return (
    <>
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between relative z-30 select-none bg-canvas shrink-0">
        {/* Left: Sidebar Toggle + Brand Identity + Context Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {setSidebarOpen && user && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Dynamic Brand Logo & Identity matching ModuleSuiteHeader */}
          <Link href={homeUrl} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              {orgLogo && user && (!isSuperAdmin || impersonating) ? (
                <img src={orgLogo} alt={orgName} className="w-full h-full object-contain" />
              ) : (
                <img src="/logo/Codebridge.png" alt="CodeBridges Logo" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-extrabold text-base tracking-tight text-slate-900 block truncate max-w-[160px] lg:max-w-[200px]">
                {!user || (isSuperAdmin && !impersonating) || (!hasOrganization && !isEmp) ? (
                  <>Code<span className="text-brand">Bridges</span></>
                ) : (
                  orgName
                )}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                {subTitle}
              </span>
            </div>
          </Link>

          {/* Context Pill Badge matching ModuleSuiteHeader */}
          {contextBadge && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/20 shadow-2xs">
              <contextBadge.icon className="w-3.5 h-3.5 text-brand" />
              <span className="font-extrabold text-xs text-brand tracking-tight">{contextBadge.title}</span>
            </div>
          )}
        </div>

        {/* Right: Switcher + Notifications Bell + User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {!user ? (
            /* ================= GUEST / SIGNED OUT STATE ================= */
            <>
              {pathname !== '/launchpad' && (
                <Link
                  href="/launchpad"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
                  title="App Directory Launchpad"
                >
                  <AppIcons.Compass className="w-3.5 h-3.5 text-brand" />
                  <span>Launchpad</span>
                </Link>
              )}

              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
              >
                <span>Register</span>
              </Link>

              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </>
          ) : (
            /* ================= AUTHENTICATED USER STATE ================= */
            <>
              {/* Quick 1-Click Launchpad <-> Dashboard Switcher matching ModuleSuiteHeader */}
              {pathname !== '/launchpad' ? (
                <Link
                  href="/launchpad"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
                  title="App Directory Launchpad"
                >
                  <AppIcons.Compass className="w-3.5 h-3.5 text-brand" />
                  <span className="hidden sm:inline">Launchpad</span>
                </Link>
              ) : isSuperAdmin ? (
                <Link
                  href="/super-admin/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
                  title="Platform Super Admin Console"
                >
                  <Shield className="w-3.5 h-3.5 text-brand" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              ) : hasOrganization ? (
                <Link
                  href="/organization/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
                  title="Return to Workspace Dashboard"
                >
                  <Building2 className="w-3.5 h-3.5 text-brand" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              ) : null}

              {/* Dynamic Notifications Bell matching ModuleSuiteHeader */}
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="System Notifications"
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
                  onClick={() => setShowProfileDropdown(true)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-xs">
                      {userInitials}
                    </div>
                  )}
                  <div className="hidden md:block">
                    <p className="text-xs font-bold leading-tight text-slate-900 flex items-center gap-1">
                      {user.name || 'User'}
                      <AppIcons.Dropdown className={`w-3 h-3 text-slate-400 transition-transform ${showProfileDropdown ? '-rotate-90' : ''}`} />
                    </p>
                    <p className="text-[10px] text-brand font-bold capitalize truncate max-w-[120px]">{roleTitle}</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 1-Click Create Organization Modal */}
        {showCreateOrgModal && (
          <CreateOrgModal
            isOpen={showCreateOrgModal}
            onClose={() => setShowCreateOrgModal(false)}
            onOrgCreated={() => {
              setShowCreateOrgModal(false);
              router.push('/organization/dashboard');
            }}
          />
        )}
      </header>

      {/* Unified Right-Side Profile & Display Preferences Drawer */}
      {user && (
        <ProfileSettingsDrawer
          isOpen={showProfileDropdown}
          onClose={() => setShowProfileDropdown(false)}
          side="right"
          user={user}
          avatarUrl={avatarUrl}
          userInitials={userInitials}
          roleTitle={roleTitle}
          profileRoute={profileRoute}
          onLogout={onLogout}
        />
      )}

      {/* Global Notifications Center Drawer */}
      <GlobalNotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          loadNotificationsCount();
        }}
      />
    </>
  );
}
