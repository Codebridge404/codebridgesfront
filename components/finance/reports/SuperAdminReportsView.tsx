'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Receipt,
  Clock,
} from 'lucide-react';
import { getSalesReportApi, getShiftReportApi, getTaxReportApi, getApiUrl } from '@/lib/api';
import { SalesReportTab } from './SalesReportTab';
import { ShiftReportTab } from './ShiftReportTab';
import { TaxReportTab } from './TaxReportTab';

export function SuperAdminReportsView() {
  const [activeTab, setActiveTab] = useState<'sales' | 'shifts' | 'tax'>('sales');
  const [loading, setLoading] = useState(true);

  const [salesData, setSalesData] = useState<any>(null);
  const [shiftData, setShiftData] = useState<any>(null);
  const [taxData, setTaxData] = useState<any>(null);

  useEffect(() => {
    loadActiveReport();
  }, [activeTab]);

  const loadActiveReport = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sales') {
        const res = await getSalesReportApi();
        setSalesData(res.data);
      } else if (activeTab === 'shifts') {
        const res = await getShiftReportApi();
        setShiftData(res.data);
      } else if (activeTab === 'tax') {
        const res = await getTaxReportApi();
        setTaxData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const baseUrl = getApiUrl().replace(/\/+$/, '');
    const exportUrl = `${baseUrl}/reports/export?type=${activeTab}`;

    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = `report_${activeTab}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand" />
            SaaS Revenue Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise revenue analysis, profit margins, cashier shift balances &amp; tax settlement reports
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-brand" />
          Export {activeTab.toUpperCase()} Report (CSV)
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Sales &amp; Profit Margin
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'shifts'
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" /> Cashier Shift Summaries
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'tax'
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" /> Tax &amp; VAT Settlement
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand" />
          <p className="text-xs font-semibold">Generating analytics &amp; financial metrics...</p>
        </div>
      ) : (
        <>
          {activeTab === 'sales' && <SalesReportTab salesData={salesData} />}
          {activeTab === 'shifts' && <ShiftReportTab shiftData={shiftData} />}
          {activeTab === 'tax' && <TaxReportTab taxData={taxData} />}
        </>
      )}
    </div>
  );
}
