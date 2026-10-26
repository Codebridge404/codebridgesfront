'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Search,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { getReturnQuoteApi, processRefundApi } from '@/lib/api';
import { ReturnLineItemsTable } from './ReturnLineItemsTable';

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onReturnProcessed?: () => void;
}

export function SalesReturnModal({
  isOpen,
  onClose,
  onSuccess,
  onReturnProcessed,
}: SalesReturnModalProps) {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);

  const [returnItems, setReturnItems] = useState<{
    [saleLineId: string]: {
      quantity: number;
      restock_decision: 'restock' | 'wastage' | 'non_returnable';
      reason: string;
    };
  }>({});

  const [overallReason, setOverallReason] = useState('customer_change_of_mind');
  const [supervisorPin, setSupervisorPin] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleLookupSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNumber.trim()) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessResult(null);
      const res = await getReturnQuoteApi(receiptNumber.trim());
      setQuoteData(res.data);

      const initialItems: any = {};
      (res.data?.lines || []).forEach((line: any) => {
        initialItems[line.sale_line_id] = {
          quantity: 0,
          restock_decision: 'restock',
          reason: 'Customer return',
        };
      });
      setReturnItems(initialItems);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sale record not found or ineligible for return.');
      setQuoteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (lineId: string, maxQty: number, val: number) => {
    const validQty = Math.max(0, Math.min(maxQty, val));
    setReturnItems((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], quantity: validQty },
    }));
  };

  const handleDecisionChange = (lineId: string, decision: 'restock' | 'wastage' | 'non_returnable') => {
    setReturnItems((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], restock_decision: decision },
    }));
  };

  const calculatedRefundTotal = quoteData?.lines
    ? quoteData.lines.reduce((acc: number, line: any) => {
        const item = returnItems[line.sale_line_id];
        const qty = item ? item.quantity : 0;
        return acc + qty * line.unit_price;
      }, 0)
    : 0;

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteData?.sale?.id) return;

    const itemsToRefund = Object.keys(returnItems)
      .filter((lineId) => returnItems[lineId].quantity > 0)
      .map((lineId) => ({
        sale_line_id: lineId,
        quantity: returnItems[lineId].quantity,
        restock_decision: returnItems[lineId].restock_decision,
        reason: returnItems[lineId].reason || overallReason,
      }));

    if (itemsToRefund.length === 0) {
      setErrorMessage('Please select at least one item and quantity to return.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage(null);
      const payload = {
        supervisor_pin: supervisorPin || undefined,
        reason: overallReason,
        items: itemsToRefund,
      };

      const res = await processRefundApi(quoteData.sale.id, payload);
      setSuccessResult(res.data);
      if (onSuccess) onSuccess();
      if (onReturnProcessed) onReturnProcessed();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process refund transaction.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand" />
            <div>
              <h3 className="font-bold text-sm">Sales Return &amp; Customer Refund</h3>
              <p className="text-[10px] text-slate-400">Lookup original receipt and restock returned items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successResult ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950">Refund Processed Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Inventory balances updated &amp; append-only movement ledger recorded.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-100 font-mono text-xs max-w-sm mx-auto text-left space-y-1.5 shadow-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund ID:</span>
                  <span className="font-bold text-slate-900">{successResult.refund_id?.substring(0, 13)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund Total:</span>
                  <span className="font-extrabold text-brand">${Number(successResult.refund_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Sale Status:</span>
                  <span className="uppercase font-bold text-emerald-700">{successResult.new_sale_status}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Done &amp; Close Modal
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Receipt Lookup Form */}
              <form onSubmit={handleLookupSale} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Receipt No (e.g. REC-MAIN-20260811-00001 or Sale ID)..."
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-sm shadow-brand/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? 'Searching...' : 'Lookup Sale'}
                </button>
              </form>

              {quoteData && (
                <form onSubmit={handleProcessRefund} className="space-y-4">
                  {/* Sale Header Summary */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-slate-900">Receipt: {quoteData.sale.receipt_number}</p>
                      <p className="text-[11px] text-slate-500">
                        Date: {new Date(quoteData.sale.created_at).toLocaleString()} • Original Total: ${Number(quoteData.sale.grand_total).toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        quoteData.is_fully_refunded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {quoteData.sale.status}
                    </span>
                  </div>

                  {/* 7-Day Policy Notice Banner */}
                  {quoteData.policy_notice && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        quoteData.requires_supervisor_approval
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <ShieldCheck
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          quoteData.requires_supervisor_approval ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      />
                      <div className="flex-1">
                        <span className="font-extrabold block">
                          {quoteData.requires_supervisor_approval
                            ? 'Policy Exception: Supervisor Authorization Required'
                            : 'Return Policy Active'}
                        </span>
                        <span className="text-[11px] leading-relaxed">{quoteData.policy_notice}</span>
                      </div>
                    </div>
                  )}

                  <ReturnLineItemsTable
                    lines={quoteData.lines}
                    returnItems={returnItems}
                    onQuantityChange={handleQuantityChange}
                    onDecisionChange={handleDecisionChange}
                  />

                  {/* Return Reason & Authorization Section */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold text-xs">
                        Overall Refund Reason *
                      </label>
                      <select
                        value={overallReason}
                        onChange={(e) => setOverallReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                      >
                        <option value="customer_change_of_mind">Customer Change of Mind</option>
                        <option value="defective_item">Defective / Damaged Item</option>
                        <option value="wrong_item">Wrong Item Issued</option>
                        <option value="expired_product">Expired Product</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand" /> Supervisor PIN
                        </span>
                        {quoteData.requires_supervisor_approval && (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md uppercase">
                            Mandatory (&gt;7 Days)
                          </span>
                        )}
                      </label>
                      <input
                        type="password"
                        required={Boolean(quoteData.requires_supervisor_approval)}
                        placeholder={quoteData.requires_supervisor_approval ? 'Supervisor PIN required (>7d)...' : 'Enter Supervisor PIN...'}
                        value={supervisorPin}
                        onChange={(e) => setSupervisorPin(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                          quoteData.requires_supervisor_approval
                            ? 'border-amber-400 focus:ring-amber-400/40 focus:border-amber-500'
                            : 'border-slate-200 focus:ring-brand/30 focus:border-brand'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Refund Total Summary Bar */}
                  <div className="p-4 bg-brand-subtle border border-brand/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-brand font-bold">Estimated Refund Credit</p>
                      <p className="text-xl font-black text-brand font-mono">
                        ${calculatedRefundTotal.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={processing || calculatedRefundTotal <= 0}
                      className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      {processing ? 'Processing Refund...' : 'Confirm & Process Refund'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default SalesReturnModal;
