'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  X,
  Printer,
  Smartphone,
  ExternalLink,
  Loader2,
  Sparkles,
  Receipt,
  Globe,
} from 'lucide-react';
import { sendDigitalReceiptApi, getReceiptHtmlUrl } from '@/lib/api/sales';

interface PosDigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  outlet?: any;
  onPrintThermal?: () => void;
}

export function PosDigitalReceiptModal({
  isOpen,
  onClose,
  sale,
  outlet,
  onPrintThermal,
}: PosDigitalReceiptModalProps) {
  const [channel, setChannel] = useState<'email' | 'sms' | 'both'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<'en' | 'km'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [dispatchedData, setDispatchedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saleId = sale?.id || sale?.sale_id || sale?.uuid;
  const receiptNumber = sale?.receipt_number || 'N/A';
  const grandTotal = Number(sale?.grand_total || sale?.total_amount || 0);
  const grandTotalKhr = Math.round(grandTotal * 4100);

  useEffect(() => {
    if (isOpen && sale) {
      setEmail(sale.customer_email || sale.customer?.email || '');
      setPhone(sale.customer_phone || sale.customer?.phone || '');
      setSendSuccess(false);
      setErrorMsg(null);
      setDispatchedData(null);
    }
  }, [isOpen, sale]);

  if (!isOpen || !sale) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (channel === 'email' && !cleanEmail) {
      setErrorMsg('Please enter a valid customer email address.');
      return;
    }

    if (channel === 'sms' && !cleanPhone) {
      setErrorMsg('Please enter a customer mobile phone number.');
      return;
    }

    if (channel === 'both' && !cleanEmail && !cleanPhone) {
      setErrorMsg('Please provide at least an email or phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res: any = await sendDigitalReceiptApi(saleId, {
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        channel,
        language,
      });

      if (res && (res.status === 'success' || res.data)) {
        setSendSuccess(true);
        setDispatchedData(res.data || res);
      } else {
        throw new Error(res.message || 'Failed to dispatch digital receipt.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send receipt. Please verify contact information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const publicReceiptUrl = saleId ? getReceiptHtmlUrl(saleId) : '#';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col"
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Send Digital E-Receipt</h3>
              <p className="text-[11px] text-slate-400">Slip #{receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Sale Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">${grandTotal.toFixed(2)}</span>
              <span className="text-xs font-semibold text-slate-500">({grandTotalKhr.toLocaleString()} KHR)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid in Full
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {sendSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Digital Receipt Dispatched!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Customer receipt has been queued and sent to{' '}
                  <span className="font-semibold text-slate-800">
                    {dispatchedData?.recipient?.email || dispatchedData?.recipient?.phone || email || phone}
                  </span>
                  .
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={publicReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Public Verified Receipt
                </a>
                {onPrintThermal && (
                  <button
                    type="button"
                    onClick={() => {
                      onPrintThermal();
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Also Print Thermal Paper (80mm)
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {/* Channel Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Channel</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'email'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'sms'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('both')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'both'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Both
                  </button>
                </div>
              </div>

              {/* Email Input */}
              {(channel === 'email' || channel === 'both') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Phone Input */}
              {(channel === 'sms' || channel === 'both') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (Cambodia / Int'l)</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Receipt Language Switch */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Language
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      language === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('km')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      language === 'km' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ភាសាខ្មែរ
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send E-Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default PosDigitalReceiptModal;
