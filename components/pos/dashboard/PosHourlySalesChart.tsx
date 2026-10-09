'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock } from 'lucide-react';

export interface HourlyDataPoint {
  hour: string;
  sales: number;
  transactions: number;
}

interface PosHourlySalesChartProps {
  data?: HourlyDataPoint[];
  todayTotal: number;
}

export function PosHourlySalesChart({ data, todayTotal }: PosHourlySalesChartProps) {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  
  const baselineData: HourlyDataPoint[] = hours.map((h) => ({
    hour: h,
    sales: 0,
    transactions: 0,
  }));

  const chartData = data && data.length > 0 ? data : baselineData;
  const maxSales = Math.max(...chartData.map((d) => d.sales), 10);

  // Peak hour
  const peak = chartData.reduce(
    (prev, curr) => (curr.sales > prev.sales ? curr : prev),
    chartData[0] || { hour: '12:00', sales: 0, transactions: 0 }
  );

  return (
    <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Hourly POS Sales Velocity</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time hourly checkout traffic throughout today</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-200/50 px-3 py-1.5 rounded-xl border border-slate-300/60 text-xs font-bold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-brand" />
          <span>
            {peak.sales > 0 ? (
              <>Peak: <strong className="text-slate-900">{peak.hour}</strong> (${peak.sales.toFixed(2)})</>
            ) : (
              <span>Today&apos;s Velocity: <strong className="text-slate-900">${(todayTotal || 0).toFixed(2)}</strong></span>
            )}
          </span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-13 gap-1.5 sm:gap-2 h-44 items-end">
          {chartData.map((item, idx) => {
            const heightPct = maxSales > 0 ? Math.round((item.sales / maxSales) * 100) : 0;
            const isPeak = peak.sales > 0 && item.hour === peak.hour;

            return (
              <div key={item.hour} className="flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-20">
                  ${item.sales.toFixed(2)} ({item.transactions} orders)
                </div>

                {/* Bar */}
                <div className="w-full bg-slate-200/50 rounded-t-lg h-full flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(item.sales > 0 ? heightPct : 4, 4)}%` }}
                    transition={{ delay: idx * 0.02, duration: 0.3 }}
                    className={`w-full rounded-t-lg transition-colors ${
                      item.sales === 0
                        ? 'bg-slate-300/50'
                        : isPeak
                        ? 'bg-brand shadow-md shadow-brand/20'
                        : 'bg-brand/40 hover:bg-brand/70'
                    }`}
                  />
                </div>

                {/* Hour Label */}
                <span className={`text-[9px] font-bold tracking-tight truncate ${isPeak ? 'text-brand font-extrabold' : 'text-slate-400'}`}>
                  {item.hour.split(':')[0]}h
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-slate-300/60 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Today&apos;s Gross Volume: <strong className="text-slate-900">${(todayTotal || 0).toFixed(2)}</strong></span>
        <span className="text-[11px] text-slate-400">Aggregated from live POS checkout receipts</span>
      </div>
    </div>
  );
}
