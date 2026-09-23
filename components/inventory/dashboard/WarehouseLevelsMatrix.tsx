'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, Building2, Snowflake, Store, ArrowRight, Loader2, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getOutletsApi, getInventoryBalancesApi } from '@/lib/api';

interface WarehouseHub {
  id: string | number;
  name: string;
  type: string;
  location: string;
  capacityPct: number;
  skusCount: number;
  valuation: string;
  icon: any;
  color: string;
}

interface WarehouseLevelsMatrixProps {
  onEditWarehouse?: (warehouse: any) => void;
  onDeleteWarehouse?: (warehouse: any) => void;
  onAddWarehouse?: () => void;
}

export function WarehouseLevelsMatrix({
  onEditWarehouse,
  onDeleteWarehouse,
  onAddWarehouse,
}: WarehouseLevelsMatrixProps = {}) {
  const [warehouses, setWarehouses] = useState<WarehouseHub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDynamicWarehouseStock() {
      try {
        setLoading(true);
        // 1. Fetch real store outlets / warehouses from auth_db
        const outletsRes = await getOutletsApi();
        const outletsList = Array.isArray(outletsRes) ? outletsRes : outletsRes?.data || [];

        if (outletsList.length > 0) {
          // 2. Fetch live stock balances strictly for each outlet belonging to this organization
          const dynamicHubs: WarehouseHub[] = await Promise.all(
            outletsList.map(async (outlet: any, index: number) => {
              let skus = 0;
              let totalValue = 0;
              let onHandCount = 0;

              try {
                const balRes = await getInventoryBalancesApi(outlet.id);
                const items = Array.isArray(balRes) ? balRes : balRes?.data || [];
                skus = items.length;
                totalValue = items.reduce(
                  (sum: number, item: any) =>
                    sum + Number(item.on_hand || item.quantity || 0) * Number(item.cost_price || item.unit_price || 0),
                  0
                );
                onHandCount = items.reduce(
                  (sum: number, item: any) => sum + Number(item.on_hand || item.quantity || 0),
                  0
                );
              } catch {
                skus = 0;
                totalValue = 0;
                onHandCount = 0;
              }

              const isColdStorage = outlet.name?.toLowerCase().includes('cold');
              const isCentral =
                outlet.name?.toLowerCase().includes('central') ||
                outlet.name?.toLowerCase().includes('main') ||
                index === 0;

              const capacityPercentage = Math.min(
                100,
                Math.max(10, onHandCount > 0 ? Math.round((onHandCount / 500) * 100) : 25)
              );

              return {
                id: outlet.id,
                name: outlet.name || `Warehouse Hub #${outlet.id}`,
                type: isCentral ? 'Central Logistics Hub' : isColdStorage ? 'Cold Chain Depot' : 'Store Branch Storeroom',
                location: outlet.address || outlet.location || 'Phnom Penh, Cambodia',
                capacityPct: capacityPercentage,
                skusCount: skus,
                valuation: totalValue > 0
                  ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '$0.00',
                icon: isCentral ? Warehouse : isColdStorage ? Snowflake : Store,
                color: isCentral
                  ? 'text-brand bg-brand-subtle'
                  : isColdStorage
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-emerald-700 bg-emerald-50',
              };
            })
          );
          setWarehouses(dynamicHubs);
        } else {
          setWarehouses([]);
        }
      } catch (err) {
        console.error('Failed to load dynamic warehouse stock levels:', err);
        setWarehouses([]);
      } finally {
        setLoading(false);
      }
    }

    loadDynamicWarehouseStock();
  }, []);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">Warehouse Stock Levels</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time capacity, active SKU counts, and live location valuations</p>
        </div>
        <Link href="/inventory/transfers" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
          <span>Transfer Stock</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs font-bold">Querying live warehouse stock levels...</span>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center mx-auto">
            <Warehouse className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-black text-sm text-slate-900">No Warehouse Locations Registered</h4>
            <p className="text-xs text-slate-500 font-medium">
              This organization does not have any physical warehouses or retail outlets configured yet.
            </p>
          </div>
          {onAddWarehouse ? (
            <button
              type="button"
              onClick={onAddWarehouse}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>Register First Warehouse Outlet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href="/inventory/stock-warehouses"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <span>Register First Warehouse Outlet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${warehouses.length === 1 ? 'grid-cols-1 max-w-xl' : warehouses.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {warehouses.map((wh) => {
            const IconComp = wh.icon;
            return (
              <div
                key={wh.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3 flex flex-col justify-between hover:border-brand/40 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${wh.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-700">
                        {wh.type}
                      </span>
                      {onEditWarehouse && (
                        <button
                          type="button"
                          onClick={() => onEditWarehouse(wh)}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand hover:bg-white transition-colors cursor-pointer"
                          title="Edit Warehouse Hub"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteWarehouse && (
                        <button
                          type="button"
                          onClick={() => onDeleteWarehouse(wh)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                          title="Decommission Warehouse Hub"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{wh.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{wh.location}</p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Storage Capacity:</span>
                    <span className="text-slate-900">{wh.capacityPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        wh.capacityPct > 85 ? 'bg-rose-500' : 'bg-brand'
                      }`}
                      style={{ width: `${wh.capacityPct}%` }}
                    />
                  </div>
                </div>

                {/* Valuation & SKUs */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Total Valuation</span>
                    <span className="font-black text-slate-900 font-mono">{wh.valuation}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Tracked SKUs</span>
                    <span className="font-black text-slate-700 font-mono">{wh.skusCount} items</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
