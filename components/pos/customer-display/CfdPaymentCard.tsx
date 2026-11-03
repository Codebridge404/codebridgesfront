'use client';

import React from 'react';
import { QrCode } from 'lucide-react';

interface CfdPaymentCardProps {
  subtotal: number;
  tax: number;
  grandTotal: number;
  taxLabel?: string;
  isTaxEnabled?: boolean;
}

export function CfdPaymentCard({ subtotal, tax, grandTotal, taxLabel = 'VAT', isTaxEnabled = true }: CfdPaymentCardProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between text-center">
      <div className="space-y-3">
        <span className="text-xs text-slate-500 font-black uppercase tracking-wider">
          Scan to Pay via Bakong KHQR
        </span>
        <div className="w-52 h-52 bg-white rounded-2xl mx-auto p-3 flex items-center justify-center border-4 border-red-600 shadow-md">
          <QrCode className="w-40 h-40 text-slate-900" />
        </div>
        <p className="text-xs text-slate-500 font-semibold">
          Accepts Bakong, ABA Mobile, ACLEDA, Canadia, & All Banks
        </p>
      </div>

      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-semibold">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span className="font-bold font-mono">${subtotal.toFixed(2)}</span>
        </div>
        {isTaxEnabled && (
          <div className="flex justify-between text-slate-600">
            <span>{taxLabel}:</span>
            <span className="font-bold font-mono">${tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-black text-brand border-t border-slate-200 pt-3">
          <span>Total Due:</span>
          <span className="font-mono">${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
