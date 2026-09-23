'use client';

import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, Plus } from 'lucide-react';
import { InterWarehouseTransfersCard } from '@/components/inventory';
import { CreateTransferModal } from './CreateTransferModal';
import { getOutletsApi, getProductsApi, receiveTransferApi } from '@/lib/api';
import { useToast } from '@/components/common';

export function TransfersManagementView() {
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [outletsRes, productsRes] = await Promise.all([
          getOutletsApi(),
          getProductsApi(),
        ]);
        setOutlets(Array.isArray(outletsRes) ? outletsRes : outletsRes?.data || []);
        setProducts(Array.isArray(productsRes) ? productsRes : productsRes?.data || []);
      } catch (err) {
        console.warn('Failed to load outlets/products for transfer modal:', err);
      }
    }
    loadData();
  }, [refreshKey]);

  const handleReceiveTransfer = async (id: string | number) => {
    try {
      await receiveTransferApi(String(id));
      toast.success('Shipment received and stock balances successfully allocated at destination hub!');
      handleRefresh();
    } catch (err: any) {
      console.error('Failed to mark transfer received:', err);
      toast.error(err?.message || 'Failed to confirm transfer receipt.');
    }
  };

  return (
    <div className="space-y-3 w-full font-sans text-slate-900 pb-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Transfers &amp; Shipments</h1>
            <p className="text-xs text-slate-500 font-medium">
              Inter-warehouse logistics, route dispatch manifests, and in-transit custody verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Transfer</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh Transfer Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Inter-Warehouse Transfers Manifest Card */}
      <div key={`transfers-${refreshKey}`}>
        <InterWarehouseTransfersCard onReceiveTransfer={handleReceiveTransfer} />
      </div>

      {/* 3. In-Page Create Transfer Modal */}
      <CreateTransferModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        outlets={outlets}
        products={products}
        onTransferCreated={() => {
          toast.success('Stock transfer dispatched successfully!');
          handleRefresh();
        }}
      />
    </div>
  );
}
