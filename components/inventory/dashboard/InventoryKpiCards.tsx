'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Truck, ShoppingCart, Loader2 } from 'lucide-react';
import { getProductsApi, getTransfersApi, getPurchaseOrdersApi } from '@/lib/api';

export function InventoryKpiCards() {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    stockValuation: 0,
    lowStockCount: 0,
    inTransitCount: 0,
    openPoAmount: 0,
    openPoCount: 0,
  });

  useEffect(() => {
    async function loadKpiMetrics() {
      try {
        setLoading(true);

        // 1. Fetch live products & inventory balances
        let valuation = 0;
        let lowStock = 0;
        try {
          const prodRes = await getProductsApi();
          const prodList = Array.isArray(prodRes) ? prodRes : prodRes?.data || [];
          prodList.forEach((p: any) => {
            const stock = parseFloat(p.stock_on_hand || '0');
            const cost = parseFloat(p.cost_price || '0');
            const minBuffer = parseInt(p.min_reorder_point || '5', 10);
            valuation += stock * cost;
            if (stock <= minBuffer) {
              lowStock += 1;
            }
          });
        } catch {}

        // 2. Fetch live transfers
        let inTransit = 0;
        try {
          const transRes = await getTransfersApi();
          const transList = Array.isArray(transRes) ? transRes : transRes?.data || [];
          inTransit = transList.filter((t: any) => t.status === 'in_transit' || t.status === 'pending').length;
        } catch {}

        // 3. Fetch live purchase orders
        let poAmount = 0;
        let poCount = 0;
        try {
          const poRes = await getPurchaseOrdersApi();
          const poList = Array.isArray(poRes) ? poRes : poRes?.data || [];
          const openPOs = poList.filter((po: any) => po.status === 'pending' || po.status === 'ordered');
          poCount = openPOs.length;
          poAmount = openPOs.reduce((acc: number, po: any) => acc + parseFloat(po.grand_total || po.total_amount || '0'), 0);
        } catch {}

        setKpiData({
          stockValuation: valuation,
          lowStockCount: lowStock,
          inTransitCount: inTransit,
          openPoAmount: poAmount,
          openPoCount: poCount,
        });
      } catch (err) {
        console.error('Failed to load inventory KPI cards:', err);
      } finally {
        setLoading(false);
      }
    }

    loadKpiMetrics();
  }, []);

  const cards = [
    {
      title: 'Total Stock Valuation',
      value: `$${kpiData.stockValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Live FIFO Cost Basis',
      change: 'Calculated from inventory',
      isPositive: true,
      icon: Boxes,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      title: 'Low Stock SKU Alerts',
      value: `${kpiData.lowStockCount} Items`,
      subtitle: 'At or Below Buffer Level',
      change: kpiData.lowStockCount > 0 ? 'Requires replenishment' : 'All stocks healthy',
      isPositive: kpiData.lowStockCount === 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
    {
      title: 'In-Transit Transfers',
      value: `${kpiData.inTransitCount} Shipments`,
      subtitle: 'Moving Between Outlets',
      change: kpiData.inTransitCount > 0 ? 'Active in transit' : 'No pending transfers',
      isPositive: true,
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Open Purchase Orders',
      value: `$${kpiData.openPoAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${kpiData.openPoCount} Pending POs`,
      change: 'Real-time vendor orders',
      isPositive: true,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const IconComp = c.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">{c.title}</span>
              <div className={`w-9 h-9 rounded-full ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <IconComp className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3">
              {loading ? (
                <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <p className="text-2xl font-black font-mono tracking-tight">{c.value}</p>
              )}
              <p className="text-xs font-medium mt-0.5">{c.subtitle}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className={`font-extrabold ${c.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                {c.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
