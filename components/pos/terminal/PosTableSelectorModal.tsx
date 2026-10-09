'use client';

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, X, Check, Users, Coffee, ShoppingBag, Truck, Loader2 } from 'lucide-react';
import { getTablesApi } from '@/lib/api';
import { PosTable } from './usePosCustomerAndTable';

interface PosTableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  onSelectOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void;
  selectedTable: PosTable | null;
  onSelectTable: (table: PosTable | null) => void;
}

export function PosTableSelectorModal({
  isOpen,
  onClose,
  orderType,
  onSelectOrderType,
  selectedTable,
  onSelectTable,
}: PosTableSelectorModalProps) {
  const [tables, setTables] = useState<PosTable[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadTables();
  }, [isOpen]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await getTablesApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setTables(list);
    } catch (err) {
      console.warn('Could not load tables:', err);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Dining Mode &amp; Table Selection</h3>
              <p className="text-[11px] text-slate-500 font-medium">Choose Dine-In table, Takeaway counter, or Delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Order Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
              Select Dining Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSelectOrderType('dine_in')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  orderType === 'dine_in'
                    ? 'border-brand bg-brand-subtle/80 ring-2 ring-brand/20 shadow-2xs text-brand font-black'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span className="text-xs">Dine-In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectOrderType('takeaway');
                  onSelectTable(null);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400/20 shadow-2xs text-amber-800 font-black'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs">Takeaway</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectOrderType('delivery');
                  onSelectTable(null);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400/20 shadow-2xs text-blue-800 font-black'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="text-xs">Delivery</span>
              </button>
            </div>
          </div>

          {/* Table Grid (if Dine-In) */}
          {orderType === 'dine_in' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Select Dining Table</span>
                {selectedTable && (
                  <button
                    type="button"
                    onClick={() => onSelectTable(null)}
                    className="text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Table
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                  <span>Loading restaurant tables...</span>
                </div>
              ) : tables.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No restaurant tables found. You can still proceed as Open Dine-In.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {tables.map((tbl) => {
                    const isSelected = selectedTable?.id === tbl.id;
                    const isOccupied = tbl.status === 'occupied';
                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => {
                          onSelectTable(tbl);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 cursor-pointer ${
                          isSelected
                            ? 'border-brand bg-brand-subtle ring-2 ring-brand/30 shadow-xs'
                            : isOccupied
                            ? 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/60'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 truncate">{tbl.name}</span>
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOccupied ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span>{tbl.zone || 'Floor'}</span>
                          <span className="flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" />
                            {tbl.capacity || 4}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
