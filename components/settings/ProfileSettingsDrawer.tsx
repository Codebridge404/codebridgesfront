/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Unified Profile & Display Preferences Slide Drawer
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Type,
  Palette,
  Layout,
  Volume2,
  VolumeX,
  Eye,
  RotateCcw,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { Portal } from '@/components/ui/Portal';
import { badgeStyles } from '@/lib/theme';
import {
  UserThemePreferences,
  DEFAULT_PREFERENCES,
  LIGHT_BG_COLORS,
  ACCENT_COLORS,
  applyUserThemePreferences,
} from './UserSettingsModal';

export interface ProfileSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  user: any;
  avatarUrl: string | null;
  userInitials: string;
  roleTitle: string;
  profileRoute: string;
  onLogout: () => void;
}

export function ProfileSettingsDrawer({
  isOpen,
  onClose,
  side = 'right',
  user,
  avatarUrl,
  userInitials,
  roleTitle,
  profileRoute,
  onLogout,
}: ProfileSettingsDrawerProps) {
  const [prefs, setPrefs] = useState<UserThemePreferences>(DEFAULT_PREFERENCES);
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('cb_user_preferences');
      if (raw) {
        setPrefs({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
      }
    } catch {
      // ignore storage errors
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const updatePreference = <K extends keyof UserThemePreferences>(
    key: K,
    value: UserThemePreferences[K]
  ) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_user_preferences', JSON.stringify(next));
      applyUserThemePreferences(next);
      window.dispatchEvent(new CustomEvent('cb_theme_updated', { detail: next }));
    }
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1400);
  };

  const handleResetDefaults = () => {
    setPrefs(DEFAULT_PREFERENCES);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_user_preferences', JSON.stringify(DEFAULT_PREFERENCES));
      applyUserThemePreferences(DEFAULT_PREFERENCES);
      window.dispatchEvent(new CustomEvent('cb_theme_updated', { detail: DEFAULT_PREFERENCES }));
    }
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1400);
  };

  const isDarkPreview =
    prefs.theme === 'dark' ||
    (prefs.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const previewSurfaceBg = isDarkPreview ? '#090d16' : prefs.lightBgColor || '#F8FAFD';
  const slideOffset = side === 'left' ? '-100%' : '100%';

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div
            className={`fixed inset-0 z-[9999] cb-modal-backdrop flex ${
              side === 'left' ? 'justify-start' : 'justify-end'
            }`}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: slideOffset }}
              animate={{ x: 0 }}
              exit={{ x: slideOffset }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm sm:max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col font-sans text-slate-800 dark:text-slate-100 ${
                side === 'left'
                  ? 'border-r border-slate-200/90 dark:border-slate-800'
                  : 'border-l border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {/* Top Profile Identity Header */}
              <div className="px-4 py-3.5 bg-slate-50/60 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 space-y-2.5 shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name || 'User'}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.email || ''}
                      </p>
                      <span className={`inline-block mt-1 ${badgeStyles.brand}`}>
                        {roleTitle}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Link to Full Profile Page (frameless row) */}
                <Link
                  href={profileRoute}
                  onClick={onClose}
                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-brand" />
                    <span>My Profile</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Scrollable Display Preferences Section (Compact & Frameless) */}
              <div className="px-4 py-3.5 overflow-y-auto flex-1 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Display Preferences
                  </span>
                  {savedBadge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      Saved
                    </span>
                  )}
                </div>

                {/* Theme (compact frameless segmented bar) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sun className="w-3 h-3 text-brand" />
                    <span>Theme</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/70">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = prefs.theme === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updatePreference('theme', item.id as any)}
                          className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] font-bold ${
                            active
                              ? 'bg-brand text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color Swatches (compact) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-brand" />
                    <span>Accent Color</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ACCENT_COLORS.map((c) => {
                      const active = prefs.accentColor.toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          title={c.name}
                          onClick={() => updatePreference('accentColor', c.hex)}
                          className={`w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                            active
                              ? 'ring-2 ring-offset-2 ring-brand dark:ring-offset-slate-900 scale-110'
                              : 'hover:scale-105 opacity-90 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {active && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Size (compact segmented bar) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Type className="w-3 h-3 text-brand" />
                    <span>Text Size</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/70">
                    {[
                      { id: 'compact', label: 'Small', scale: '14px' },
                      { id: 'standard', label: 'Default', scale: '16px' },
                      { id: 'large', label: 'Large', scale: '18px' },
                    ].map((item) => {
                      const active = prefs.fontSize === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          title={item.scale}
                          onClick={() => updatePreference('fontSize', item.id as any)}
                          className={`py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                            active
                              ? 'bg-brand text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Canvas Surface & Light Tint (compact, no outer frames) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Layout className="w-3 h-3 text-brand" />
                      <span>Canvas</span>
                    </label>
                    {prefs.theme !== 'dark' && (
                      <div className="flex items-center gap-1">
                        {LIGHT_BG_COLORS.map((bg) => {
                          const active =
                            (prefs.lightBgColor || '#F8FAFD').toLowerCase() === bg.hex.toLowerCase();
                          return (
                            <button
                              key={bg.hex}
                              type="button"
                              onClick={() => updatePreference('lightBgColor', bg.hex)}
                              title={bg.name}
                              className={`w-4 h-4 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                active
                                  ? 'border-brand ring-2 ring-brand/40 scale-110'
                                  : 'border-slate-300 hover:scale-105'
                              }`}
                              style={{ backgroundColor: bg.hex }}
                            >
                              {active && <Check className="w-2 h-2 text-brand" />}
                            </button>
                          );
                        })}
                        <input
                          type="color"
                          title="Custom Background Tint"
                          value={prefs.lightBgColor || '#F8FAFD'}
                          onChange={(e) =>
                            updatePreference('lightBgColor', e.target.value.toUpperCase())
                          }
                          className="w-4 h-4 rounded-full border border-slate-300 cursor-pointer p-0 bg-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'flat', label: 'Flat' },
                      { id: 'mesh', label: 'Mesh' },
                      { id: 'grid', label: 'Grid' },
                    ].map((item) => {
                      const active = prefs.canvasStyle === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            updatePreference(
                              'canvasStyle',
                              item.id as UserThemePreferences['canvasStyle']
                            )
                          }
                          className={`p-1 rounded-xl text-center transition-all cursor-pointer ${
                            active
                              ? 'ring-2 ring-brand bg-brand-subtle/30 dark:bg-brand/15'
                              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div
                            className="relative h-6 w-full rounded-lg mb-1 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
                            style={{ backgroundColor: previewSurfaceBg }}
                          >
                            {item.id === 'mesh' && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: `radial-gradient(circle at 15% 20%, ${prefs.accentColor}35, transparent 55%), radial-gradient(circle at 85% 80%, rgba(139,92,246,0.22), transparent 55%)`,
                                }}
                              />
                            )}
                            {item.id === 'grid' && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: `linear-gradient(to right, ${prefs.accentColor}28 1px, transparent 1px), linear-gradient(to bottom, ${prefs.accentColor}28 1px, transparent 1px)`,
                                  backgroundSize: '7px 7px',
                                }}
                              />
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              active ? 'text-brand' : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frameless Compact Toggles */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => updatePreference('soundEnabled', !prefs.soundEnabled)}
                    className="w-full flex items-center justify-between px-1.5 py-1.5 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      {prefs.soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-brand" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Sound Chimes</span>
                    </span>
                    <span
                      className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                        prefs.soundEnabled
                          ? 'bg-brand justify-end'
                          : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white shadow-2xs block" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updatePreference('highContrast', !prefs.highContrast)}
                    className="w-full flex items-center justify-between px-1.5 py-1.5 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      <Eye
                        className={`w-3.5 h-3.5 ${
                          prefs.highContrast ? 'text-brand' : 'text-slate-400'
                        }`}
                      />
                      <span>High Contrast</span>
                    </span>
                    <span
                      className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                        prefs.highContrast
                          ? 'bg-brand justify-end'
                          : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white shadow-2xs block" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer: Reset + Sign Out */}
              <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
