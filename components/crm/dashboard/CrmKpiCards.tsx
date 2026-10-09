'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Briefcase, TrendingUp, Users, ArrowUpRight, Loader2 } from 'lucide-react';
import { getCrmKpisApi, CrmKpiData } from '@/lib/api';

export function CrmKpiCards() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<CrmKpiData>({
    pipeline_value: 0,
    active_deals_count: 0,
    deals_won_mtd: 0,
    won_deals_count: 0,
    win_rate: 0,
    leads_count: 0,
  });

  useEffect(() => {
    async function loadKpis() {
      try {
        setLoading(true);
        const res = await getCrmKpisApi();
        if (res?.data) {
          setKpis(res.data);
        }
      } catch (err) {
        console.error('Failed to load CRM KPIs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadKpis();
  }, []);

  const cards = [
    {
      title: 'Total Pipeline Value',
      value: loading ? '...' : `$${Number(kpis.pipeline_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${kpis.active_deals_count} Active Opportunit${kpis.active_deals_count === 1 ? 'y' : 'ies'}`,
      change: 'Active sales opportunities',
      isPositive: true,
      icon: DollarSign,
      color: 'text-brand',
      bg: 'bg-brand-subtle border border-brand/20',
    },
    {
      title: 'Deals Won (MTD)',
      value: loading ? '...' : `$${Number(kpis.deals_won_mtd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${kpis.won_deals_count} Closed-Won Deal${kpis.won_deals_count === 1 ? '' : 's'}`,
      change: 'Current month closed deals',
      isPositive: true,
      icon: Briefcase,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Conversion Win Rate',
      value: loading ? '...' : `${Number(kpis.win_rate || 0).toFixed(1)}%`,
      subtitle: 'Won vs Completed Deals',
      change: 'Pipeline conversion benchmark',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-brand',
      bg: 'bg-brand-subtle border border-brand/20',
    },
    {
      title: 'Inbound Leads Velocity',
      value: loading ? '...' : `${kpis.leads_count} Leads`,
      subtitle: 'Prospective Customers',
      change: 'Total inbound prospects captured',
      isPositive: true,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const IconComp = c.icon;
        return (
          <div
            key={idx}
            className="bg-transparent p-5 rounded-2xl border border-slate-300/80 flex flex-col justify-between hover:border-slate-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
              <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
                <IconComp className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{c.value}</p>
              <p className="text-xs text-slate-400 font-semibold">{c.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-slate-300/60 flex items-center gap-1 text-[11px] font-extrabold text-brand">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              <span>{c.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
