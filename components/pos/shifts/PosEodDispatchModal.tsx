/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: End-of-Day (EOD) Z-Report & Nightly Dispatch (BD-0132)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  X,
  Loader2,
  DollarSign,
  Building2,
  Receipt,
} from 'lucide-react';
import { getZReportApi, dispatchEodZReportApi } from '@/lib/api';

interface PosEodDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSuccess?: () => void;
  onPrintThermal?: (zReportData: any) => void;
}

export function PosEodDispatchModal({
  isOpen,
  onClose,
  user,
  onSuccess,
  onPrintThermal,
}: PosEodDispatchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [recipientEmail, setRecipientEmail] = useState(user?.email || '');
  const [closeOpenRegisters, setCloseOpenRegisters] = useState(true);

  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [zReport, setZReport] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPreview(targetDate);
    }
  }, [isOpen, targetDate]);

  const loadPreview = async (date: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await getZReportApi({
        date,
        outlet_id: user?.outlet_id,
        close_open_registers: false,
      });
      if (res?.status === 'success' && res.data) {
        setZReport(res.data);
      } else {
        setZReport(null);
        setErrorMsg(res?.message || 'Failed to load Z-Report preview for selected date.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error generating daily Z-Report reconciliation.');
      setZReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchEod = async () => {
    try {
      setDispatching(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await dispatchEodZReportApi({
        date: targetDate,
        outlet_id: user?.outlet_id,
        recipient_email: recipientEmail.trim() || undefined,
      });

      if (res?.status === 'success') {
        setSuccessMsg(res.message || 'End-of-Day Z-Report dispatched and registers finalized successfully!');
        if (res.data) {
          setZReport(res.data);
        }
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMsg(res?.message || 'Failed to dispatch End-of-Day report.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error executing End-of-Day dispatch.');
    } finally {
      setDispatching(false);
    }
  };

  if (!isOpen || !mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                End-of-Day (EOD) Z-Report &amp; Nightly Dispatch
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Final financial audit, automated register closure, and email dispatch to store management
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

        {/* Scrollable Content Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Accounting Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Target Outlet
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{user?.outlet_name || 'Main Branch Store'}</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {user?.outlet_id || 'Primary'}</span>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <span className="text-xs font-bold">Compiling Financial Reconciliation &amp; Balances...</span>
            </div>
          )}

          {/* Report Data Preview */}
          {!loading && zReport && (
            <div className="space-y-4">
              {/* Financial Snapshot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Sales</span>
                  <span className="text-sm font-black text-slate-900">
                    ${Number(zReport.gross_sales || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {zReport.total_orders || 0} orders
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Net Sales</span>
                  <span className="text-sm font-black text-emerald-700">
                    ${Number(zReport.net_sales || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">After tax &amp; discounts</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tax Collected</span>
                  <span className="text-sm font-black text-slate-800">
                    ${Number(zReport.tax_total || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Disc: -${Number(zReport.discount_total || 0).toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Refunds</span>
                  <span className="text-sm font-black text-rose-700">
                    ${Number(zReport.refund_total || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">
                    {zReport.refund_count || 0} returned
                  </span>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  Tender Breakdown (Payment Methods)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Cash</span>
                    <span className="font-black text-slate-900">
                      ${Number(zReport.payment_breakdown?.cash || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">KHQR (Bakong)</span>
                    <span className="font-black text-indigo-600">
                      ${Number(zReport.payment_breakdown?.khqr || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Card Terminal</span>
                    <span className="font-black text-slate-900">
                      ${Number(zReport.payment_breakdown?.card || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Store Credit / Other</span>
                    <span className="font-black text-slate-900">
                      ${Number(zReport.payment_breakdown?.other || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Drawer Auditing Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    Cash Drawer Audit ({zReport.cash_drawer?.total_shifts || 0} Shifts Logged)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    ID: {zReport.z_report_code}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Opening Floats</span>
                    <span className="font-black text-slate-900">
                      ${Number(zReport.cash_drawer?.opening_float || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Expected in Drawers</span>
                    <span className="font-black text-slate-900">
                      ${Number(zReport.cash_drawer?.expected_cash || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Physical Counted</span>
                    <span className="font-black text-slate-900">
                      ${Number(zReport.cash_drawer?.counted_cash || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">Net Variance</span>
                    <span
                      className={`font-black ${
                        Number(zReport.cash_drawer?.cash_variance || 0) < 0
                          ? 'text-rose-600'
                          : Number(zReport.cash_drawer?.cash_variance || 0) > 0
                          ? 'text-emerald-600'
                          : 'text-slate-900'
                      }`}
                    >
                      ${Number(zReport.cash_drawer?.cash_variance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nightly Dispatch Settings */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black text-indigo-950">
                    Nightly Email Spooler &amp; Executive Summary
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                    Recipient Email Address (Store Owner / Finance)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="owner@codebridges.io"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={closeOpenRegisters}
                    onChange={(e) => setCloseOpenRegisters(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Automatically close all open shifts/registers for this outlet upon EOD dispatch</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {zReport && onPrintThermal && (
              <button
                type="button"
                onClick={() => onPrintThermal(zReport)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Thermal Z-Report</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatchEod}
              disabled={dispatching || !zReport}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {dispatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing &amp; Spooling...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Finalize EOD &amp; Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

