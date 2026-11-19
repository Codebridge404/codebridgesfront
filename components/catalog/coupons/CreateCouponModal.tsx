/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { Portal } from '@/components/ui/Portal';

interface CreateCouponModalProps {
  showModal: boolean;
  onClose: () => void;
  newCode: string;
  setNewCode: (code: string) => void;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  discountValue: string;
  setDiscountValue: (val: string) => void;
  minSpend: string;
  setMinSpend: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateCouponModal({
  showModal,
  onClose,
  newCode,
  setNewCode,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  minSpend,
  setMinSpend,
  onSubmit,
}: CreateCouponModalProps) {
  if (!showModal) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Create Promotional Coupon</h3>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Coupon Code (Uppercase) *</label>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER20"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Minimum Spend ($)</label>
            <input
              type="number"
              step="0.01"
              value={minSpend}
              onChange={(e) => setMinSpend(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </div>
    </div></Portal>
  );
}
