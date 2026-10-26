'use client';

import React, { useState } from 'react';
import {
  X,
  Split,
  Users,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  Loader2,
  Receipt,
  Plus,
  Minus,
} from 'lucide-react';
import { splitBillApi, SplitBillPayload } from '@/lib/api';
import { posAudio } from '@/hooks/usePosAudio';

interface PosSplitBillModalProps {
  table: {
    id: string | number;
    name: string;
    zone?: string;
    capacity?: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function PosSplitBillModal({ table, onClose, onSuccess }: PosSplitBillModalProps) {
  const [splitType, setSplitType] = useState<'equal' | 'itemized'>('equal');
  const [equalCount, setEqualCount] = useState<number>(2);
  const [defaultTender, setDefaultTender] = useState<string>('cash');
  const [guestTenders, setGuestTenders] = useState<Record<number, string>>({
    1: 'cash',
    2: 'khqr',
    3: 'cash',
    4: 'card',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedSplits, setCompletedSplits] = useState<any[] | null>(null);

  const handleEqualCountChange = (delta: number) => {
    setEqualCount((prev) => Math.min(10, Math.max(2, prev + delta)));
  };

  const handleTenderSelect = (seat: number, tender: string) => {
    setGuestTenders((prev) => ({ ...prev, [seat]: tender }));
  };

  const handleSubmitSplit = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload: SplitBillPayload = {
        table_id: table.id,
        split_type: splitType,
        splits_count: equalCount,
        default_tender_type: defaultTender,
        splits: Array.from({ length: equalCount }, (_, idx) => {
          const seatNum = idx + 1;
          return {
            customer_name: `Guest #${seatNum}`,
            tender_type: guestTenders[seatNum] || defaultTender,
          };
        }),
      };

      const res: any = await splitBillApi(payload);
      if (res?.status === 'success' || res?.data?.split_sales) {
        posAudio.playCheckoutChime();
        setCompletedSplits(res.data?.split_sales || []);
      } else {
        throw new Error(res?.message || 'Split bill request failed');
      }
    } catch (err: any) {
      console.error('Failed to split bill:', err);
      setErrorMsg(err.message || 'Failed to split bill on server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAndClose = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">Split Table Bill</h3>
              <p className="text-xs text-slate-500 font-medium">
                {table.name} &bull; {table.zone || 'Main Dining'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {completedSplits ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
              <div className="flex items-center gap-2 font-black text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bill Successfully Settled &amp; Split!</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Table {table.name} has been cleared and marked vacant. {completedSplits.length} individual guest receipts generated.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {completedSplits.map((split: any, idx: number) => (
                <div
                  key={split.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {split.customer_name || `Guest #${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {split.receipt_number} &bull; Paid
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600">
                      ${Number(split.grand_total || 0).toFixed(2)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {split.currency || 'USD'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Split Receipts</span>
              </button>
              <button
                type="button"
                onClick={handleFinishAndClose}
                className="flex-1 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 transition-all cursor-pointer"
              >
                Done &amp; Return to Floor Plan
              </button>
            </div>
          </div>
        ) : (
          /* Split Configuration Form */
          <div className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Split Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  splitType === 'equal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Equal Split (N-Way)
              </button>
              <button
                type="button"
                onClick={() => setSplitType('itemized')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  splitType === 'itemized'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Itemized / By Seat
              </button>
            </div>

            {/* Number of Parties */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-800 block">Number of Guests / Splits</label>
                  <p className="text-[11px] text-slate-500">How many ways should the bill be divided?</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleEqualCountChange(-1)}
                    disabled={equalCount <= 2}
                    className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-black text-sm text-slate-900">{equalCount}</span>
                  <button
                    type="button"
                    onClick={() => handleEqualCountChange(1)}
                    disabled={equalCount >= 10}
                    className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Guest Tender Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 block">Payment Method Per Guest</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {Array.from({ length: equalCount }, (_, idx) => {
                  const seat = idx + 1;
                  const currentTender = guestTenders[seat] || 'cash';
                  return (
                    <div
                      key={seat}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">Guest #{seat}</span>
                      </div>
                      <select
                        value={currentTender}
                        onChange={(e) => handleTenderSelect(seat, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
                      >
                        <option value="cash">Cash (USD/KHR)</option>
                        <option value="khqr">Bakong KHQR</option>
                        <option value="card">Card / Visa</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSplit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Split Bill...</span>
                  </>
                ) : (
                  <>
                    <Split className="w-4 h-4" />
                    <span>Confirm &amp; Settle {equalCount} Splits</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
