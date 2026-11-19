/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0160
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import {
  getReorderSuggestionsApi,
  autoReorderPurchaseOrdersApi,
} from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

interface ReorderItem {
  product_id: number;
  name: string;
  sku: string;
  current_on_hand: number;
  min_reorder_point: number;
  suggested_quantity: number;
  unit_cost: number;
  est_cost: number;
}

interface SupplierSuggestion {
  supplier: string;
  items_count: number;
  est_total: number;
  items: ReorderItem[];
}

interface ReorderSuggestionsData {
  total_suppliers: number;
  total_items_to_reorder: number;
  total_estimated_cost: number;
  suppliers: SupplierSuggestion[];
}

interface ReorderSuggestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrdersGenerated?: () => void;
  outletId?: string | number;
}

export const ReorderSuggestionsDrawer: React.FC<ReorderSuggestionsDrawerProps> = ({
  isOpen,
  onClose,
  onOrdersGenerated,
  outletId,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ReorderSuggestionsData | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const res = await getReorderSuggestionsApi(outletId);
      const suggestionsData: ReorderSuggestionsData = res.data || {
        total_suppliers: 0,
        total_items_to_reorder: 0,
        total_estimated_cost: 0,
        suppliers: [],
      };
      setData(suggestionsData);

      // Pre-select all suppliers by default
      const allSupplierNames = suggestionsData.suppliers.map((s) => s.supplier);
      setSelectedSuppliers(allSupplierNames);

      // Expand first supplier by default
      const initialExpanded: Record<string, boolean> = {};
      if (allSupplierNames.length > 0) {
        initialExpanded[allSupplierNames[0]] = true;
      }
      setExpandedSuppliers(initialExpanded);
    } catch (err: any) {
      console.error('Failed to fetch reorder suggestions:', err);
      setErrorMessage(err.message || 'Failed to load reorder suggestions.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, outletId]);

  if (!isOpen) return null;

  const toggleSupplierSelection = (supplierName: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierName)
        ? prev.filter((name) => name !== supplierName)
        : [...prev, supplierName]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.suppliers) return;
    if (selectedSuppliers.length === data.suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(data.suppliers.map((s) => s.supplier));
    }
  };

  const toggleExpand = (supplierName: string) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierName]: !prev[supplierName],
    }));
  };

  const handleGenerateOrders = async () => {
    if (selectedSuppliers.length === 0) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await autoReorderPurchaseOrdersApi({
        suppliers: selectedSuppliers,
        outlet_id: outletId,
      });

      const count = selectedSuppliers.length;
      setSuccessMessage(
        res.message || `Successfully generated draft Purchase Orders for ${count} supplier(s).`
      );

      // Refresh parent if provided
      if (onOrdersGenerated) {
        onOrdersGenerated();
      }

      // Re-fetch suggestions to update list
      setTimeout(() => {
        fetchSuggestions();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to auto-reorder:', err);
      setErrorMessage(err.message || 'Failed to auto-generate purchase orders.');
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected =
    data && data.suppliers.length > 0 && selectedSuppliers.length === data.suppliers.length;

  const totalSelectedEstCost = (data?.suppliers || [])
    .filter((s) => selectedSuppliers.includes(s.supplier))
    .reduce((acc, curr) => acc + Number(curr.est_total || 0), 0);

  const totalSelectedItems = (data?.suppliers || [])
    .filter((s) => selectedSuppliers.includes(s.supplier))
    .reduce((acc, curr) => acc + Number(curr.items_count || 0), 0);

  return (
    <Portal><div className="fixed inset-0 z-[9999] overflow-hidden cb-modal-backdrop flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col font-sans border-l border-slate-200 text-slate-800">
        {/* 1. Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Reorder Suggestions
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                  AI & Safety Stock
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Replenishment deficit audit against min reorder points
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSuggestions}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Top Metric Ribbon */}
        {data && (
          <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50/50 border-b border-slate-100 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Suppliers
              </span>
              <span className="text-base font-black text-slate-900">
                {data.total_suppliers}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Items Deficit
              </span>
              <span className="text-base font-black text-slate-900">
                {data.total_items_to_reorder}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Est. Restock Cost
              </span>
              <span className="text-base font-black text-emerald-600 font-mono">
                ${Number(data.total_estimated_cost || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}

        {/* 3. Alerts */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* 4. Selection Toolbar */}
        {data && data.suppliers.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between text-xs border-b border-slate-100 bg-white">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {allSelected ? 'Deselect All Suppliers' : 'Select All Suppliers'}
              </span>
            </button>
            <span className="text-slate-500 font-medium">
              Selected: <strong className="text-slate-900">{selectedSuppliers.length}</strong> of{' '}
              {data.suppliers.length}
            </span>
          </div>
        )}

        {/* 5. Main Body / Supplier Accordion */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs font-semibold">Auditing inventory balance thresholds...</p>
            </div>
          ) : !data || data.suppliers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 p-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">All Stock Levels are Healthy</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No products are currently under their configured minimum reorder points. No purchase orders needed at this time.
              </p>
            </div>
          ) : (
            data.suppliers.map((supplier) => {
              const isSelected = selectedSuppliers.includes(supplier.supplier);
              const isExpanded = !!expandedSuppliers[supplier.supplier];

              return (
                <div
                  key={supplier.supplier}
                  className={`rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-indigo-200 bg-white shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/50 opacity-75'
                  }`}
                >
                  {/* Supplier Header */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSupplierSelection(supplier.supplier)}
                        className="text-slate-600 hover:text-indigo-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">
                            {supplier.supplier}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {supplier.items_count} items
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          Est. Total: <span className="text-slate-900 font-bold">${Number(supplier.est_total).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(supplier.supplier)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title={isExpanded ? 'Collapse items' : 'Expand items'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Collapsible Item Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50 rounded-b-2xl">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="text-slate-400 font-bold uppercase border-b border-slate-200/60 pb-1">
                            <th className="py-1.5">Product</th>
                            <th className="py-1.5 text-center">On Hand</th>
                            <th className="py-1.5 text-center">Min Reorder</th>
                            <th className="py-1.5 text-center text-amber-700">Order Qty</th>
                            <th className="py-1.5 text-right">Est Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {supplier.items.map((item) => (
                            <tr key={item.product_id} className="hover:bg-white/80">
                              <td className="py-2 pr-2">
                                <div className="font-bold text-slate-800">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {item.sku}
                                </div>
                              </td>
                              <td className="py-2 text-center font-mono font-bold text-slate-700">
                                {item.current_on_hand}
                              </td>
                              <td className="py-2 text-center font-mono text-slate-500">
                                {item.min_reorder_point}
                              </td>
                              <td className="py-2 text-center font-mono font-black text-amber-700">
                                +{item.suggested_quantity}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-slate-800">
                                ${Number(item.est_cost).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 6. Footer Sticky Action */}
        <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Selected: <strong className="text-slate-900">{totalSelectedItems} items</strong> across{' '}
              <strong className="text-slate-900">{selectedSuppliers.length} suppliers</strong>
            </div>
            <div className="text-base font-black text-slate-900 font-mono">
              ${totalSelectedEstCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateOrders}
              disabled={submitting || selectedSuppliers.length === 0}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating POs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Purchase Orders</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div></Portal>
  );
};

