/**
 * CodeBridges Apple Design System Tokens & Style Presets
 * Inspired by Apple's "Designing Fluid Interfaces" & Human Interface Guidelines.
 * Standardizes translucent materials, optical typography, tactile button physics, and depth layers.
 */

export const glassStyles = {
  // Tier 1: Floating Navigation Chrome (Header, Bottom Nav)
  chrome: 'bg-white/75 backdrop-blur-2xl backdrop-saturate-190 border-b border-white/60 shadow-2xs',
  // Tier 2: Floating Functional Panels, Sheets & Modals
  surface: 'bg-white/85 backdrop-blur-2xl backdrop-saturate-180 border border-white/70 shadow-xl',
  // Tier 3: Interactive Elevated Controls, Chips & Segmented Pickers
  control: 'bg-white/90 backdrop-blur-md border border-white/80 shadow-2xs',
  // Tier 4: Scrim Dimmer (Progressive modal backdrop)
  scrim: 'bg-slate-950/40 backdrop-blur-md',
};

export const cardStyles = {
  // Standard container card with rounded-2xl, glassmorphic fill, and light-catching edge
  base: 'bg-white/70 backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/80 shadow-2xs',
  // Interactive card with instant pointer-down depression and elevated hover
  interactive: 'bg-white/70 backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/80 hover:border-slate-300/80 hover:bg-white/85 hover:shadow-xs transition-all active:scale-[0.985] cursor-pointer select-none',
  // Compact card (used in dense administrative grids)
  compact: 'bg-white/70 backdrop-blur-xl rounded-xl border border-white/80 transition-all select-none',
  // Selected state card
  selected: 'border-brand bg-brand-subtle/80 shadow-2xs ring-1 ring-brand/30',
  // Muted/dashed card for dropzones or empty slots
  dashed: 'border-2 border-dashed border-slate-300/80 rounded-2xl p-8 text-center bg-white/40 backdrop-blur-md',
};

export const badgeStyles = {
  // Live running / active state
  active: 'text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1',
  // Disabled / inactive state
  inactive: 'text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1',
  // Warning / pending
  warning: 'text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1',
  // Critical / error
  danger: 'text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1',
  // Platform brand pill
  brand: 'text-[10px] font-black text-brand bg-brand-subtle px-2.5 py-0.5 rounded-full border border-brand/20 inline-flex items-center gap-1',
};

export const buttonStyles = {
  // Primary platform action button with instant active scale
  primary: 'px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs',
  // Secondary neutral button with frosted background
  secondary: 'px-4 py-2 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 font-bold text-xs transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs',
  // Subtle brand action button (e.g. "+ Enable Service")
  brandSubtle: 'px-3 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand text-brand hover:text-white border border-brand/20 font-extrabold text-xs transition-all active:scale-[0.97] flex items-center gap-1.5 cursor-pointer',
  // Danger button
  danger: 'px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 font-bold text-xs transition-all active:scale-[0.97] cursor-pointer',
  // Icon action button (e.g. power, close, refresh)
  icon: 'p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all active:scale-[0.92] cursor-pointer',
};

export const inputStyles = {
  // Standard text input
  base: 'w-full px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-2xs transition-all',
  // Search input with icon padding
  search: 'w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60 shadow-2xs transition-all',
};

export const typography = {
  pageTitle: 'text-xl sm:text-2xl font-black text-slate-900 tracking-[-0.025em] leading-tight',
  sectionTitle: 'text-sm font-black text-slate-900 tracking-[-0.015em]',
  cardTitle: 'font-extrabold text-slate-900 tracking-[-0.01em] truncate',
  bodyText: 'text-xs text-slate-600 font-medium leading-relaxed tracking-normal',
  microLabel: 'text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.04em]',
};
