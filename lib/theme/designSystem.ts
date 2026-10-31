/**
 * CodeBridges Global Design System Tokens & Style Presets
 * Standardizes common styling combinations across the enterprise platform.
 */

export const cardStyles = {
  // Standard container card with rounded-2xl, glassmorphic fill, and subtle border
  base: 'bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xs',
  // Interactive card with hover translation and elevated shadow
  interactive: 'bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 hover:border-slate-300/90 hover:bg-white/75 hover:shadow-xs transition-all cursor-pointer select-none',
  // Compact card (used in dense administrative grids)
  compact: 'bg-white/60 backdrop-blur-xl rounded-xl border border-white/60 transition-all select-none',
  // Selected state card
  selected: 'border-brand bg-brand-subtle/80 shadow-2xs ring-1 ring-brand/30',
  // Muted/dashed card for dropzones or empty slots
  dashed: 'border-2 border-dashed border-slate-300/80 rounded-2xl p-8 text-center bg-white/30 backdrop-blur-md',
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
  // Primary platform action button
  primary: 'px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]',
  // Secondary neutral button
  secondary: 'px-4 py-2 rounded-xl bg-transparent hover:bg-slate-200/50 border border-slate-300/80 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]',
  // Subtle brand action button (e.g. "+ Enable Service")
  brandSubtle: 'px-3 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand text-brand hover:text-white border border-brand/20 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer',
  // Danger button
  danger: 'px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 font-bold text-xs transition-colors cursor-pointer',
  // Icon action button (e.g. power, close, refresh)
  icon: 'p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer',
};

export const inputStyles = {
  // Standard text input
  base: 'w-full px-3 py-2 rounded-xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-2xs transition-all',
  // Search input with icon padding
  search: 'w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60 shadow-2xs transition-all',
};

export const typography = {
  pageTitle: 'text-xl sm:text-2xl font-black text-slate-900 tracking-tight',
  sectionTitle: 'text-sm font-black text-slate-900 tracking-tight',
  cardTitle: 'font-extrabold text-slate-900 truncate',
  bodyText: 'text-xs text-slate-500 font-medium leading-relaxed',
  microLabel: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider',
};
