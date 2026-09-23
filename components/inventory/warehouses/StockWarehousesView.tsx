'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, RefreshCw, Plus, ArrowUpRight, Sliders } from 'lucide-react';
import { WarehouseLevelsMatrix, LowStockAlertsTable } from '@/components/inventory';
import { WarehouseModal } from './WarehouseModal';
import { ReceiveStockShipmentModal, ReceiveFormState } from '../modals/ReceiveStockShipmentModal';
import { RecordStockAdjustmentModal, AdjustFormState } from '../modals/RecordStockAdjustmentModal';
import { getProductsApi, receiveStockApi, adjustStockApi, deleteOutletApi } from '@/lib/api';
import { useToast, useConfirm } from '@/components/common';

export function StockWarehousesView() {
  const toast = useToast();
  const confirm = useConfirm();
  const [refreshKey, setRefreshKey] = useState(0);

  // Warehouse Hub Modals
  const [isAddHubOpen, setIsAddHubOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<any | null>(null);

  // Stock Movement & Adjustment Modals
  const [products, setProducts] = useState<any[]>([]);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [savingStock, setSavingStock] = useState(false);

  const [receiveForm, setReceiveForm] = useState<ReceiveFormState>({
    po_number: '',
    supplier_name: '',
    product_id: '',
    quantity: '10',
    unit_cost: '',
  });

  const [adjustForm, setAdjustForm] = useState<AdjustFormState>({
    product_id: '',
    type: 'decrement',
    reason: 'damaged',
    quantity: '1',
    notes: '',
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getProductsApi();
        const list = Array.isArray(res) ? res : res?.data || [];
        setProducts(list);
        if (list.length > 0) {
          setReceiveForm((prev) => ({
            ...prev,
            product_id: String(list[0].id),
            unit_cost: String(list[0].cost_price || list[0].price || '0'),
          }));
          setAdjustForm((prev) => ({
            ...prev,
            product_id: String(list[0].id),
          }));
        }
      } catch (err) {
        console.warn('Could not preload products for stock modals:', err);
      }
    }
    loadProducts();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteWarehouse = async (wh: any) => {
    const confirmed = await confirm({
      title: 'Decommission Warehouse Hub',
      description: `Are you sure you want to permanently decommission and delete "${wh.name}"? All active stock records assigned to this warehouse will be decommissioned.`,
      variant: 'danger',
      confirmText: 'Decommission Hub',
      details: [
        { label: 'Hub Name', value: wh.name },
        { label: 'Location', value: wh.location || 'N/A' },
        { label: 'Total Valuation', value: wh.valuation || '$0.00' },
        { label: 'Tracked SKUs', value: `${wh.skusCount || 0} items` },
      ],
    });

    if (!confirmed) return;

    try {
      await deleteOutletApi(wh.id);
      toast.success(`Warehouse hub "${wh.name}" was successfully decommissioned.`);
      handleRefresh();
    } catch (err: any) {
      console.error('Failed to decommission warehouse hub:', err);
      toast.error(err?.message || 'Failed to decommission warehouse hub.');
    }
  };

  const handleSaveReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStock(true);
      await receiveStockApi({
        po_number: receiveForm.po_number,
        supplier_name: receiveForm.supplier_name,
        product_id: Number(receiveForm.product_id),
        quantity: Number(receiveForm.quantity),
        unit_cost: Number(receiveForm.unit_cost) || 0,
      });
      toast.success(`Successfully received ${receiveForm.quantity} units for PO #${receiveForm.po_number}`);
      setIsReceiveOpen(false);
      handleRefresh();
    } catch (err: any) {
      console.error('Failed to receive stock shipment:', err);
      toast.error(err?.message || 'Failed to record stock shipment.');
    } finally {
      setSavingStock(false);
    }
  };

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStock(true);
      await adjustStockApi({
        product_id: Number(adjustForm.product_id),
        type: adjustForm.type,
        reason: adjustForm.reason,
        quantity: Number(adjustForm.quantity),
        notes: adjustForm.notes,
      });
      toast.success(`Stock adjustment recorded successfully (${adjustForm.type} ${adjustForm.quantity} units)`);
      setIsAdjustOpen(false);
      handleRefresh();
    } catch (err: any) {
      console.error('Failed to adjust stock:', err);
      toast.error(err?.message || 'Failed to record stock adjustment.');
    } finally {
      setSavingStock(false);
    }
  };

  return (
    <div className="space-y-3 w-full font-sans text-slate-900 pb-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Stock &amp; Multi-Warehouse Hubs</h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time multi-location stock allocations, cold storage balances, and replenishment reorder alerts
            </p>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setIsAdjustOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Adjust Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReceiveOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            <span>Receive Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddHubOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Warehouse Hub</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh Warehouse Balances"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Warehouse Stock Matrix with In-Page Card Actions */}
      <div key={`matrix-${refreshKey}`}>
        <WarehouseLevelsMatrix
          onAddWarehouse={() => setIsAddHubOpen(true)}
          onEditWarehouse={(wh) => setEditingHub(wh)}
          onDeleteWarehouse={handleDeleteWarehouse}
        />
      </div>

      {/* 3. Low Stock Alerts & Replenishment Queue */}
      <div key={`alerts-${refreshKey}`}>
        <LowStockAlertsTable />
      </div>

      {/* Modals */}
      <WarehouseModal
        isOpen={isAddHubOpen}
        onClose={() => setIsAddHubOpen(false)}
        onSaved={(name) => {
          toast.success(`Warehouse hub "${name}" successfully registered!`);
          handleRefresh();
        }}
      />

      <WarehouseModal
        isOpen={Boolean(editingHub)}
        onClose={() => setEditingHub(null)}
        editingWarehouse={editingHub}
        onSaved={(name) => {
          toast.success(`Warehouse hub "${name}" updated successfully!`);
          handleRefresh();
        }}
      />

      <ReceiveStockShipmentModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        form={receiveForm}
        setForm={setReceiveForm}
        onSubmit={handleSaveReceiveStock}
        products={products}
        saving={savingStock}
      />

      <RecordStockAdjustmentModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        form={adjustForm}
        setForm={setAdjustForm}
        onSubmit={handleSaveStockAdjustment}
        selectedProduct={null}
        products={products}
        saving={savingStock}
      />
    </div>
  );
}
