'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Monitor,
  LayoutDashboard,
  Clock,
  Receipt,
  Tv,
  Zap,
  PauseCircle,
  RotateCcw,
  LogOut,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { logoutApi, getRoleDisplayName, getTenantProfileApi, getOutletTerminalSettingsApi } from '@/lib/api';

interface PosSuiteHeaderProps {
  user: any;
  activeShift: any;
  heldCartsCount?: number;
  offlineQueueCount?: number;
  isOnline?: boolean;
  isSyncing?: boolean;
  onOpenShiftModal?: () => void;
  onCloseShiftModal?: () => void;
  onOpenHeldCartsModal?: () => void;
  onOpenReturnsModal?: () => void;
  onSyncOffline?: () => void;
  onOpenQuickSwitchModal?: () => void;
  outletName?: string;
  terminalCode?: string;
}

export function PosSuiteHeader({
  user,
  activeShift,
  heldCartsCount = 0,
  offlineQueueCount = 0,
  isOnline = true,
  isSyncing = false,
  onOpenShiftModal,
  onCloseShiftModal,
  onOpenHeldCartsModal,
  onOpenReturnsModal,
  onSyncOffline,
  onOpenQuickSwitchModal,
  outletName = 'Main Store Outlet',
  terminalCode = 'REG-01',
}: PosSuiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutApi();
    router.push('/launchpad');
  };

  const userRole = (user?.role || '').toLowerCase();
  const isManagerial = [
    'super_admin',
    'admin',
    'administrator',
    'owner',
    'outlet_manager',
    'manager',
    'supervisor',
  ].includes(userRole);

  const [mounted, setMounted] = useState<boolean>(false);
  const [cfdEnabled, setCfdEnabled] = useState<boolean>(false);

  const navLinks = [
    ...(isManagerial ? [{ label: 'POS Dashboard', href: '/pos', icon: LayoutDashboard }] : []),
    { label: 'Orders & Receipts', href: isManagerial ? '/pos/orders' : '/cashier/orders', icon: Receipt },
    { label: 'Shifts & Till Float', href: isManagerial ? '/pos/shifts' : '/cashier/shifts', icon: Clock },
    ...(mounted && cfdEnabled ? [{ label: 'Customer CFD', href: '/pos/customer-display', icon: Tv, target: '_blank', isExternal: true }] : []),
  ];

  // Resolve shift click handler (fallback to onOpenShiftModal if onCloseShiftModal is not distinct)
  const handleShiftClick = () => {
    if (activeShift) {
      if (onCloseShiftModal) onCloseShiftModal();
      else if (onOpenShiftModal) onOpenShiftModal();
    } else {
      if (onOpenShiftModal) onOpenShiftModal();
    }
  };

  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('');
  const [logoError, setLogoError] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setAvatarError(false);
    if (typeof window === 'undefined') return;

    const resolveOrgInfo = () => {
      const activeName =
        localStorage.getItem('active_org') ||
        localStorage.getItem('cb_active_org_name') ||
        user?.tenant_name ||
        user?.company_name ||
        '';
      setOrgName(activeName);

      const activeLogo =
        localStorage.getItem('cb_active_org_logo') ||
        user?.tenant_logo_url ||
        user?.logo_url ||
        null;
      setOrgLogo(activeLogo);
      setLogoError(false);

      if (!activeLogo && activeName && activeName !== 'No Organization Yet! Please Create') {
        getTenantProfileApi(activeName)
          .then((res) => {
            if (res?.data?.logo_url) {
              setOrgLogo(res.data.logo_url);
              localStorage.setItem('cb_active_org_logo', res.data.logo_url);
            }
          })
          .catch(() => {});
      }
    };

    const loadTerminalSettings = async () => {
      const saved = localStorage.getItem('cb_pos_terminal_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.cfdEnabled !== undefined) {
            setCfdEnabled(Boolean(parsed.cfdEnabled));
          }
        } catch {}
      }

      const outletId = user?.outlet_id || localStorage.getItem('cb_active_outlet_id');
      if (outletId) {
        try {
          const termRes = await getOutletTerminalSettingsApi(outletId);
          if (termRes?.status === 'success' && termRes.data) {
            const isEnabled =
              termRes.data.is_cfd_enabled !== undefined
                ? Boolean(termRes.data.is_cfd_enabled)
                : termRes.data.terminal_settings?.cfdEnabled !== undefined
                ? Boolean(termRes.data.terminal_settings.cfdEnabled)
                : true;
            setCfdEnabled(isEnabled);
            const current = saved ? JSON.parse(saved) : {};
            localStorage.setItem(
              'cb_pos_terminal_settings',
              JSON.stringify({ ...current, cfdEnabled: isEnabled })
            );
          }
        } catch {}
      }
    };

    resolveOrgInfo();
    loadTerminalSettings();

    const handleOrgChange = (e: any) => {
      resolveOrgInfo();
      if (e?.detail?.logoUrl !== undefined) {
        setOrgLogo(e.detail.logoUrl);
      }
    };

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail?.cfdEnabled !== undefined) {
        setCfdEnabled(Boolean(e.detail.cfdEnabled));
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cb_pos_terminal_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.cfdEnabled !== undefined) {
            setCfdEnabled(Boolean(parsed.cfdEnabled));
          }
        } catch {}
      }
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_terminal_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_terminal_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Cashier initials
  const cashierName = user?.name || 'Cashier';
  const cashierAvatar = user?.avatar_url || user?.avatar || user?.profile_image_url || null;
  const cashierInitials = cashierName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="border-b border-slate-200/90 bg-white shrink-0 z-40 shadow-xs backdrop-blur-md">
      {/* Top Bar: 3 Clean Functional Zones */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Zone 1: Branding & Register Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href={isManagerial ? '/pos/dashboard' : '/cashier/pos-terminal'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              {orgLogo && !logoError ? (
                <img
                  src={orgLogo}
                  alt={orgName || 'Organization Logo'}
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Monitor className="w-6 h-6 text-brand" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight group-hover:text-brand transition-colors">
                  {orgName && orgName !== 'No Organization Yet! Please Create' ? orgName : 'POS Suite'}
                </span>
                <span className="text-[10px] font-mono font-extrabold text-brand bg-brand-subtle px-1.5 py-0.5 rounded-md border border-brand/20 shadow-2xs">
                  {terminalCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[160px] sm:max-w-[200px]">
                {outletName}
              </p>
            </div>
          </Link>
        </div>

        {/* Zone 2: Frontline Operations Status Toolbar (Center) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Network / Offline Sync Indicator */}
          {offlineQueueCount > 0 ? (
            <button
              onClick={onSyncOffline}
              disabled={isSyncing || !isOnline}
              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all animate-pulse"
              title="Sync pending offline sales queue to server"
            >
              <Zap className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync (${offlineQueueCount})`}</span>
            </button>
          ) : isOnline ? (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1.5 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-extrabold flex items-center gap-1.5 border border-rose-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>OFFLINE</span>
            </div>
          )}

          <div className="w-px h-4 bg-slate-200" />

          {/* Shift Status Pill */}
          {activeShift ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Shift Open · Float: <span className="font-mono font-black">${parseFloat(activeShift.opening_float || 0).toFixed(0)}</span>
              </span>
              <button
                onClick={handleShiftClick}
                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold cursor-pointer transition-colors shadow-2xs"
              >
                Close
              </button>
            </div>
          ) : (
            <button
              onClick={handleShiftClick}
              className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Shift</span>
            </button>
          )}

          {/* Held Carts Badge (Dynamic visibility) */}
          {heldCartsCount > 0 && onOpenHeldCartsModal && (
            <>
              <div className="w-px h-4 bg-slate-200" />
              <button
                onClick={onOpenHeldCartsModal}
                className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Held ({heldCartsCount})</span>
              </button>
            </>
          )}

          {/* Sales Return Shortcut */}
          {onOpenReturnsModal && (
            <>
              <div className="w-px h-4 bg-slate-200" />
              <button
                onClick={onOpenReturnsModal}
                className="px-2.5 py-1 rounded-xl hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Customer Sales Returns & Refunds"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand" />
                <span>Return</span>
              </button>
            </>
          )}
        </div>

        {/* Zone 3: Cashier Identity & Terminal Controls (Right) */}
        <div className="flex items-center gap-2">
          {/* Cashier Identity & Fast PIN Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-brand text-white font-black text-[11px] flex items-center justify-center shadow-xs shadow-brand/20 border border-slate-200/60 shrink-0">
                {cashierAvatar && !avatarError ? (
                  <img
                    src={cashierAvatar}
                    alt={cashierName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{cashierInitials}</span>
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-black text-slate-900 truncate max-w-[110px] leading-tight">
                  {cashierName}
                </p>
                <p className="text-[10px] text-brand font-extrabold capitalize">
                  {getRoleDisplayName(user)}
                </p>
              </div>
            </div>

            {onOpenQuickSwitchModal && (
              <button
                onClick={onOpenQuickSwitchModal}
                title="Quick-Switch Staff (Enter PIN)"
                className="px-2.5 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand/10 border border-brand/20 text-brand text-xs font-extrabold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Switch</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: POS Navigation Segmented Bar */}
      <div className="px-4 sm:px-6 bg-slate-50/70 border-t border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto py-1">
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow-xs shadow-brand/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Mobile quick indicators */}
        <div className="flex md:hidden items-center gap-2 text-[10px] font-extrabold">
          {isOnline ? (
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Online</span>
          ) : (
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Offline</span>
          )}
          {activeShift && (
            <span className="text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">Shift Open</span>
          )}
        </div>
      </div>
    </header>
  );
}
