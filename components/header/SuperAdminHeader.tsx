'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, User, Settings, FileText } from 'lucide-react';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles, inputStyles } from '@/lib/theme';

interface SuperAdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
  handleLogout: () => void;
}

export function SuperAdminHeader({
  sidebarOpen,
  setSidebarOpen,
  user,
  handleLogout,
}: SuperAdminHeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Header Elements */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* CodeBridges Enterprise Brand Logo */}
        <Link href="/super-admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200/80 overflow-hidden group-hover:scale-105 transition-transform">
            <img src="/logo/Codebridge.png" alt="CodeBridges Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block leading-tight">
            <span className="font-extrabold text-base tracking-tight text-slate-900 block">
              Code<span className="text-brand">Bridges</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
              {user?.role === 'super_admin' ? 'Enterprise Super Admin' : 'Admin Control Hub'}
            </span>
          </div>
        </Link>

        {/* Global Search Input */}
        <div className="relative hidden md:block w-64 lg:w-80 ml-2">
          <AppIcons.Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules, catalog, orders... ⌘ K"
            className={inputStyles.search}
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer">
          <AppIcons.Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-brand absolute top-2 right-2 border-2 border-white animate-pulse" />
        </button>

        {/* Interactive Profile Dropdown Container */}
        <div className="relative pl-2 sm:pl-3 border-l border-slate-200" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-xs">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'VB'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold leading-tight text-slate-900 flex items-center gap-1">
                {user?.name || 'Vibol'}
                <AppIcons.Dropdown className={`w-3 h-3 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </p>
              <p className="text-[10px] text-brand font-bold capitalize">
                {user?.role ? user.role.replace('_', ' ') : 'super admin'}
              </p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 divide-y divide-slate-100 font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Card Header */}
              <div className="px-4 py-3 bg-slate-50/70">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Vibol'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'vibolsen2002@gmail.com'}</p>
                <span className={`inline-block mt-1.5 ${badgeStyles.brand}`}>
                  {user?.role ? user.role.replace('_', ' ') : 'Super Admin'}
                </span>
              </div>

              {/* Switch Actions (Launchpad & Organization Dashboard) */}
              <div className="p-1.5 space-y-1">
                <Link
                  href="/organization/dashboard"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-subtle hover:bg-purple-100 text-brand border border-brand-border flex items-center gap-2.5 font-bold text-xs transition-colors"
                >
                  <AppIcons.Organization className="w-4 h-4 text-brand" />
                  <span>Organization Dashboard</span>
                </Link>
                <Link
                  href="/launchpad"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 font-bold text-xs transition-colors"
                >
                  <AppIcons.Compass className="w-4 h-4 text-slate-400" />
                  <span>Onboarding Launchpad</span>
                </Link>
              </div>

              {/* Menu Links */}
              <div className="py-1 text-xs">
                <Link
                  href="/super-admin/security/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile
                </Link>
                <Link
                  href="/super-admin/security/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Platform Settings
                </Link>
                <Link
                  href="/super-admin/security/roles"
                  onClick={() => setShowProfileDropdown(false)}
                  className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                >
                  <AppIcons.Security className="w-4 h-4 text-slate-400" /> Dynamic Roles &amp; RBAC
                </Link>
                <Link
                  href="/super-admin/security/audit-logs"
                  onClick={() => setShowProfileDropdown(false)}
                  className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-700 hover:text-brand transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" /> Security Audit Logs
                </Link>
              </div>

              {/* Logout Button */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <AppIcons.LogOut className="w-4 h-4" /> Sign Out (SSO)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
