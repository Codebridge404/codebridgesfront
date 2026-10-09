'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Landmark, Calculator, Loader2 } from 'lucide-react';
import { getTaxReportApi, downloadReportCsvApi } from '@/lib/api';

interface PosReportsTaxCardProps {
  startDate: string;
  endDate: string;
}

export function PosReportsTaxCard({ startDate, endDate }: PosReportsTaxCardProps) {
  const [taxData, setTaxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadTaxData();
  }, [startDate, endDate]);

  const loadTaxData = async () => {
    try {
      setLoading(true);
      const res = await getTaxReportApi(startDate, endDate);
      setTaxData(res?.data || null);
    } catch (err) {
      console.warn('Could not load tax data:', err);
      setTaxData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTaxCsv = async () => {
    try {
      setDownloading(true);
      await downloadReportCsvApi('tax');
    } catch (err: any) {
      alert(err.message || 'Failed to download tax CSV');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
        <span>Calculating VAT &amp; Tax Liabilities...</span>
      </div>
    );
  }

  const taxableUsd = Number(taxData?.taxable_sales_usd || 0);
  const vatUsd = Number(taxData?.vat_collected_usd || 0);
  const grandUsd = Number(taxData?.grand_total_usd || 0);
  const grandKhr = Number(taxData?.grand_total_khr || 0);
  const vatKhr = Number(taxData?.vat_collected_khr || 0);
  const exchangeRate = taxData?.exchange_rate || '1 USD = 4,100 KHR';

  return (
    <div className="space-y-4 font-sans text-slate-900">
      {/* Top Banner Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-bold shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">VAT &amp; Tax Settlement Report</h2>
            <p className="text-xs text-slate-500 font-medium">
              Applicable Period: {startDate} to {endDate} &bull; {exchangeRate}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadTaxCsv}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Export Tax Ledger CSV</span>
        </button>
      </div>

      {/* Tax Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Taxable Sales</span>
          <div className="text-2xl font-black text-slate-900 font-mono">${taxableUsd.toFixed(2)}</div>
          <span className="text-[11px] text-slate-500 font-medium">Net base before 10% VAT deduction</span>
        </div>

        <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-amber-700">10% VAT Collected</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900 font-mono">10%</span>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">${vatUsd.toFixed(2)}</div>
          <span className="text-[11px] text-amber-700 font-medium">
            &asymp; {vatKhr.toLocaleString()} KHR
          </span>
        </div>

        <div className="bg-brand-subtle p-5 rounded-3xl border border-brand/20 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-brand">Gross Total (Tax Included)</span>
          <div className="text-2xl font-black text-brand font-mono">${grandUsd.toFixed(2)}</div>
          <span className="text-[11px] text-brand/80 font-medium font-mono">
            &asymp; {grandKhr.toLocaleString()} KHR
          </span>
        </div>
      </div>

      {/* Detailed Settlement Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Statutory Tax Breakdown
        </h3>
        <div className="space-y-2.5 text-xs font-semibold">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Standard Value-Added Tax (VAT Rate)</span>
            <span className="font-mono font-bold text-slate-900">10.00%</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Total Standard Rate Sales (USD)</span>
            <span className="font-mono font-bold text-slate-900">${taxableUsd.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Output VAT Collected Payable (USD)</span>
            <span className="font-mono font-black text-amber-700">${vatUsd.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Output VAT Collected Payable (KHR)</span>
            <span className="font-mono font-black text-amber-700">{vatKhr.toLocaleString()} ៛</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-sm font-black text-slate-900">
            <span>Total Gross Invoiced (USD)</span>
            <span className="font-mono text-brand">${grandUsd.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosReportsTaxCard;
