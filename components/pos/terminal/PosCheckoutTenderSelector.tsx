'use client';

import React from 'react';
import { Banknote, CreditCard, Wallet } from 'lucide-react';

export type PosTenderType = 'cash' | 'khqr' | 'card' | 'store_credit';

interface PosCheckoutTenderSelectorProps {
  tenderType: PosTenderType;
  onSelectTender: (type: PosTenderType) => void;
  customerCredit?: number;
}

export function PosCheckoutTenderSelector({
  tenderType,
  onSelectTender,
  customerCredit = 0,
}: PosCheckoutTenderSelectorProps) {
  const hasStoreCredit = customerCredit > 0;

  return (
    <div className={`grid gap-2 ${hasStoreCredit ? 'grid-cols-4' : 'grid-cols-3'}`}>
      <button
        type="button"
        onClick={() => onSelectTender('cash')}
        className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
          tenderType === 'cash'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Banknote className="w-4 h-4 text-emerald-600" />
        <span>Cash</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTender('khqr')}
        className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
          tenderType === 'khqr'
            ? 'bg-brand-subtle text-brand border-brand/40 shadow-xs'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <img src="/BakongKHQR/Bakong.png" alt="Bakong KHQR" className="w-4 h-4 rounded-xs object-contain" />
        <span className="truncate">Bakong KHQR</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTender('card')}
        className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
          tenderType === 'card'
            ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <CreditCard className="w-4 h-4 text-blue-600" />
        <span>Card</span>
      </button>

      {hasStoreCredit && (
        <button
          type="button"
          onClick={() => onSelectTender('store_credit')}
          className={`p-2 rounded-xl border text-xs font-black flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            tenderType === 'store_credit'
              ? 'bg-purple-50 text-purple-900 border-purple-300 shadow-xs'
              : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
          }`}
          title={`Pay with Store Credit (Available: $${customerCredit.toFixed(2)})`}
        >
          <Wallet className="w-4 h-4 text-purple-600" />
          <span className="text-[11px] truncate">Store Credit</span>
          <span className="font-mono text-[9px] text-purple-600 font-bold">${customerCredit.toFixed(2)}</span>
        </button>
      )}
    </div>
  );
}
