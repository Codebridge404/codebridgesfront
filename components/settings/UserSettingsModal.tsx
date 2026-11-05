/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0138
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

export interface UserThemePreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'compact' | 'standard' | 'large';
  accentColor: string;
  canvasStyle: 'mesh' | 'flat' | 'grid';
  soundEnabled: boolean;
  highContrast: boolean;
}

const DEFAULT_PREFERENCES: UserThemePreferences = {
  theme: 'light',
  fontSize: 'standard',
  accentColor: '#2563EB',
  canvasStyle: 'mesh',
  soundEnabled: true,
  highContrast: false,
};

const ACCENT_COLORS = [
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
  } else {
    root.classList.remove('dark');
  }

  // 2. Font Size
  root.setAttribute('data-font-size', prefs.fontSize);

  // 3. Canvas Style
  root.setAttribute('data-canvas-style', prefs.canvasStyle);

  // 4. Accent Color
  const selectedAccent = ACCENT_COLORS.find((c) => c.hex.toLowerCase() === prefs.accentColor.toLowerCase()) || ACCENT_COLORS[0];
  root.style.setProperty('--color-brand', selectedAccent.hex);
  root.style.setProperty('--color-brand-hover', selectedAccent.hover);
  root.style.setProperty('--color-brand-subtle', selectedAccent.subtle);
  root.style.setProperty('--color-brand-border', selectedAccent.border);

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
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_user_preferences', JSON.stringify(next));
        applyUserThemePreferences(next);
        window.dispatchEvent(new CustomEvent('cb_theme_updated', { detail: next }));
      }
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 1500);
      return next;
    });
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={appleSpring}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-800 dark:text-slate-100 divide-y divide-slate-100 dark:divide-slate-800/80"
        >
          {/* Modal Header */}
          <div className="px-6 py-4.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shadow-2xs">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    Display &amp; Experience Preferences
                  </h3>
                  {savedBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-in fade-in zoom-in">
                      Saved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Custom themes, font size, and UI styles for your account.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* 1. Theme Mode */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Appearance Theme</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean bright canvas' },
                  { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Obsidian deep contrast' },
                  { id: 'system', label: 'System Default', icon: Monitor, desc: 'Sync with OS setting' },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = prefs.theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updatePreference('theme', item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        active
                          ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-xs ring-1 ring-brand'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-brand' : 'text-slate-400'}`} />
                        {active && <Check className="w-3.5 h-3.5 text-brand" />}
                      </div>
                      <p className={`text-xs font-black ${active ? 'text-brand' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Font Size Scaling */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                <span>Interface Font Scaling</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'compact', label: 'Compact (85%)', scale: '14px', desc: 'Dense ERP tables' },
                  { id: 'standard', label: 'Standard (100%)', scale: '16px', desc: 'Balanced layout' },
                  { id: 'large', label: 'Comfortable (115%)', scale: '18px', desc: 'High readability' },
                ].map((item) => {
                  const active = prefs.fontSize === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updatePreference('fontSize', item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-xs ring-1 ring-brand'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{item.scale}</span>
                        {active && <Check className="w-3.5 h-3.5 text-brand" />}
                      </div>
                      <p className={`text-xs font-black ${active ? 'text-brand' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Primary Accent / Brand Color */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Brand &amp; Accent Palette</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ACCENT_COLORS.map((c) => {
                  const active = prefs.accentColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => updatePreference('accentColor', c.hex)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        active
                          ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-xs ring-1 ring-slate-900 dark:ring-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs flex items-center justify-center"
                        style={{ backgroundColor: c.hex }}
                      >
                        {active && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      <span className="text-xs font-extrabold truncate text-slate-800 dark:text-slate-200">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Canvas Background Glow */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5" />
                <span>Canvas Background Surface</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'mesh', label: 'Aurora Mesh', desc: 'Ambient glassmorphic glow' },
                  { id: 'flat', label: 'Minimal Flat', desc: 'Solid uniform canvas' },
                  { id: 'grid', label: 'Technical Grid', desc: 'Precision graph backdrop' },
                ].map((item) => {
                  const active = prefs.canvasStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updatePreference('canvasStyle', item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-xs ring-1 ring-brand'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Sparkles className={`w-3.5 h-3.5 ${active ? 'text-brand' : 'text-slate-400'}`} />
                        {active && <Check className="w-3.5 h-3.5 text-brand" />}
                      </div>
                      <p className={`text-xs font-black ${active ? 'text-brand' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Audio & Ergonomics Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    {prefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Sound Chimes</p>
                    <p className="text-[10px] text-slate-400">Play confirmation chimes on barcode scans and tenders</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePreference('soundEnabled', !prefs.soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    prefs.soundEnabled ? 'bg-brand justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-2xs block" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">High-Contrast Outlines</p>
                    <p className="text-[10px] text-slate-400">Enhance borders and boundaries for high-glare environments</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePreference('highContrast', !prefs.highContrast)}
                  className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    prefs.highContrast ? 'bg-brand justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-2xs block" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-extrabold hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

