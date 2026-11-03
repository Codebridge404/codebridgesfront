'use client';

import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { getShiftXReportApi, getCartTaxSettings } from '@/lib/api';
import { Modal, Button, Badge } from '@/components/ui';

interface PosThermalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'X-REPORT' | 'Z-REPORT';
  shift: any;
  user?: any;
}

export function PosThermalReportModal({
  isOpen,
  onClose,
  reportType,
  shift,
  user,
}: PosThermalReportModalProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !shift?.id) return;
    let isMounted = true;
    setLoading(true);

    getShiftXReportApi(String(shift.id))
      .then((res) => {
        if (isMounted && res?.data) {
          setReportData(res.data);
        }
      })
      .catch((err) => console.warn('[Thermal Report] Live query fallback:', err?.message))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, shift?.id]);

  if (!isOpen || !shift) return null;

  const isZReport = reportType === 'Z-REPORT' || shift.status === 'closed';
  const reportTitle = isZReport ? 'END-OF-DAY FISCAL Z-REPORT' : 'MID-SHIFT AUDIT X-REPORT';
  const reportCode =
    reportData?.report_code ||
    (isZReport
      ? `Z-${String(shift.id || 1).slice(0, 8)}`
      : `X-${String(shift.id || 1).slice(0, 8)}`);

  const openingFloat = Number(reportData?.opening_float ?? shift.opening_float ?? 0);
  const cashSales = Number(reportData?.cash_sales ?? shift.cash_sales ?? 0);
  const khqrSales = Number(reportData?.khqr_sales ?? shift.khqr_sales ?? 0);
  const cardSales = Number(reportData?.card_sales ?? shift.card_sales ?? 0);
  const payIns = Number(reportData?.pay_ins ?? shift.cash_in ?? 0);
  const payOuts = Number(reportData?.pay_outs ?? shift.cash_out ?? 0);
  const safeDrops = Number(reportData?.safe_drops ?? shift.safe_drops ?? 0);

  const grossSales = Number(reportData?.gross_sales ?? (cashSales + khqrSales + cardSales));
  const taxSettings = getCartTaxSettings();
  const taxRate = taxSettings.taxEnabled ? Number(taxSettings.taxRate || 0) : 0;
  const taxLabel = taxSettings.taxLabel || 'Tax';
  const taxCollected = taxSettings.taxEnabled
    ? (taxSettings.taxCalculationMode === 'inclusive'
        ? (grossSales - (grossSales / (1 + (taxRate / 100))))
        : (grossSales * (taxRate / 100)))
    : 0;
  const netSales = grossSales - taxCollected;
  const expectedCash = Number(
    reportData?.expected_cash ?? (openingFloat + cashSales + payIns - payOuts - safeDrops)
  );
  const countedCash = Number(reportData?.counted_cash ?? shift.counted_cash ?? expectedCash);
  const variance = Number(
    reportData?.cash_variance ?? shift.cash_variance ?? (countedCash - expectedCash)
  );

  const cashierName =
    reportData?.cashier_name || shift.cashier_name || user?.name || 'Register Cashier';
  const outletName =
    reportData?.outlet_name ||
    shift.outlet_name ||
    user?.outlet?.name ||
    user?.active_outlet?.name ||
    'CodeBridges POS Main';
  const registerLabel = shift.register_id ? `Register #${shift.register_id}` : 'Terminal #01';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reportTitle}
      subtitle={`Sequence #${reportCode}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Badge variant={isZReport ? 'danger' : 'brand'} size="sm">
              {isZReport ? 'Fiscal Z-Report' : 'Audit X-Report'}
            </Badge>
            {loading && (
              <Badge variant="warning" size="sm" pulse>
                Live Sync
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="brand"
              size="sm"
              iconLeft={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print Slip
            </Button>
          </div>
        </div>
      }
    >
      <div className="bg-slate-100 p-4 rounded-2xl">
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm font-mono text-[11px] text-slate-800 space-y-3.5 max-w-[340px] mx-auto select-all">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <p className="font-black text-sm text-slate-900 tracking-wider">CODEBRIDGES POS</p>
            <p className="text-[10px] text-slate-600 font-bold">{outletName}</p>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">
              *** {reportTitle} ***
            </p>
          </div>

          <div className="space-y-1 text-[10px] text-slate-600 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span>Report ID:</span>
              <strong className="text-slate-900">{reportCode}</strong>
            </div>
            <div className="flex justify-between">
              <span>Register:</span>
              <strong className="text-slate-900">{registerLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <strong className="text-slate-900">{cashierName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Opened At:</span>
              <span>{shift.opened_at ? new Date(shift.opened_at).toLocaleString() : 'Session Active'}</span>
            </div>
            {shift.closed_at && (
              <div className="flex justify-between text-slate-700">
                <span>Closed At:</span>
                <span>{new Date(shift.closed_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
            <p className="font-black text-[10px] text-slate-900 uppercase">Tender Summary</p>
            <div className="flex justify-between">
              <span>Cash Sales (USD):</span>
              <strong className="text-slate-900">${cashSales.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Bakong KHQR (៛):</span>
              <strong className="text-slate-900">${khqrSales.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Credit/Debit Card:</span>
              <strong className="text-slate-900">${cardSales.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>GROSS SALES:</span>
              <span className="text-brand">${grossSales.toFixed(2)}</span>
            </div>
            {taxSettings.taxEnabled ? (
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{taxLabel} ({taxRate}%):</span>
                <span>${taxCollected.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Tax Status:</span>
                <span className="italic text-slate-400">Exempt ($0.00)</span>
              </div>
            )}
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>NET REVENUE:</span>
              <span>${netSales.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
            <p className="font-black text-[10px] text-slate-900 uppercase">Drawer Cash Movement</p>
            <div className="flex justify-between">
              <span>+ Opening Float:</span>
              <span>${openingFloat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Cash Tendered:</span>
              <span>${cashSales.toFixed(2)}</span>
            </div>
            {payIns > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>+ Cash Pay-Ins:</span>
                <span>+${payIns.toFixed(2)}</span>
              </div>
            )}
            {payOuts > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>- Cash Pay-Outs:</span>
                <span>-${payOuts.toFixed(2)}</span>
              </div>
            )}
            {safeDrops > 0 && (
              <div className="flex justify-between text-indigo-600 font-bold">
                <span>- Safe Drops:</span>
                <span>-${safeDrops.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>EXPECTED DRAWER:</span>
              <span>${expectedCash.toFixed(2)}</span>
            </div>
            {isZReport && (
              <>
                <div className="flex justify-between font-black text-slate-900">
                  <span>COUNTED PHYSICAL CASH:</span>
                  <span>${countedCash.toFixed(2)}</span>
                </div>
                <div
                  className={`flex justify-between font-black ${
                    variance === 0
                      ? 'text-emerald-600'
                      : variance > 0
                      ? 'text-blue-600'
                      : 'text-rose-600'
                  }`}
                >
                  <span>CASH VARIANCE:</span>
                  <span>
                    {variance > 0
                      ? `+$${variance.toFixed(2)}`
                      : variance < 0
                      ? `-$${Math.abs(variance).toFixed(2)}`
                      : '$0.00 (Balanced)'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-0.5">
            <p className="font-bold text-slate-700">KHR Equivalent (4,100 ៛/$)</p>
            <p className="font-black text-amber-700 text-xs">
              {(expectedCash * 4100).toLocaleString()} ៛
            </p>
          </div>

          <div className="text-center text-[9px] text-slate-400 pt-1 space-y-0.5">
            <p>*** {isZReport ? 'END OF FISCAL Z-SESSION' : 'AUDIT X-READING ONLY'} ***</p>
            <p>CodeBridges Multi-Tenant Cloud Architecture</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
