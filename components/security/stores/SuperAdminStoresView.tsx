'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { getOutletsApi, createOutletApi, updateOutletApi, deleteOutletApi } from '@/lib/api';
import { StoreModal } from './StoreModal';
import { StoreMetricsCards } from './StoreMetricsCards';
import { StoreCardGrid } from './StoreCardGrid';

export const SuperAdminStoresView: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    address: '',
    receipt_header: 'Thank you for shopping at Dreams POS!',
    receipt_footer: 'Please visit us again soon!',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const res = await getOutletsApi(search || undefined);
      setStores(res.data || []);
    } catch (err: any) {
      console.error('Failed to load store outlets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStores();
  };

  const handleOpenCreateModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      code: 'STORE-' + Math.floor(100 + Math.random() * 900),
      phone: '',
      address: '',
      receipt_header: 'Thank you for shopping at Dreams POS!',
      receipt_footer: 'Please visit us again soon!',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st: any) => {
    setEditingStore(st);
    setFormData({
      name: st.name,
      code: st.code,
      phone: st.phone || '',
      address: st.address || '',
      receipt_header: st.receipt_header || 'Thank you for shopping at Dreams POS!',
      receipt_footer: st.receipt_footer || 'Please visit us again soon!',
    });
    setIsModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);

      if (editingStore) {
        await updateOutletApi(editingStore.id, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          receipt_header: formData.receipt_header,
          receipt_footer: formData.receipt_footer,
        });
        setNotification({ type: 'success', message: 'Store outlet details updated' });
      } else {
        await createOutletApi({
          name: formData.name,
          code: formData.code,
          phone: formData.phone,
          address: formData.address,
          receipt_header: formData.receipt_header,
          receipt_footer: formData.receipt_footer,
        });
        setNotification({ type: 'success', message: 'New store branch created' });
      }

      setIsModalOpen(false);
      loadStores();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Operation failed. Check server connection.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (st: any) => {
    try {
      setLoading(true);
      await updateOutletApi(st.id, { is_active: !st.is_active });
      setNotification({
        type: 'success',
        message: `Store "${st.name}" status changed to ${!st.is_active ? 'Active' : 'Inactive'}`,
      });
      loadStores();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to toggle status.' });
      setLoading(false);
    }
  };

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.is_active).length;
  const totalRegisters = stores.reduce((acc, curr) => acc + (curr.registers_count || 0), 0);

  return (
    <div className="space-y-3 w-full pb-6">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand" />
            Retail Branches &amp; Store Outlets
          </h1>
          <p className="text-xs text-slate-500">
            Configure multi-location branches, thermal receipt headers, and branch terminal assignments
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Store
        </motion.button>
      </motion.div>

      {/* Metrics Cards */}
      <StoreMetricsCards
        totalStores={totalStores}
        activeStores={activeStores}
        totalRegisters={totalRegisters}
      />

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search store name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
          />
        </form>
      </div>

      {/* Store Outlets Grid */}
      <StoreCardGrid
        stores={stores}
        loading={loading}
        onToggleActive={handleToggleActive}
        onEdit={handleOpenEditModal}
      />

      <StoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingStore={editingStore}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveStore}
        saving={saving}
      />
    </div>
  );
};
