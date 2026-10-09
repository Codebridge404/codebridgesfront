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
}

export function PosOrderContextBar({
  customer,
  table,
  orderType,
  onOpenCustomerModal,
  onOpenTableModal,
}: PosOrderContextBarProps) {
  const points = Number(customer?.loyalty_points || 0);
  const credit = Number(customer?.store_credit || 0);

  return (
    <div className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs font-sans text-xs">
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

      {/* 2. Dining / Table Selector Trigger */}
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
    </div>
  );
}
