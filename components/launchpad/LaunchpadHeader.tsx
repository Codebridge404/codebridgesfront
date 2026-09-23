'use client';

import React from 'react';
import Link from 'next/link';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles, buttonStyles } from '@/lib/theme';
import { OrganizationManagerBar } from './OrganizationManagerBar';

interface LaunchpadHeaderProps {
  mounted: boolean;
  isAuthenticated: boolean;
  user: any;
  roleTitle: string;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  onLogout: () => void;
}

export function LaunchpadHeader({
  mounted,
  isAuthenticated,
  user,
  roleTitle,
  showUserMenu,
  setShowUserMenu,
  onLogout,
}: LaunchpadHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Org Switcher */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200/80 overflow-hidden">
              <img src="/logo/Codebridge.png" alt="CodeBridges Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm tracking-tight text-slate-900 group-hover:text-brand transition-colors">
              CodeBridges Platform
            </span>
          </Link>

          {/* Workspace Switcher Pill */}
          {mounted && (
            user?.role !== 'super_admin' ? (
              <div className="hidden sm:flex items-center">
                <OrganizationManagerBar />
              </div>
            ) : (
              <Link
                href="/super-admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-subtle hover:bg-purple-100 border border-brand-border text-xs font-black text-brand transition-colors shadow-2xs"
              >
                <AppIcons.Security className="w-3.5 h-3.5" />
                <span>Super Admin Control Hub</span>
              </Link>
            )
          )}
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Header Role Status Badge Pill */}
          {mounted && isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-subtle border border-brand-border text-brand shadow-2xs">
              <AppIcons.Security className="w-3.5 h-3.5 text-brand" />
              <span className="text-xs font-black tracking-wide uppercase">{roleTitle}</span>
            </div>
          )}

          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors relative cursor-pointer"
          >
            <AppIcons.Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            {mounted && isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand to-brand-hover text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {(user.name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">
                    {user.name || 'User'}
                  </p>
                  <p className="text-[10px] text-brand font-extrabold uppercase tracking-wider mt-0.5">
                    {roleTitle}
                  </p>
                </div>
                <AppIcons.Dropdown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : mounted ? (
              <Link
                href="/login"
                className={buttonStyles.primary}
              >
                Sign In
              </Link>
            ) : null}

            {/* User Dropdown Menu */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 font-sans">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-extrabold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  <span className={`inline-block mt-1 ${badgeStyles.brand}`}>
                    {roleTitle}
                  </span>
                </div>

                {/* Switch Action: Organization Dashboard */}
                <div className="py-1">
                  <Link
                    href="/organization/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-subtle hover:bg-purple-100 text-brand border border-brand-border flex items-center gap-2.5 font-bold text-xs transition-colors"
                  >
                    <AppIcons.Organization className="w-4 h-4 text-brand" />
                    <span>Organization Dashboard</span>
                  </Link>
                </div>

                {user.role === 'super_admin' && (
                  <Link
                    href="/super-admin/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-brand hover:bg-brand-subtle flex items-center gap-2.5 transition-colors"
                  >
                    <AppIcons.Security className="w-3.5 h-3.5" />
                    <span>Super Admin Console</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <AppIcons.LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
