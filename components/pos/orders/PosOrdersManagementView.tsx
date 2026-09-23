'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthUser,
  getActiveShiftApi,
  getSalesListApi,
  getReceiptApi,
} from '@/lib/api';
import { PosOrdersFilterBar } from './PosOrdersFilterBar';
import { PosOrdersTable } from './PosOrdersTable';
import { ThermalReceiptModal } from '@/components/receipt/ThermalReceiptModal';
import { SalesReturnModal } from '@/components/returns/SalesReturnModal';

export function PosOrdersManagementView() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTender, setFilterTender] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadOrdersData();
  }, [router]);

  const loadOrdersData = async () => {
    try {
      setLoading(true);
      const shiftRes = await getActiveShiftApi();
      if (shiftRes.data?.shift) {
        setActiveShift(shiftRes.data.shift);
      }

      try {
        const salesRes = await getSalesListApi();
        const salesList = salesRes.data || salesRes || [];
        setTransactions(Array.isArray(salesList) ? salesList : []);
      } catch {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReprintReceipt = async (transaction: any) => {
    try {
      if (transaction.invoice_number) {
        const res = await getReceiptApi(transaction.invoice_number);
        setCompletedSale(res.data?.sale || res.sale || transaction);
      } else {
        setCompletedSale(transaction);
      }
    } catch {
      setCompletedSale(transaction);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const tenderMatch =
      filterTender === 'all' ||
      (tx.payment_method || tx.tender_type || 'cash').toLowerCase() === filterTender.toLowerCase();

    const searchMatch =
      !searchQuery ||
      tx.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.receipt_number?.toLowerCase().includes(searchQuery.toLowerCase());

    return tenderMatch && searchMatch;
  });

  return (
    <div className="space-y-3 w-full font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders &amp; Receipts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Search completed checkout transactions, re-print thermal receipts, and initiate customer returns
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-subtle text-brand border border-brand/20 w-fit">
          {filteredTransactions.length} Transactions
        </span>
      </div>

      <PosOrdersFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTender={filterTender}
        onFilterTenderChange={setFilterTender}
        onOpenReturnModal={() => setShowReturnModal(true)}
      />

      <PosOrdersTable
        transactions={filteredTransactions}
        loading={loading}
        onReprintReceipt={handleReprintReceipt}
      />

      {/* Modals */}
      {completedSale && (
        <ThermalReceiptModal
          isOpen={Boolean(completedSale)}
          onClose={() => setCompletedSale(null)}
          saleData={completedSale}
        />
      )}

      <SalesReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onReturnProcessed={() => {
          setShowReturnModal(false);
          loadOrdersData();
        }}
      />
    </div>
  );
}
