'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Filter, ShoppingCart, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getInventoryBalancesApi, getOutletsApi } from '@/lib/api';

interface LowStockItem {
  id: string | number;
  name: string;
  sku: string;
  warehouse: string;
  currentStock: number;
  reorderPoint: number;
  suggestedPo: number;
  unit: string;
  supplier: string;
}

export function LowStockAlertsTable() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLowStock() {
      try {
        setLoading(true);
        // 1. Fetch live outlets belonging to this organization
        const outletsRes = await getOutletsApi();
        const outletsList = Array.isArray(outletsRes) ? outletsRes : outletsRes?.data || [];

        if (outletsList.length > 0) {
          const allLowStock: LowStockItem[] = [];

          await Promise.all(
            outletsList.map(async (outlet: any) => {
              try {
                const res = await getInventoryBalancesApi(outlet.id, 'low_stock');
                const balances = Array.isArray(res) ? res : res?.data || [];

                balances.forEach((b: any, index: number) => {
                  allLowStock.push({
                    id: b.id || b.balance_id || `${outlet.id}-${index}`,
                    name: b.product_name || b.name || `Product #${b.product_id}`,
                    sku: b.sku || `SKU-${String(b.product_id || index).padStart(4, '0')}`,
                    warehouse: outlet.name || b.outlet_name || 'Main Store',
                    currentStock: Number(b.on_hand ?? b.quantity ?? b.current_stock ?? 0),
                    reorderPoint: Number(b.min_reorder_point ?? b.reorder_level ?? b.min_stock ?? 0),
                    suggestedPo: Math.max(0, (Number(b.min_reorder_point ?? b.reorder_level ?? 0) * 2) - Number(b.on_hand ?? 0)),
                    unit: b.unit || 'units',
                    supplier: b.supplier_name || 'Primary Supplier',
                  });
                });
              } catch (err) {
                console.warn(`[LowStockAlertsTable] Could not fetch balances for outlet ${outlet.id}:`, err);
              }
            })
          );

          setItems(allLowStock);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load low stock items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadLowStock();
  }, []);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Critical Low Stock Reorder Queue</h3>
            <p className="text-xs text-slate-500 font-medium">SKUs below safety stock buffer with automatic PO replenishment suggestions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/super-admin/inventory/purchase-orders"
            className="px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Generate Bulk POs</span>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase">Product &amp; SKU</th>
              <th className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase">Location Hub</th>
              <th className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase">Current Stock</th>
              <th className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase">Safety Threshold</th>
              <th className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase">Primary Supplier</th>
              <th className="px-4 py-3 text-right font-extrabold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand mb-1" />
                  Checking safety stock thresholds...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span className="font-extrabold text-slate-800 text-xs">All Inventory Levels Healthy</span>
                    <span className="text-[11px] text-slate-400">No items are currently below minimum safety stock buffer thresholds.</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900">{item.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{item.sku}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{item.warehouse}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-rose-100 text-rose-800">
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-500">
                    Min {item.reorderPoint} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{item.supplier}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href="/super-admin/inventory/purchase-orders"
                      className="px-2.5 py-1 rounded-lg bg-brand-subtle text-brand font-extrabold text-[11px] hover:bg-brand/20 transition-colors inline-flex items-center gap-1"
                    >
                      <span>PO +{item.suggestedPo}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
