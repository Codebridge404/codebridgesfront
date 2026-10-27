'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export type LoaderVariant = 'fullscreen' | 'embedded' | 'bar' | 'spinner';

export interface GlobalLoaderProps {
  /** Visual presentation mode */
  variant?: LoaderVariant;
  /** Primary loading title */
  text?: string;
  /** Secondary informational subtitle */
  subtitle?: string;
  /** Optional custom CSS class */
  className?: string;
  /** Show subtle pulse effect on logo */
  showLogo?: boolean;
}

/**
 * CodeBridges Unified Global Loading UI
 * High-aesthetic, glassmorphic loading state with aurora radiance,
 * glowing orbit rings, and synchronized micro-animations.
 */
export function GlobalLoader({
  variant = 'fullscreen',
  text = 'Loading CodeBridges...',
  subtitle = 'Synchronizing enterprise services and workspace context',
  className = '',
  showLogo = true,
}: GlobalLoaderProps) {
  // 1. Top Slim Indeterminate Progress Bar
  if (variant === 'bar') {
    return (
      <div className={`fixed top-0 left-0 right-0 z-[10000] h-1 overflow-hidden bg-brand-subtle ${className}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.8)]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: 'easeInOut',
          }}
          style={{ width: '50%' }}
        />
      </div>
    );
  }

  // 2. Standalone Compact Brand Spinner
  if (variant === 'spinner') {
    return (
      <div className={`inline-flex items-center justify-center relative ${className}`}>
        {/* Ambient Ring */}
        <div className="w-8 h-8 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
        {/* Glow Core */}
        <div className="absolute w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(37,99,235,0.9)] animate-pulse" />
      </div>
    );
  }

  // 3. Embedded Container / Card Loading View
  if (variant === 'embedded') {
    return (
      <div
        className={`w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center select-none bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden ${className}`}
      >
        {/* Background Aurora Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Dual Orbit Ring */}
          <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-dashed border-brand/40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1.5 rounded-xl border-2 border-brand border-t-transparent shadow-[0_0_10px_rgba(37,99,235,0.3)]"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
            />
            {showLogo && (
              <div className="relative z-10 w-7 h-7 flex items-center justify-center">
                <Image
                  src="/logo/Codebridge.svg"
                  alt="CodeBridges"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain drop-shadow-xs"
                  priority
                />
              </div>
            )}
          </div>

          <h4 className="text-xs font-black text-slate-800 tracking-tight">{text}</h4>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-xs leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 4. Fullscreen Immersive Glassmorphic Experience
  return (
    <div
      aria-live="polite"
      role="status"
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl select-none transition-all ${className}`}
    >
      {/* Top Progress Beam */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-brand-subtle/50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.8)]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: 'easeInOut',
          }}
          style={{ width: '40%' }}
        />
      </div>

      {/* Aurora Glass Canvas Radiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-cyan-400/15 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-blue-400/10 blur-2xl animate-pulse" />
      </div>

      {/* Central Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center max-w-sm w-full mx-auto p-7 rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-blue-900/5 text-center"
      >
        {/* Animated Brand Core with Orbiting Halo */}
        <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
          {/* Subtle Outer Pulse Halo */}
          <div className="absolute inset-0 rounded-full bg-brand/10 blur-md animate-ping" style={{ animationDuration: '3s' }} />

          {/* Outer Dashed Orbit Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-brand/30"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          />

          {/* Inner High-Speed Glowing Ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-brand border-t-transparent shadow-[0_0_16px_rgba(37,99,235,0.45)]"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          />

          {/* Glass Island Core */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center p-2.5">
            <Image
              src="/logo/Codebridge.svg"
              alt="CodeBridges Logo"
              width={38}
              height={38}
              className="w-full h-full object-contain drop-shadow-sm"
              priority
            />
          </div>
        </div>

        {/* Title and Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-subtle border border-brand/20 text-brand text-[10px] font-black uppercase tracking-wider mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          CodeBridge@ Cloud Suite
        </div>

        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
          {text}
        </h3>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Dynamic Skeleton Loader Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-brand"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
