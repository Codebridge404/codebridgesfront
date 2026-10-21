'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, AlertCircle, Copy, Check, Zap } from 'lucide-react';
import {
  generateBakongKhqrApi,
  checkBakongPaymentStatusApi,
  confirmBakongPaymentHashApi,
  simulateBakongPaymentApi,
  getTenantProfileApi,
} from '@/lib/api';
import { BakongKhqrCard } from './BakongKhqrCard';

interface BakongKhqrModalProps {
  isOpen: boolean;
  amount: number;
  currency?: string;
  saleId?: string;
  billNumber?: string;
  salePayload?: any;
  merchantId?: string;
  merchantName?: string;
  onClose: () => void;
  onPaymentApproved?: (paymentDetails: any) => void;
  onSuccess?: (paymentDetails: any) => void;
}

export function BakongKhqrModal({
  isOpen,
  amount,
  currency = 'USD',
  saleId,
  billNumber,
  merchantId,
  merchantName,
  onClose,
  onPaymentApproved,
  onSuccess,
}: BakongKhqrModalProps) {
  const [loading, setLoading] = useState(true);
  const [khqrData, setKhqrData] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [inputHash, setInputHash] = useState('');
  const [isVerifyingHash, setIsVerifyingHash] = useState(false);
  const [hashFeedback, setHashFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const notifyApproved = (res: any) => {
    onPaymentApproved?.(res);
    onSuccess?.(res);
  };

  useEffect(() => {
    if (isOpen && amount > 0) initKhqrPayment();
  }, [isOpen, amount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (khqrData?.attempt_id && !polling) {
      interval = setInterval(() => checkStatus(khqrData.attempt_id, true), 3000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [khqrData?.attempt_id, polling]);

  const initKhqrPayment = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const isWindow = typeof window !== 'undefined';
      let customMerchantId = merchantId || (isWindow ? localStorage.getItem('cb_bakong_merchant_id') || undefined : undefined);
      let customMerchantName = merchantName || (isWindow ? localStorage.getItem('active_org') || undefined : undefined);
      let customBank = isWindow ? localStorage.getItem('cb_bakong_bank_name') || undefined : undefined;

      if (!customMerchantId && isWindow) {
        try {
          const profileRes = await getTenantProfileApi();
          if (profileRes?.success && profileRes.data) {
            if (profileRes.data.payment_settings) {
              const pay =
                typeof profileRes.data.payment_settings === 'string'
                  ? JSON.parse(profileRes.data.payment_settings)
                  : profileRes.data.payment_settings;

              if (pay.bakong_merchant_id) {
                customMerchantId = pay.bakong_merchant_id;
                localStorage.setItem('cb_bakong_merchant_id', pay.bakong_merchant_id);
              }
              if (pay.bakong_bank_name) {
                customBank = pay.bakong_bank_name;
                localStorage.setItem('cb_bakong_bank_name', pay.bakong_bank_name);
              }
              if (pay.bakong_secret) {
                localStorage.setItem('cb_bakong_secret', pay.bakong_secret);
              }
            }
            if (profileRes.data.name && !customMerchantName) {
              customMerchantName = profileRes.data.name;
            }
          }
        } catch {}
      }

      const res = await generateBakongKhqrApi({
        amount,
        currency,
        sale_id: saleId,
        bill_number: billNumber,
        merchant_id: customMerchantId,
        merchant_name: customMerchantName,
        bank_name: customBank,
      });
      setKhqrData(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate Bakong KHQR code.');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (attemptId: string, isAutoPoll: boolean = false) => {
    if (polling && isAutoPoll) return;
    try {
      if (!isAutoPoll) setPolling(true);
      const isWindow = typeof window !== 'undefined';
      const token = isWindow ? (localStorage.getItem('cb_bakong_secret') || undefined) : undefined;
      const res = await checkBakongPaymentStatusApi(attemptId, {
        hash: inputHash.trim() || undefined,
        token,
        amount,
        currency,
      });
      if (res.paid) notifyApproved(res);
    } catch (err) {
      if (!isAutoPoll) console.error('Bakong status check error:', err);
    } finally {
      if (!isAutoPoll) setPolling(false);
    }
  };

  const handleVerifyHash = async () => {
    if (!khqrData?.attempt_id || !inputHash.trim()) return;
    try {
      setIsVerifyingHash(true);
      setHashFeedback(null);
      const isWindow = typeof window !== 'undefined';
      const token = isWindow ? (localStorage.getItem('cb_bakong_secret') || undefined) : undefined;
      const res = await confirmBakongPaymentHashApi(khqrData.attempt_id, {
        hash: inputHash.trim(),
        token,
        amount,
        currency,
        force_confirm: true,
      });

      if (res.paid) {
        setHashFeedback({ type: 'success', message: 'Payment successfully approved!' });
        setTimeout(() => notifyApproved(res), 400);
      } else {
        setHashFeedback({
          type: 'error',
          message: res.bakong_verification?.response_message || 'Could not verify hash.',
        });
      }
    } catch (err: any) {
      setHashFeedback({ type: 'error', message: err.message || 'Verification failed' });
    } finally {
      setIsVerifyingHash(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!khqrData?.attempt_id) return;
    try {
      setIsSimulating(true);
      const res = await simulateBakongPaymentApi(khqrData.attempt_id);
      if (res.paid) notifyApproved(res);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyKhqr = () => {
    if (khqrData?.khqr_string) {
      navigator.clipboard.writeText(khqrData.khqr_string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col font-sans"
      >
        <div className="bg-[#E11933] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden">
              <img src="/BakongKHQR/Bakong.png" alt="Bakong KHQR" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight leading-tight">Bakong KHQR</h3>
              <p className="text-[10px] text-rose-100">National Bank of Cambodia Payment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-rose-100 hover:text-white hover:bg-rose-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-center">
          {loading ? (
            <div className="py-12 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#E11933]" />
              <p className="text-xs font-bold text-slate-600">Generating Authentic NBC KHQR Payload...</p>
            </div>
          ) : errorMessage ? (
            <div className="py-6 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-rose-600">{errorMessage}</p>
              <button onClick={initKhqrPayment} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700">
                Retry Request
              </button>
            </div>
          ) : (
            <>
              <BakongKhqrCard
                merchantName={khqrData?.merchant_name}
                amount={amount}
                currency={currency}
                khrEquivalent={khqrData?.khr_equivalent}
                khqrString={khqrData?.khqr_string}
              />

              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 py-1.5 rounded-xl border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Listening for NBC Bakong API Payment...</span>
              </div>

              {/* Receipt Transaction Hash Verification */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Receipt Transaction Hash
                  </label>
                  <span className="text-[9px] text-slate-400 font-mono">e.g. 6d4293a6</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputHash}
                    onChange={(e) => setInputHash(e.target.value)}
                    placeholder="Enter receipt hash (e.g. 6d4293a6)"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyHash}
                    disabled={isVerifyingHash || !inputHash.trim()}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    {isVerifyingHash ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Confirm</span>
                  </button>
                </div>
                {hashFeedback && (
                  <p className={`text-[10px] font-bold ${hashFeedback.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {hashFeedback.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyKhqr}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  {copied ? 'Copied' : 'Copy KHQR'}
                </button>
                <button
                  type="button"
                  onClick={() => checkStatus(khqrData.attempt_id)}
                  disabled={polling}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${polling ? 'animate-spin' : ''}`} />
                  Check Status
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {isSimulating ? 'Verifying with Bakong...' : 'Simulate Mobile App Pay (Sandbox)'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BakongKhqrModal;
