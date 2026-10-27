'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, Building2, Users, Settings, Shield, FileText, User,
  ShieldCheck, LogOut, LogIn, Plus,
} from 'lucide-react';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles } from '@/lib/theme';
import { getAuthUser, logoutApi, getRoleDisplayName } from '@/lib/api';
import { isSuperAdmin as checkSuperAdmin, isOrgAdmin, isEmployee } from '@/lib/rbac';

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
  const [impersonating, setImpersonating] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const syncState = () => {
    const authUser = initialUser !== undefined ? initialUser : getAuthUser();
    setUser(authUser);
    if (typeof window !== 'undefined') {
      try {
        const rawImp = localStorage.getItem('cb_impersonation');
        setImpersonating(rawImp ? JSON.parse(rawImp) : null);
      } catch { setImpersonating(null); }

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

    ['cb_org_changed', 'cb_impersonation_changed', 'storage'].forEach(ev =>
      window.addEventListener(ev, handleSync as EventListener)
    );
    window.addEventListener('cb_user_updated', handleUserSync as EventListener);

    return () => {
      ['cb_org_changed', 'cb_impersonation_changed', 'storage'].forEach(ev =>
        window.removeEventListener(ev, handleSync as EventListener)
      );
      window.removeEventListener('cb_user_updated', handleUserSync as EventListener);
    };
  }, [initialUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const isOrg = isOrgAdmin(user);
  const isEmp = isEmployee(user);
  const hasOrganization = isOrg || isSuperAdmin;
  const roleTitle = user ? getRoleDisplayName(user, orgName) : '';
  const homeUrl = isSuperAdmin
    ? '/super-admin/dashboard'
    : isOrg
    ? '/organization/dashboard'
    : '/launchpad';
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between relative z-30 select-none bg-canvas">
      {/* Left Header Elements */}
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

        {/* Dynamic Brand Logo & Identity */}
        <Link href={homeUrl} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            {orgLogo && user && (!isSuperAdmin || impersonating) ? (
              <img src={orgLogo} alt={orgName} className="w-full h-full object-contain" />
            ) : (
              <img src="/logo/Codebridge.png" alt="CodeBridges Logo" className="w-full h-full object-contain" />
            )}
          </div>
          <div className="hidden sm:block leading-tight">
            <span className="font-extrabold text-base tracking-tight text-slate-900 block truncate max-w-[180px] lg:max-w-[240px]">
              {!user || (isSuperAdmin && !impersonating) || (!hasOrganization && !isEmp) ? (
                <>Code<span className="text-brand">Bridges</span></>
              ) : (
                orgName
              )}
            </span>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
              {!user
                ? 'Ecosystem Platform'
                : isSuperAdmin && !impersonating
                ? 'Platform Super Admin'
                : isOrg
                ? 'Workspace Operations Hub'
                : isEmp
                ? 'Staff Workspace Portal'
                : 'Personal Account'}
            </span>
          </div>
        </Link>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {!user ? (
          /* ================= GUEST / SIGNED OUT STATE ================= */
          <>
            {pathname !== '/launchpad' && (
              <Link
                href="/launchpad"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
                title="App Directory Launchpad"
              >
                <AppIcons.Compass className="w-3.5 h-3.5 text-brand" />
                <span>Launchpad</span>
              </Link>
            )}

            <Link
              href="/register"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
            >
              <span>Register</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </>
        ) : (
          /* ================= AUTHENTICATED USER STATE ================= */
          <>
            {/* Quick 1-Click Launchpad <-> Dashboard Switcher */}
            {pathname !== '/launchpad' ? (
              <Link
                href="/launchpad"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors border border-slate-200/60"
                title="App Directory Launchpad"
              >
                <AppIcons.Compass className="w-3.5 h-3.5 text-brand" />
                <span className="hidden sm:inline">Launchpad</span>
              </Link>
            ) : hasOrganization ? (
              <Link
                href={homeUrl}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-colors border border-brand/20"
                title="Return to Dashboard"
              >
                {isSuperAdmin ? <Shield className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : null}

            {/* Dynamic Notifications Bell */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="System Notifications"
            >
              <AppIcons.Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-brand absolute top-2 right-2 border-2 border-white animate-pulse" />
            </button>

            {/* Interactive User Profile Dropdown */}
            <div className="relative pl-2 sm:pl-3 border-l border-slate-200" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-xs">
                    {userInitials}
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-xs font-bold leading-tight text-slate-900 flex items-center gap-1">
                    {user.name}
                    <AppIcons.Dropdown className={`w-3 h-3 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </p>
                  <p className="text-[10px] text-brand font-bold capitalize truncate max-w-[120px]">{roleTitle}</p>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 divide-y divide-slate-100 font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 bg-slate-50/70 flex items-start gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover shadow-2xs border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || ''}</p>
                      <span className={`inline-block mt-1 ${badgeStyles.brand}`}>
                        <ShieldCheck className="w-3 h-3 text-brand" />
                        {roleTitle}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>

                    {isSuperAdmin && !impersonating ? (
                      <>
                        <Link href="/super-admin/security/settings" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <Settings className="w-4 h-4 text-slate-400" /> Setting
                        </Link>
                        <Link href="/super-admin/security/roles" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <Shield className="w-4 h-4 text-slate-400" /> Dynamic Roles &amp; RBAC
                        </Link>
                        <Link href="/super-admin/security/audit-logs" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <FileText className="w-4 h-4 text-slate-400" /> Security Audit Logs
                        </Link>
                      </>
                    ) : isOrg ? (
                      <>
                        <Link href="/organization/dashboard" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <Building2 className="w-4 h-4 text-slate-400" /> Workspace Dashboard
                        </Link>
                        <Link href="/organization/outlets" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <Building2 className="w-4 h-4 text-slate-400" /> Store Outlets &amp; Hubs
                        </Link>
                        <Link href="/organization/staff" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <Users className="w-4 h-4 text-slate-400" /> Staff &amp; Team Roster
                        </Link>
                        <Link href="/organization/settings" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors">
                          <Settings className="w-4 h-4 text-slate-400" /> Setting
                        </Link>
                      </>
                    ) : isEmp ? null : (
                      <>
                        <Link href="/register-tenant" onClick={() => setShowProfileDropdown(false)} className="px-4 py-2.5 hover:bg-brand/5 flex items-center gap-2.5 font-bold text-brand transition-colors">
                          <Plus className="w-4 h-4 text-brand" /> Create Organization
                        </Link>
                      </>
                    )}

                    {/* Bidirectional Switcher: Launchpad <-> Dashboard */}
                    {pathname !== '/launchpad' ? (
                      <Link
                        href="/launchpad"
                        onClick={() => setShowProfileDropdown(false)}
                        className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors border-t border-slate-100"
                      >
                        <AppIcons.Compass className="w-4 h-4 text-slate-400" />
                        <span>{isEmp ? 'Workspace Launchpad' : 'App Directory Launchpad'}</span>
                      </Link>
                    ) : hasOrganization ? (
                      <Link
                        href={homeUrl}
                        onClick={() => setShowProfileDropdown(false)}
                        className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-brand transition-colors border-t border-slate-100"
                      >
                        {isSuperAdmin ? <Shield className="w-4 h-4 text-brand" /> : <Building2 className="w-4 h-4 text-brand" />}
                        <span>Return to Dashboard</span>
                      </Link>
                    ) : null}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
