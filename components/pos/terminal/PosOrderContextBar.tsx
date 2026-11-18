'use client';

import React from 'react';
import { User, UtensilsCrossed, Star, Wallet, Coffee, ShoppingBag, Truck, ChevronDown } from 'lucide-react';
import { PosCustomer, PosTable } from './usePosCustomerAndTable';

interface PosOrderContextBarProps {
  customer: PosCustomer | null;
  table: PosTable | null;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  onOpenCustomerModal: () => void;
  onOpenTableModal: () => void;
  tablesEnabled?: boolean;
  variant?: 'card' | 'header';
}

export function PosOrderContextBar({
  customer,
  table,
  orderType,
  onOpenCustomerModal,
  onOpenTableModal,
  tablesEnabled = true,
  variant = 'card',
}: PosOrderContextBarProps) {
  const points = Number(customer?.loyalty_points || 0);
  const credit = Number(customer?.store_credit || 0);

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-1.5 font-sans text-xs">
        <button
          type="button"
          onClick={onOpenCustomerModal}
          className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 transition-colors flex items-center gap-2 text-left cursor-pointer border border-slate-200/80 shadow-2xs whitespace-nowrap"
          title="Attach Customer for Loyalty & Store Credit"
        >
          <User className="w-3.5 h-3.5 text-brand shrink-0" />
          <span className="font-extrabold text-[11px] text-slate-800 max-w-[140px] truncate">
            {customer ? customer.name : 'Walk-in Customer'}
          </span>
          {customer ? (
            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              {points}p
              {credit > 0 && <span className="text-emerald-700 font-mono ml-1">${credit.toFixed(2)}</span>}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-brand">+ Attach</span>
          )}
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>

        {tablesEnabled && (
          <button
            type="button"
            onClick={onOpenTableModal}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-left cursor-pointer border border-slate-200/80 shadow-2xs whitespace-nowrap"
            title="Select Dine-in Table or Takeaway"
          >
            {orderType === 'dine_in' ? (
              <Coffee className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            ) : orderType === 'takeaway' ? (
              <ShoppingBag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            ) : (
              <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            )}
            <span className="font-extrabold text-[11px] text-slate-800">
              {orderType === 'dine_in'
                ? table ? table.name : 'Dine-In'
                : orderType === 'takeaway'
                ? 'Takeaway'
                : 'Delivery'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${tablesEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs font-sans text-xs`}>
      {/* 1. Customer Selector Trigger */}
      <button
        type="button"
        onClick={onOpenCustomerModal}
        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left cursor-pointer border border-slate-200/60"
        title="Attach Customer for Loyalty & Store Credit"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-brand-subtle text-brand flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-[11px] text-slate-800 truncate">
              {customer ? customer.name : 'Walk-in Customer'}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 truncate">
              {customer ? (
                <>
                  <span className="text-amber-700 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    {points}p
                  </span>
                  {credit > 0 && <span className="text-emerald-700 font-mono">${credit.toFixed(2)}</span>}
                </>
              ) : (
                <span>+ Attach</span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* 2. Dining / Table Selector Trigger (F&B / Restaurant only) */}
      {tablesEnabled && (
        <button
          type="button"
          onClick={onOpenTableModal}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left cursor-pointer border border-slate-200/60"
          title="Select Dine-in Table or Takeaway"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              {orderType === 'dine_in' ? (
                <Coffee className="w-3.5 h-3.5" />
              ) : orderType === 'takeaway' ? (
                <ShoppingBag className="w-3.5 h-3.5" />
              ) : (
                <Truck className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-[11px] text-slate-800 truncate">
                {orderType === 'dine_in'
                  ? table ? table.name : 'Dine-In'
                  : orderType === 'takeaway'
                  ? 'Takeaway'
                  : 'Delivery'}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold truncate">
                {orderType === 'dine_in' ? (table ? table.zone || 'Open' : '+ Pick Table') : 'Counter Order'}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      )}
    </div>
  );
}
