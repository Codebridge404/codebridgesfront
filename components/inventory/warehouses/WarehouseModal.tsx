/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, Building2, Snowflake, Store, Save, X, AlertCircle, Loader2 } from 'lucide-react';
import { createOutletApi, updateOutletApi } from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

interface WarehouseFormData {
  name: string;
  code: string;
  phone: string;
  address: string;
  type: string;
  receipt_header: string;
  receipt_footer: string;
}

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWarehouse?: any | null;
  onSaved: (warehouseName: string, isNew: boolean) => void;
}

export function WarehouseModal({
  isOpen,
  onClose,
  editingWarehouse,
  onSaved,
}: WarehouseModalProps) {
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    code: '',
    phone: '',
    address: '',
    type: 'branch',
    receipt_header: 'Thank you for shopping with us!',
    receipt_footer: 'Please visit again soon!',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingWarehouse) {
      const nameLower = (editingWarehouse.name || '').toLowerCase();
      const detectedType = nameLower.includes('cold')
        ? 'cold'
        : nameLower.includes('central') || nameLower.includes('main')
        ? 'central'
        : 'branch';

      setFormData({
        name: editingWarehouse.name || '',
        code: editingWarehouse.code || `WH-${editingWarehouse.id || '01'}`,
        phone: editingWarehouse.phone || '',
        address: editingWarehouse.location || editingWarehouse.address || '',
        type: detectedType,
        receipt_header: editingWarehouse.receipt_header || 'Thank you for shopping with us!',
        receipt_footer: editingWarehouse.receipt_footer || 'Please visit again soon!',
      });
    } else {
      setFormData({
        name: '',
        code: `WH-${Math.floor(100 + Math.random() * 900)}`,
        phone: '',
        address: '',
        type: 'branch',
        receipt_header: 'Thank you for shopping with us!',
        receipt_footer: 'Please visit again soon!',
      });
    }
    setError(null);
  }, [editingWarehouse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a warehouse or store name.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Append type suffix if not already present for classification
      let adjustedName = formData.name.trim();
      if (formData.type === 'cold' && !adjustedName.toLowerCase().includes('cold')) {
        adjustedName += ' (Cold Chain)';
      } else if (formData.type === 'central' && !adjustedName.toLowerCase().includes('central')) {
        adjustedName += ' (Central Hub)';
      }

      const payload = {
        name: adjustedName,
        code: formData.code.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        location: formData.address.trim() || undefined,
        receipt_header: formData.receipt_header.trim() || undefined,
        receipt_footer: formData.receipt_footer.trim() || undefined,
      };

      if (editingWarehouse) {
        await updateOutletApi(editingWarehouse.id, payload);
        onSaved(formData.name.trim(), false);
      } else {
        await createOutletApi(payload);
        onSaved(formData.name.trim(), true);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save warehouse:', err);
      setError(err?.message || 'Failed to save warehouse hub details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingWarehouse ? 'Edit Warehouse Hub' : 'Register New Warehouse Hub'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Storage facility parameters, address, and receipt configurations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Warehouse / Branch Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Central Logistics Depot Phnom Penh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Hub Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Facility Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                <option value="central">Central Logistics Hub</option>
                <option value="cold">Cold Chain Depot (Refrigerated)</option>
                <option value="branch">Store Branch Storeroom</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+855 23 888 999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Physical Location / Address</label>
              <input
                type="text"
                placeholder="e.g. St 271, Phnom Penh"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Store Receipt Header</label>
              <input
                type="text"
                value={formData.receipt_header}
                onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Store Receipt Footer Note</label>
              <input
                type="text"
                value={formData.receipt_footer}
                onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-black shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}</span>
            </button>
          </div>
        </form>
      </div>
    </div></Portal>
  );
}
