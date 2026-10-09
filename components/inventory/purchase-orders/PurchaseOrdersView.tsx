'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Plus,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import {
  getPurchaseOrdersApi,
  updatePurchaseOrderStatusApi,
} from '@/lib/api';
import { LowStockAlertsTable } from '@/components/inventory';
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal';
import { ReceivePurchaseOrderModal } from './ReceivePurchaseOrderModal';

export function PurchaseOrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [receivingPo, setReceivingPo] = useState<any | null>(null);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseOrdersApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);
    } catch (err) {
      console.warn('Could not load purchase orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const handleUpdateStatus = async (id: string | number, status: string) => {
    try {
      await updatePurchaseOrderStatusApi(id, status);
      loadPurchaseOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders.filter((po) => {
    const matchStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchSearch =
      !search.trim() ||
      po.po_number?.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4 w-full font-sans text-slate-900 pb-8 select-none">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Purchase Orders (POs)</h1>
            <p className="text-xs text-slate-500 font-medium">
              Vendor procurement pipelines, receiving inspections, and inventory ledger synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPurchaseOrders}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh POs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PO ref or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="ordered">Ordered</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* 3. Purchase Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-5">PO Number</th>
              <th className="py-3 px-4">Supplier / Vendor</th>
              <th className="py-3 px-4 text-center">Items</th>
              <th className="py-3 px-4 text-right">Est. Total ($)</th>
              <th className="py-3 px-4">Order Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand" />
                  <span>Loading purchase orders...</span>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No purchase orders found matching current criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((po) => {
                const isReceived = po.status === 'received';
                const isCancelled = po.status === 'cancelled';
                const statusColor = isReceived
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : isCancelled
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : po.status === 'approved'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

                return (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-black text-slate-900">{po.po_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{po.supplier}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">{po.items_count || 1} SKUs</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-brand text-sm">
                      ${Number(po.est_total || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{po.order_date || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusColor}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isReceived && !isCancelled && (
                          <>
                            <button
                              type="button"
                              onClick={() => setReceivingPo(po)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              title="Receive stock into inventory"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Receive</span>
                            </button>
                            {po.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(po.id, 'approved')}
                                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(po.id, 'cancelled')}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Cancel PO"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {isReceived && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Stock In Stock</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Automated Reorder Replenishment Feed */}
      <div className="pt-2">
        <LowStockAlertsTable />
      </div>

      {/* Modals */}
      <CreatePurchaseOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadPurchaseOrders}
      />

      <ReceivePurchaseOrderModal
        isOpen={Boolean(receivingPo)}
        po={receivingPo}
        onClose={() => setReceivingPo(null)}
        onSuccess={loadPurchaseOrders}
      />
    </div>
  );
}

export default PurchaseOrdersView;
