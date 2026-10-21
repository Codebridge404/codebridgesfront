'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Monitor,
  Clock,
  Receipt,
  Tv,
  RotateCcw,
  ChefHat,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PosQuickActionGridProps {
  onOpenShift: () => void;
  onOpenReturn: () => void;
  activeShift: any;
}

export function PosQuickActionGrid({
  onOpenShift,
  onOpenReturn,
  activeShift,
}: PosQuickActionGridProps) {
  const [terminalSettings, setTerminalSettings] = React.useState<{ cfdEnabled?: boolean; kdsEnabled?: boolean }>({
    cfdEnabled: true,
    kdsEnabled: true,
  });

  React.useEffect(() => {
    const loadSettings = () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('cb_pos_terminal_settings');
          if (raw) {
            const parsed = JSON.parse(raw);
            setTerminalSettings({
              cfdEnabled: parsed.cfdEnabled !== undefined ? Boolean(parsed.cfdEnabled) : true,
              kdsEnabled: parsed.kdsEnabled !== undefined ? Boolean(parsed.kdsEnabled) : true,
            });
          }
        } catch {}
      }
    };
    loadSettings();
    window.addEventListener('cb_terminal_settings_updated', loadSettings);
    return () => window.removeEventListener('cb_terminal_settings_updated', loadSettings);
  }, []);

  const allActions = [
    {
      title: 'Launch Cashier Register',
      subtitle: 'Start ringing orders & fast touch sales',
      href: '/pos/pos-terminal',
      icon: Monitor,
      gradient: 'from-brand to-brand-hover',
      badge: 'Primary Register',
      badgeColor: 'bg-brand-subtle text-brand',
      isPrimary: true,
    },
    {
      title: 'Shift & Cash Float Hub',
      subtitle: activeShift ? 'Active shift in progress' : 'Drawer locked — open shift',
      href: '/pos/shifts',
      icon: Clock,
      gradient: 'from-indigo-500 to-blue-600',
      badge: activeShift ? 'Open' : 'Action Req',
      badgeColor: activeShift ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
    },
    {
      title: "Today's POS Receipts",
      subtitle: 'View transactions & reprint receipts',
      href: '/pos/orders',
      icon: Receipt,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'Receipts',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Customer Display (CFD)',
      subtitle: 'Secondary live basket & KHQR screen',
      href: '/pos/customer-display',
      icon: Tv,
      gradient: 'from-pink-500 to-rose-500',
      badge: 'Dual Screen',
      badgeColor: 'bg-pink-100 text-pink-800',
      target: '_blank',
    },
    {
      title: 'Sales Return & Refund',
      subtitle: 'Process customer returns & store credit',
      onClick: onOpenReturn,
      icon: RotateCcw,
      gradient: 'from-slate-700 to-slate-900',
      badge: 'Refunds',
      badgeColor: 'bg-slate-100 text-slate-800',
    },
    {
      title: 'Kitchen Display (KDS)',
      subtitle: 'Real-time order ticket bump screen',
      href: '/pos/kitchen-display',
      icon: ChefHat,
      gradient: 'from-amber-500 to-brand',
      badge: 'Kitchen',
      badgeColor: 'bg-amber-100 text-amber-800',
      target: '_blank',
    },
  ];

  const actions = allActions.filter((act) => {
    if (act.title.includes('Customer Display') && terminalSettings.cfdEnabled === false) return false;
    if (act.title.includes('Kitchen Display') && terminalSettings.kdsEnabled === false) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <span>POS Operations Command Launchers</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">Terminal REG-01</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          const content = (
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-3xl border transition-all h-full flex flex-col justify-between cursor-pointer ${
                act.isPrimary
                  ? 'bg-brand text-white border-brand shadow-md shadow-brand/20'
                  : 'bg-transparent text-slate-900 border-slate-300/80 hover:border-brand/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                      act.isPrimary
                        ? 'bg-white/20 text-white'
                        : `bg-gradient-to-br ${act.gradient} text-white`
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      act.isPrimary ? 'bg-white text-brand' : act.badgeColor
                    }`}
                  >
                    {act.badge}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold leading-snug">{act.title}</h4>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    act.isPrimary ? 'text-brand-subtle font-medium' : 'text-slate-500'
                  }`}
                >
                  {act.subtitle}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 flex items-center justify-between text-xs font-bold ${
                  act.isPrimary ? 'border-t border-white/20 text-white' : 'border-t border-slate-300/60 text-brand'
                }`}
              >
                <span>Launch Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );

          if (act.href) {
            return (
              <Link key={act.title} href={act.href} target={act.target}>
                {content}
              </Link>
            );
          }

          return (
            <div key={act.title} onClick={act.onClick}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
