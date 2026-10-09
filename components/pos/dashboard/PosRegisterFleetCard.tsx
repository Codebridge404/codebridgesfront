'use client';

import React from 'react';
import Link from 'next/link';
import { Monitor, ArrowUpRight, DollarSign, Clock } from 'lucide-react';

export interface RegisterItem {
  id: string;
  name: string;
  code: string;
  cashierName: string;
  status: 'active' | 'idle' | 'closed';
  openTime: string;
  openingFloat: number;
  cashSales: number;
  khqrSales: number;
  totalSales: number;
  ordersCount: number;
}

interface PosRegisterFleetCardProps {
  registers?: RegisterItem[];
  onOpenTerminal?: (registerCode: string) => void;
}

export function PosRegisterFleetCard({ registers = [], onOpenTerminal }: PosRegisterFleetCardProps) {
  const fleet = registers || [];

  return (
    <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Live Register Fleet</h3>
            <p className="text-xs text-slate-500 font-medium">
              {fleet.filter((r) => r.status === 'active').length} of {fleet.length || 1} terminal(s) actively transacting
            </p>
          </div>
        </div>

        <Link
          href="/pos/shifts"
          className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          <span>Audit Shifts</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Register List */}
      <div className="space-y-3">
        {fleet.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-200/40 border border-slate-300/60 text-center text-xs text-slate-400 font-medium">
            <Monitor className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
            <p className="font-extrabold text-slate-700">Primary Terminal (REG-01) Ready</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Open a shift drawer to begin tracking real-time drawer velocity.</p>
          </div>
        ) : (
          fleet.map((reg) => (
            <div
              key={reg.id}
              className="p-4 rounded-2xl bg-slate-200/40 hover:bg-slate-200/60 border border-slate-300/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200/60 text-slate-700 flex items-center justify-center border border-slate-300/60 font-extrabold text-xs">
                  {reg.code?.replace('REG-', '#') || '#01'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900">{reg.name}</h4>
                    {reg.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-200 text-slate-600">
                        CLOSED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Cashier: <strong className="text-slate-800">{reg.cashierName || 'Cashier Assigned'}</strong> • Opened {reg.openTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:border-l sm:border-slate-300/60 sm:pl-4 justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drawer Sales</p>
                  <p className="text-xs font-black text-slate-900">${(reg.totalSales || 0).toFixed(2)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orders</p>
                  <p className="text-xs font-black text-indigo-600">{reg.ordersCount || 0}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
