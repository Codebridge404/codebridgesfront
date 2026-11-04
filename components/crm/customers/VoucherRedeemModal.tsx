/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Promotional Voucher Code Validation & Redemption (BD-0137)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Gift,
  Ticket,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Wallet,
  QrCode,
  Tag,
} from 'lucide-react';
import { redeemDigitalVoucherApi } from '@/lib/api/tenants';
import { useToast } from '@/components/common';

interface VoucherRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: number | string;
  customerName?: string;
  customers?: any[];
  onRedeemSuccess?: (result: any) => void;
}

export function VoucherRedeemModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  customers = [],
  onRedeemSuccess,
}: VoucherRedeemModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>(customerId || '');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVoucherCode('');
      setRedeemResult(null);
      if (customerId) setSelectedCustomerId(customerId);
      else if (customers.length > 0) setSelectedCustomerId(customers[0].id);
    }
  }, [isOpen, customerId, customers]);

  if (!isOpen || !mounted) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a voucher code.');
      return;
    }

    if (!selectedCustomerId) {
      toast.error('Please select a customer account to credit.');
      return;
    }

    try {
      setRedeeming(true);
      const res = await redeemDigitalVoucherApi({
        voucher_code: cleanCode,
        customer_id: selectedCustomerId,
      });

      if (res?.data || res?.status === 'success') {
        setRedeemResult(res.data);
        toast.success(res.message || `Voucher ${cleanCode} redeemed and credited to wallet!`);
        if (onRedeemSuccess) onRedeemSuccess(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to redeem digital voucher.');
    } finally {
      setRedeeming(false);
    }
  };

  const content = (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Redeem Gift Voucher
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Validate promotional code &amp; credit to store wallet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {redeemResult ? (
            /* Success View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-emerald-950">Voucher Successfully Redeemed!</h4>
                <p className="text-xs text-emerald-800">
                  Voucher code <strong className="font-mono">{redeemResult.voucher_code || voucherCode}</strong> credited to wallet balance.
                </p>
                <div className="py-2 px-3 bg-white/80 rounded-xl border border-emerald-200 inline-block text-emerald-900 font-mono font-black text-sm">
                  +${parseFloat(redeemResult.value || redeemResult.amount || '0').toFixed(2)} Credited
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Redeem Input Form */
            <form onSubmit={handleRedeem} className="space-y-4">
              {/* Customer Selector (if not passed fixed) */}
              {!customerId && customers.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Customer Account
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || `#${c.id}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {customerId && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Beneficiary Account:</span>
                  <strong className="text-slate-900">{customerName || `Customer #${customerId}`}</strong>
                </div>
              )}

              {/* Voucher Code Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Promotional Voucher / Gift Code
                </label>
                <div className="relative">
                  <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GIFT-2026-XP90 or VIP50"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-black text-slate-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Enter the 8-16 alphanumeric characters printed on customer card or SMS code.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={redeeming || !voucherCode.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {redeeming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Gift className="w-4 h-4" />
                  )}
                  <span>Redeem Voucher</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

