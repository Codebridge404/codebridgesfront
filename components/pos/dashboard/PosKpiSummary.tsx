'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Vault,
} from 'lucide-react';
import { PosKpis } from '../types';

interface PosKpiSummaryProps {
  kpis: PosKpis;
}

export function PosKpiSummary({ kpis }: PosKpiSummaryProps) {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.25, ease: 'easeOut' as const },
    }),
  };

  const cards = [
    // 1. Total Sales
    {
      title: "Today's POS Sales",
      value: `$${kpis.todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${kpis.todayTransactions} sales`,
      icon: DollarSign,
      iconBg: 'bg-brand-subtle text-brand border border-brand/20',
    },
    // 2. Transactions
    {
      title: 'Transactions Today',
      value: kpis.todayTransactions.toString(),
      subtitle: 'completed',
      icon: ShoppingBag,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    },
    // 3. Average Order
    {
      title: 'Average Order Value',
      value: `$${kpis.averageTicket.toFixed(2)}`,
      subtitle: 'per ticket',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    },
    // 4. Drawer Float / Cash Safe
    {
      title: 'Drawer Cash Float',
      value: `$${kpis.drawerFloat.toFixed(2)}`,
      subtitle: 'in drawer',
      icon: Vault,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            custom={idx}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="py-2.5 px-3.5 rounded-xl bg-transparent border border-slate-300/80 hover:border-slate-400 transition-all flex items-center gap-3 cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${card.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate leading-tight">
                {card.title}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-black tracking-tight text-slate-900 font-mono leading-none">
                  {card.value}
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate">
                  • {card.subtitle}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
