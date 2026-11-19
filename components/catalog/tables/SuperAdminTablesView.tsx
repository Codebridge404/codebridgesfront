'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import { getTablesApi, updateTableStatusApi } from '@/lib/api';
import { RestaurantTableItem } from './types';

export function SuperAdminTablesView() {
  const [tables, setTables] = useState<RestaurantTableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await getTablesApi();
      setTables(res.data || []);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateTableStatusApi(id, newStatus);
      loadTables();
    } catch (err) {
      console.error('Failed to update table status:', err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutGrid className="w-7 h-7 text-emerald-600" />
            Restaurant Floor Plan &amp; Table Layout
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time table availability, occupancy statuses, and dining room seating manager
          </p>
        </div>

        <button
          onClick={loadTables}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover-hover text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Floor Map
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
          Loading restaurant floor map...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 shadow-xs ${
                t.status === 'vacant'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : t.status === 'occupied'
                  ? 'bg-rose-50/40 border-rose-200'
                  : t.status === 'bill_requested'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-indigo-50/40 border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">{t.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    t.status === 'vacant'
                      ? 'bg-emerald-100 text-emerald-700'
                      : t.status === 'occupied'
                      ? 'bg-rose-100 text-rose-700'
                      : t.status === 'bill_requested'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1 font-medium">
                <p>Zone: <strong className="text-slate-800">{t.zone}</strong></p>
                <p>Capacity: <strong className="text-slate-800">{t.capacity} Seats</strong></p>
              </div>

              {/* Status Switcher Actions */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => handleStatusChange(t.id, 'vacant')}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Vacant
                </button>
                <button
                  onClick={() => handleStatusChange(t.id, 'occupied')}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Occupied
                </button>
                <button
                  onClick={() => handleStatusChange(t.id, 'bill_requested')}
                  className="flex-1 py-1.5 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 cursor-pointer"
                >
                  Bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
