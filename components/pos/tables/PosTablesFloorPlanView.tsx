'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Plus,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Coffee,
  Receipt,
  RotateCw,
  Loader2,
  X,
  Store,
} from 'lucide-react';
import { getTablesApi, updateTableStatusApi, createTableApi } from '@/lib/api';

export interface RestaurantTable {
  id: string | number;
  name: string;
  zone: string;
  capacity: number;
  status: 'vacant' | 'occupied' | 'reserved' | 'bill_requested';
  created_at?: string;
  updated_at?: string;
}

export function PosTablesFloorPlanView() {
  const router = useRouter();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableZone, setNewTableZone] = useState('Main Dining');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await getTablesApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setTables(list);
    } catch (err) {
      console.warn('Failed to load tables:', err);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleUpdateStatus = async (id: string | number, newStatus: RestaurantTable['status']) => {
    try {
      setUpdatingId(id);
      await updateTableStatusApi(String(id), newStatus);
      setTables((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update table status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    try {
      setSaving(true);
      await createTableApi({
        name: newTableName.trim(),
        zone: newTableZone.trim() || 'Main Dining',
        capacity: Number(newTableCapacity) || 4,
      });
      setNewTableName('');
      setIsAddModalOpen(false);
      fetchTables();
    } catch (err: any) {
      alert(err.message || 'Failed to create table');
    } finally {
      setSaving(false);
    }
  };

  const zones = ['All', ...Array.from(new Set(tables.map((t) => t.zone || 'Floor')))];

  const filteredTables = tables.filter((t) => {
    const matchZone = selectedZone === 'All' || (t.zone || 'Floor') === selectedZone;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.zone && t.zone.toLowerCase().includes(search.toLowerCase()));
    return matchZone && matchStatus && matchSearch;
  });

  const totalSeats = tables.reduce((acc, t) => acc + (Number(t.capacity) || 0), 0);
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const vacantCount = tables.filter((t) => t.status === 'vacant').length;
  const billCount = tables.filter((t) => t.status === 'bill_requested').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Tables &amp; Dining Floor Plan</h1>
            <p className="text-xs text-slate-500 font-medium">Live occupancy tracking and table billing overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTables}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh tables"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Tables</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{tables.length}</div>
          <span className="text-[11px] text-slate-500 font-semibold">{totalSeats} Total Dining Seats</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-emerald-700">Available / Vacant</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{vacantCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Ready for seating</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-amber-700">Occupied &amp; Dining</span>
          <div className="text-2xl font-black text-amber-800 mt-1">{occupiedCount}</div>
          <span className="text-[11px] text-amber-600 font-semibold">Active guest orders</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-rose-700">Bill Requested</span>
          <div className="text-2xl font-black text-rose-800 mt-1">{billCount}</div>
          <span className="text-[11px] text-rose-600 font-semibold">Awaiting checkout</span>
        </div>
      </div>

      {/* Filter and Zone Navigation Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {zones.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZone(z)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer ${
                selectedZone === z
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="bill_requested">Bill Requested</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Table Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
          <span className="font-semibold text-xs">Loading floor plan layout...</span>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
          <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-bold text-sm text-slate-700">No tables found</p>
          <p className="text-xs">Adjust your zone filter or click "Add Table" to create a new layout node.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((tbl) => {
            const isOcc = tbl.status === 'occupied';
            const isBill = tbl.status === 'bill_requested';
            const isRes = tbl.status === 'reserved';
            const badgeColor = isOcc
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : isBill
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : isRes
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            return (
              <div
                key={tbl.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-base text-slate-900">{tbl.name}</h3>
                    <span className="text-[11px] text-slate-500 font-semibold">{tbl.zone || 'Main Dining'}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${badgeColor}`}>
                    {tbl.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Capacity: {tbl.capacity || 4} Guests</span>
                </div>

                {/* Status Switcher & POS Launcher */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Quick Status:</span>
                    <select
                      value={tbl.status}
                      disabled={updatingId === tbl.id}
                      onChange={(e) => handleUpdateStatus(tbl.id, e.target.value as any)}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-800 cursor-pointer focus:outline-none"
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="bill_requested">Bill Requested</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push('/pos/pos-terminal')}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-brand hover:text-white text-slate-700 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Ring in POS Terminal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTable}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">Add Dining Table</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Table Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table #09 or Patio #03"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dining Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Main Dining, Patio, VIP Lounge"
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !newTableName.trim()}
                className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Table</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PosTablesFloorPlanView;
