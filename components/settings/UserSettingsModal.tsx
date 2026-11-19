/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0170 - System-Wide Light/Dark/System Theme & High-Contrast Engine
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
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
  Sparkles,
} from 'lucide-react';
import { appleSpring, pressSpring } from '@/lib/animations';
import { Portal } from '@/components/ui/Portal';

export interface UserThemePreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'compact' | 'standard' | 'large';
  accentColor: string;
  lightBgColor: string;
  canvasStyle: 'mesh' | 'flat' | 'grid';
  soundEnabled: boolean;
  highContrast: boolean;
}

export const DEFAULT_PREFERENCES: UserThemePreferences = {
  theme: 'light',
  fontSize: 'standard',
  accentColor: '#2563EB',
  lightBgColor: '#F8FAFD',
  canvasStyle: 'mesh',
  soundEnabled: true,
  highContrast: false,
};

export const LIGHT_BG_COLORS = [
  { name: 'Aurora Ice', hex: '#F8FAFD', desc: 'Default' },
  { name: 'Enterprise Gray', hex: '#EAEBED', desc: 'RGB(234, 235, 237)' },
  { name: 'Soft Sky', hex: '#F0F6FF', desc: 'Cool tint' },
  { name: 'Pure White', hex: '#FFFFFF', desc: 'Clean paper' },
];

export const ACCENT_COLORS = [
  { name: 'Royal Sapphire', hex: '#2563EB', hover: '#1D4ED8', subtle: '#EFF6FF', border: '#BFDBFE' },
  { name: 'Emerald Mint', hex: '#059669', hover: '#047857', subtle: '#ECFDF5', border: '#A7F3D0' },
  { name: 'Electric Violet', hex: '#7C3AED', hover: '#6D28D9', subtle: '#F5F3FF', border: '#DDD6FE' },
  { name: 'Crimson Rose', hex: '#E11D48', hover: '#BE123C', subtle: '#FFF1F2', border: '#FECDD3' },
  { name: 'Amber Gold', hex: '#D97706', hover: '#B45309', subtle: '#FFFBEB', border: '#FDE68A' },
  { name: 'Slate Obsidian', hex: '#334155', hover: '#1E293B', subtle: '#F8FAFC', border: '#CBD5E1' },
];

export function applyUserThemePreferences(prefs: UserThemePreferences) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // 1. Theme (Light/Dark/System)
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = prefs.theme === 'dark' || (prefs.theme === 'system' && prefersDark);
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Font Size
  root.setAttribute('data-font-size', prefs.fontSize);

  // 3. Canvas Style
  root.setAttribute('data-canvas-style', prefs.canvasStyle);

  // 4. Accent Color (theme-aware subtle & border tokens)
  const selectedAccent = ACCENT_COLORS.find((c) => c.hex.toLowerCase() === prefs.accentColor.toLowerCase()) || ACCENT_COLORS[0];
  root.style.setProperty('--color-brand', selectedAccent.hex);
  root.style.setProperty('--color-brand-hover', selectedAccent.hover);
  root.style.setProperty(
    '--color-brand-subtle',
    isDark ? `color-mix(in srgb, ${selectedAccent.hex} 18%, transparent)` : selectedAccent.subtle
  );
  root.style.setProperty(
    '--color-brand-border',
    isDark ? `color-mix(in srgb, ${selectedAccent.hex} 38%, transparent)` : selectedAccent.border
  );

  // 4b. Light Mode Background Color
  if (!isDark) {
    const lightBg = prefs.lightBgColor || '#F8FAFD';
    root.style.setProperty('--color-light-bg', lightBg);
    root.style.setProperty('--color-canvas', lightBg);
  } else {
    root.style.removeProperty('--color-light-bg');
    root.style.removeProperty('--color-canvas');
  }

  // 5. High Contrast
  if (prefs.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
}

export function getUserThemePreferences(): UserThemePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem('cb_user_preferences');
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const [prefs, setPrefs] = useState<UserThemePreferences>(DEFAULT_PREFERENCES);
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getUserThemePreferences();
      setPrefs(current);
    }
  }, [isOpen]);

  const updatePreference = <K extends keyof UserThemePreferences>(key: K, value: UserThemePreferences[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_user_preferences', JSON.stringify(next));
      applyUserThemePreferences(next);
      window.dispatchEvent(new CustomEvent('cb_theme_updated', { detail: next }));
    }
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  };

  const handleResetDefaults = () => {
    setPrefs(DEFAULT_PREFERENCES);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_user_preferences', JSON.stringify(DEFAULT_PREFERENCES));
      applyUserThemePreferences(DEFAULT_PREFERENCES);
      window.dispatchEvent(new CustomEvent('cb_theme_updated', { detail: DEFAULT_PREFERENCES }));
    }
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  };

  if (!isOpen) return null;

  const isDarkPreview =
    prefs.theme === 'dark' ||
    (prefs.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const previewSurfaceBg = isDarkPreview ? '#090d16' : prefs.lightBgColor || '#F8FAFD';

  return (
    <Portal>
      <AnimatePresence>
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 cb-modal-backdrop animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={appleSpring}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-800 dark:text-slate-100 flex flex-col max-h-[88vh]"
          >
            {/* Unified Modal Header (matches Modal.tsx) */}
            <div className="px-4 py-3.5 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-subtle text-brand border border-brand-border flex items-center justify-center">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Display Preferences
                </h3>
                {savedBadge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    Saved
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Compact Single-Screen Layout */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
              {/* Top Row: Compact Preview + Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                {/* Mini Workspace Preview */}
                <div className="sm:col-span-5 rounded-xl border border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand" />
                      Preview
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {prefs.fontSize === 'compact' ? '14px' : prefs.fontSize === 'large' ? '18px' : '16px'}
                    </span>
                  </div>

                  <div
                    className="relative rounded-lg border border-slate-200/90 dark:border-slate-700/80 p-2 overflow-hidden h-16 flex flex-col justify-between transition-colors"
                    style={{ backgroundColor: previewSurfaceBg }}
                  >
                    {prefs.canvasStyle === 'mesh' && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 10% 15%, ${prefs.accentColor}26, transparent 55%), radial-gradient(circle at 90% 85%, #8B5CF622, transparent 55%)`,
                        }}
                      />
                    )}
                    {prefs.canvasStyle === 'grid' && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${prefs.accentColor}22 1px, transparent 1px), linear-gradient(to bottom, ${prefs.accentColor}22 1px, transparent 1px)`,
                          backgroundSize: '10px 10px',
                        }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: prefs.accentColor }}
                      />
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white"
                        style={{ backgroundColor: prefs.accentColor }}
                      >
                        Active
                      </span>
                    </div>
                    <div
                      className={`relative z-10 rounded-md px-2 py-1 border flex items-center justify-between ${
                        isDarkPreview
                          ? 'bg-slate-900/85 border-slate-700/80'
                          : 'bg-white/90 border-slate-200/90'
                      }`}
                    >
                      <div className="h-1.5 w-10 rounded-full bg-current opacity-20" />
                      <span
                        className="w-4 h-2.5 rounded-xs"
                        style={{ backgroundColor: prefs.accentColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance Theme Selector */}
                <div className="sm:col-span-7 space-y-1.5 flex flex-col justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-brand" />
                    <span>Theme</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 flex-1">
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
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            active
                              ? 'border-brand bg-brand-subtle/50 dark:bg-brand/15 shadow-xs ring-1 ring-brand'
                              : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              active
                                ? 'bg-brand text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[11px] font-extrabold ${
                              active ? 'text-brand' : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Middle Row: Accent Swatches + Text Size */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 items-center">
                {/* Accent Swatches */}
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
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
                          className={`w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                            active
                              ? 'ring-2 ring-offset-2 ring-brand dark:ring-offset-slate-900 scale-110 shadow-xs'
                              : 'hover:scale-105 opacity-90 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {active && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Size */}
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Type className="w-3 h-3 text-brand" />
                    <span>Text Size</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
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
                          className={`py-1.5 px-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center ${
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
              </div>

              {/* Canvas Surface & Light Tint */}
              <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Layout className="w-3 h-3 text-brand" />
                    <span>Canvas Surface</span>
                  </label>
                  {prefs.theme !== 'dark' && (
                    <div className="flex items-center gap-1.5">
                      {LIGHT_BG_COLORS.map((bg) => {
                        const active = (prefs.lightBgColor || '#F8FAFD').toLowerCase() === bg.hex.toLowerCase();
                        return (
                          <button
                            key={bg.hex}
                            type="button"
                            onClick={() => updatePreference('lightBgColor', bg.hex)}
                            title={bg.name}
                            className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                              active ? 'border-brand ring-2 ring-brand/40 scale-110' : 'border-slate-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: bg.hex }}
                          >
                            {active && <Check className="w-2.5 h-2.5 text-brand" />}
                          </button>
                        );
                      })}
                      <input
                        type="color"
                        title="Custom Background Tint"
                        value={prefs.lightBgColor || '#F8FAFD'}
                        onChange={(e) => updatePreference('lightBgColor', e.target.value.toUpperCase())}
                        className="w-4.5 h-4.5 rounded-full border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
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
                        onClick={() => updatePreference('canvasStyle', item.id as UserThemePreferences['canvasStyle'])}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'border-brand bg-brand-subtle/40 dark:bg-brand/15 shadow-xs ring-1 ring-brand'
                            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        <div
                          className="relative h-7 w-full rounded-lg mb-1 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
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
                                backgroundSize: '8px 8px',
                              }}
                            />
                          )}
                          {active && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-2 h-2" />
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] font-extrabold ${active ? 'text-brand' : 'text-slate-700 dark:text-slate-200'}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact Icon Toggles */}
              <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => updatePreference('soundEnabled', !prefs.soundEnabled)}
                  title="Toggle interactive sound chimes"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    prefs.soundEnabled
                      ? 'border-brand/40 bg-brand-subtle/30 dark:bg-brand/10'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      prefs.soundEnabled ? 'bg-brand text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {prefs.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Sound</span>
                  </div>
                  <span className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center ${
                    prefs.soundEnabled ? 'bg-brand justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}>
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-2xs block" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => updatePreference('highContrast', !prefs.highContrast)}
                  title="Toggle high-contrast borders"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    prefs.highContrast
                      ? 'border-brand/40 bg-brand-subtle/30 dark:bg-brand/10'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      prefs.highContrast ? 'bg-brand text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'
                    }`}>
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">High Contrast</span>
                  </div>
                  <span className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center ${
                    prefs.highContrast ? 'bg-brand justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}>
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-2xs block" />
                  </span>
                </button>
              </div>
            </div>

            {/* Unified Modal Footer (matches Modal.tsx) */}
            <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}

