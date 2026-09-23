'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react';
import { getSalesReportApi, getOutletsApi, getAuthUser } from '@/lib/api';
import {
  PosReportsKpiGrid,
  PosReportsTenderSettlement,
  PosReportsHourlyVelocity,
  PosReportsCashierVelocityTable,
  PosReportsCategoryPerformance,
  PosReportsFilterBar,
} from '@/components/pos/reports';
import { FifoValuationCard } from './FifoValuationCard';
import { PosThermalReportModal } from '@/components/pos/shifts/PosThermalReportModal';

export function InventoryReportsView() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'yesterday' | '7d' | '30d' | 'custom'>('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [outlets, setOutlets] = useState<any[]>([]);

  const [showThermalModal, setShowThermalModal] = useState(false);
  const [thermalReportType, setThermalReportType] = useState<'X-REPORT' | 'Z-REPORT'>('Z-REPORT');

  const [metrics, setMetrics] = useState({
    grossSales: 0, netSales: 0, totalOrders: 0, avgTicket: 0,
    discountsGiven: 0, refundsTotal: 0, cashUsd: 0, khqrSales: 0, cardSales: 0,
  });
  const [hourlySales, setHourlySales] = useState<any[]>([]);
  const [cashierPerformance, setCashierPerformance] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      try {
        const outletsRes = await getOutletsApi();
        setOutlets(Array.isArray(outletsRes) ? outletsRes : outletsRes?.data || []);
      } catch {}

      try {
        const salesRes = await getSalesReportApi(startDate, endDate);
        if (salesRes?.data) {
          const d = salesRes.data.summary || salesRes.data;
          setMetrics({
            grossSales: parseFloat(d.total_sales || '0'),
            netSales: parseFloat(d.net_sales || '0'),
            totalOrders: parseInt(d.total_transactions || '0', 10),
            avgTicket: parseFloat(d.average_ticket || '0'),
            discountsGiven: parseFloat(d.discount_total || d.discounts_given || '0'),
            refundsTotal: parseFloat(d.refunds_total || '0'),
            cashUsd: parseFloat(d.cash_sales || '0'),
            khqrSales: parseFloat(d.khqr_sales || '0'),
            cardSales: parseFloat(d.card_sales || '0'),
          });
          setHourlySales(salesRes.data.hourly_sales || []);
          setCashierPerformance(salesRes.data.cashier_performance || []);
          setTopCategories(salesRes.data.category_performance || []);
        } else {
          setMetrics({ grossSales: 0, netSales: 0, totalOrders: 0, avgTicket: 0, discountsGiven: 0, refundsTotal: 0, cashUsd: 0, khqrSales: 0, cardSales: 0 });
          setHourlySales([]);
          setCashierPerformance([]);
          setTopCategories([]);
        }
      } catch (err) {
        console.warn('Could not load sales report:', err);
      }
    } catch (err) {
      console.error('Failed to load POS reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getAuthUser());
    fetchReportData();
  }, [startDate, endDate, selectedOutlet]);

  const handlePeriodChange = (newPeriod: 'today' | 'yesterday' | '7d' | '30d' | 'custom') => {
    setPeriod(newPeriod);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (newPeriod === 'today') { setStartDate(todayStr); setEndDate(todayStr); }
    else if (newPeriod === 'yesterday') {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr); setEndDate(yStr);
    } else if (newPeriod === '7d') {
      const d7 = new Date(now); d7.setDate(now.getDate() - 7);
      setStartDate(d7.toISOString().split('T')[0]); setEndDate(todayStr);
    } else if (newPeriod === '30d') {
      const d30 = new Date(now); d30.setDate(now.getDate() - 30);
      setStartDate(d30.toISOString().split('T')[0]); setEndDate(todayStr);
    }
  };

  const handleExportCsv = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Gross Sales', metrics.grossSales.toFixed(2)],
      ['Net Sales', metrics.netSales.toFixed(2)],
      ['Completed Orders', metrics.totalOrders],
      ['Average Basket', metrics.avgTicket.toFixed(2)],
      ['Discounts Total', metrics.discountsGiven.toFixed(2)],
      ['Refunds Total', metrics.refundsTotal.toFixed(2)],
      ['Cash Sales', metrics.cashUsd.toFixed(2)],
      ['ABA KHQR Sales', metrics.khqrSales.toFixed(2)],
      ['Card Sales', metrics.cardSales.toFixed(2)],
    ].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventory-POS-Report-${startDate}-to-${endDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-3 w-full font-sans text-slate-900 pb-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">POS Analytics &amp; Reports</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time terminal transaction analytics, FIFO valuation, and tender settlement records</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchReportData}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => { setThermalReportType('Z-REPORT'); setShowThermalModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Z-Report</span>
          </button>
        </div>
      </div>

      {/* 2. Date & Outlet Filter Bar */}
      <PosReportsFilterBar
        period={period} onPeriodChange={handlePeriodChange}
        startDate={startDate} onStartDateChange={setStartDate}
        endDate={endDate} onEndDateChange={setEndDate}
        selectedOutlet={selectedOutlet} onOutletChange={setSelectedOutlet}
        outlets={outlets}
      />

      {/* 3. Key Metric Cards */}
      <PosReportsKpiGrid metrics={metrics} />

      {/* 4. FIFO Valuation */}
      <FifoValuationCard />

      {/* 5. Tender Settlement Breakdown & Hourly Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PosReportsTenderSettlement cashUsd={metrics.cashUsd} khqrSales={metrics.khqrSales} cardSales={metrics.cardSales} />
        <PosReportsHourlyVelocity hourlySales={hourlySales} />
      </div>

      {/* 6. Cashier Velocity & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PosReportsCashierVelocityTable cashiers={cashierPerformance} />
        <PosReportsCategoryPerformance categories={topCategories} />
      </div>

      {/* Thermal X/Z-Report Modal */}
      <PosThermalReportModal
        isOpen={showThermalModal}
        onClose={() => setShowThermalModal(false)}
        reportType={thermalReportType}
        user={user}
        shift={{
          id: 1, shift_number: 'SH-LIVE', opened_at: new Date().toISOString(),
          cashier_name: user?.name || 'Administrator', opening_float: 100.0,
          expected_cash: metrics.cashUsd + 100.0, total_sales: metrics.grossSales,
          cash_sales: metrics.cashUsd, khqr_sales: metrics.khqrSales,
          card_sales: metrics.cardSales, discounts: metrics.discountsGiven,
          refunds: metrics.refundsTotal, transactions_count: metrics.totalOrders,
        }}
      />
    </div>
  );
}
