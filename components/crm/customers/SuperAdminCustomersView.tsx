/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Customer Store Credit & Tax Invoice Invoicing (BD-0137)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Gift,
} from 'lucide-react';
import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
} from '@/lib/api';
import { CustomerModal } from './CustomerModal';
import { CustomerMetricsCards } from './CustomerMetricsCards';
import { CustomerCardGrid } from './CustomerCardGrid';
import { CustomerCreditTopupModal } from './CustomerCreditTopupModal';
import { VoucherRedeemModal } from './VoucherRedeemModal';

export const SuperAdminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [topupCustomer, setTopupCustomer] = useState<any | null>(null);
  const [voucherCustomer, setVoucherCustomer] = useState<any | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    loyalty_points: '0',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomersApi(search || undefined);
      setCustomers(res.data || []);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      loyalty_points: '0',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      loyalty_points: (customer.loyalty_points || 0).toString(),
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        loyalty_points: parseInt(formData.loyalty_points, 10) || 0,
      };

      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, payload);
        setNotification({
          type: 'success',
          message: `Customer "${formData.name}" updated successfully.`,
        });
      } else {
        await createCustomerApi(payload);
        setNotification({
          type: 'success',
          message: `Customer "${formData.name}" registered successfully.`,
        });
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save customer.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (!window.confirm(`Are you sure you want to remove customer "${customer.name}"?`)) {
      return;
    }
    try {
      await deleteCustomerApi(customer.id);
      setNotification({
        type: 'success',
        message: `Customer "${customer.name}" removed.`,
      });
      loadCustomers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete customer.',
      });
    }
  };

  // Metrics
  const totalCustomers = customers.length;
  const totalPointsBalance = customers.reduce(
    (sum, c) => sum + (c.loyalty_points || 0),
    0
  );
  const pointsLiabilityUSD = Number((totalPointsBalance / 100).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" />
            Customer Relationship Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage customer directories, store credit pre-payment invoices, gift vouchers, and loyalty points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setVoucherCustomer(null);
              setIsVoucherModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Redeem digital gift voucher"
          >
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Redeem Voucher</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Register Customer
          </motion.button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <CustomerMetricsCards
        totalCustomers={totalCustomers}
        totalPointsBalance={totalPointsBalance}
        pointsLiabilityUSD={pointsLiabilityUSD}
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
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
          />
        </form>
      </div>

      {/* Customers Grid */}
      <CustomerCardGrid
        customers={customers}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteCustomer}
        onTopupCredit={(cust) => setTopupCustomer(cust)}
        onRedeemVoucher={(cust) => setVoucherCustomer(cust)}
      />

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCustomer={editingCustomer}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveCustomer}
        saving={saving}
      />

      {/* Customer Store Credit Prepayment Tax Invoice Modal */}
      {topupCustomer && (
        <CustomerCreditTopupModal
          isOpen={Boolean(topupCustomer)}
          onClose={() => setTopupCustomer(null)}
          customer={topupCustomer}
          onSuccess={loadCustomers}
        />
      )}

      {/* Digital Voucher Redemption Modal */}
      <VoucherRedeemModal
        isOpen={isVoucherModalOpen || Boolean(voucherCustomer)}
        onClose={() => {
          setIsVoucherModalOpen(false);
          setVoucherCustomer(null);
        }}
        customerId={voucherCustomer?.id}
        customerName={voucherCustomer?.name}
        customers={customers}
        onRedeemSuccess={loadCustomers}
      />
    </div>
  );
};
