'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardStyles } from '@/lib/theme';
import { cardHoverMotion } from '@/lib/animations';

export interface ModuleCardProps {
  name: string;
  category: string;
  icon?: LucideIcon;
  logoUrl?: string;
  color?: string;
  bgColor?: string;
  cardBg?: string;
  description?: string;
  actionSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  statusDot?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'compact' | 'standard';
}

export function ModuleCard({
  name,
  category,
  icon: IconComponent,
  logoUrl,
  color = 'text-brand',
  bgColor = 'bg-brand-subtle',
  cardBg,
  description,
  actionSlot,
  footerSlot,
  statusDot = false,
  isSelected = false,
  onClick,
  className,
  size = 'compact',
}: ModuleCardProps) {
  const isClickable = Boolean(onClick);

  if (size === 'compact') {
    return (
      <div
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        className={cn(
          cardStyles.compact,
          'p-3.5 gap-3 min-h-[105px] flex flex-col justify-between',
          isClickable && 'cursor-pointer hover:shadow-xs active:scale-[0.99]',
          isSelected ? cardStyles.selected : 'hover:border-slate-300/90',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-2xs shrink-0 overflow-hidden',
              logoUrl ? 'bg-white border border-slate-200/80 p-1' : cn(bgColor, color)
            )}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
            ) : IconComponent ? (
              React.createElement(IconComponent, { className: 'w-4 h-4' })
            ) : null}
          </div>
          {actionSlot && <div className="shrink-0">{actionSlot}</div>}
        </div>

        <div className="min-w-0">
          <h4 className="font-extrabold text-xs text-slate-900 truncate" title={name}>
            {name}
          </h4>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            {category}
          </span>
        </div>
      </div>
    );
  }

  // Standard size: Used in Launchpad grids & ecosystem views
  return (
    <motion.div
      {...cardHoverMotion}
      onClick={onClick}
      className={cn(
        cardStyles.base,
        cardBg,
        'p-5 flex flex-col justify-between h-[195px] select-none hover:shadow-md transition-all',
        isSelected ? 'border-emerald-300' : 'border-slate-300/80',
        isClickable && 'cursor-pointer',
        className
      )}
    >
      <div>
        {/* Top: Icon Badge, Title & Status Dot */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs overflow-hidden',
                logoUrl ? 'bg-white border border-slate-200/80 p-1.5' : cn(bgColor, color)
              )}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
              ) : IconComponent ? (
                React.createElement(IconComponent, { className: 'w-4 h-4' })
              ) : null}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-slate-900 truncate">{name}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate">{category}</p>
            </div>
          </div>
          {statusDot && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0 ml-2" />
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mt-2">
            {description}
          </p>
        )}
      </div>

      {/* Footer: Live State & Dynamic Actions */}
      {footerSlot && (
        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
          {footerSlot}
        </div>
      )}
    </motion.div>
  );
}
