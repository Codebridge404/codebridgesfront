'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AccountingTabPanels } from './dashboard';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import {
  getBankAccountsApi,
  getExpensesApi,
  getIncomesApi,
  getReconciliationExceptionsApi,
  getUsersApi,
} from '@/lib/api';
import { AddBankAccountModal } from './modals/AddBankAccountModal';
import { AddIncomeExpenseModal } from './modals/AddIncomeExpenseModal';

function AccountingManagementViewContent({ initialTab }: { initialTab?: string } = {}) {
  const searchParams = useSearchParams();
  const currentTab = initialTab || searchParams?.get('tab') || 'overview';

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [reconciliationStats, setReconciliationStats] = useState({
    resolved: 0,
    pending: 0,
    discrepancy: 0,
  });
  const [loadingRecon, setLoadingRecon] = useState(true);
  const [journalVouchersCount, setJournalVouchersCount] = useState(0);

  const [staffCounts, setStaffCounts] = useState({
    accountants: 0,
    clerks: 0,
    auditors: 0,
  });
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');

  const loadData = async () => {
    try {
      setLoadingAccounts(true);
      const [bankRes, reconRes, expRes, incRes, usersRes] = await Promise.allSettled([
        getBankAccountsApi(),
        getReconciliationExceptionsApi(),
        getExpensesApi(),
        getIncomesApi(),
        getUsersApi(),
      ]);

      if (bankRes.status === 'fulfilled') {
        const list = Array.isArray(bankRes.value)
          ? bankRes.value
          : bankRes.value?.data || [];
        setBankAccounts(list);
      }

      if (reconRes.status === 'fulfilled' && reconRes.value) {
        const d = reconRes.value;
        setReconciliationStats({
          resolved: Number(d.resolved_count ?? d.matched ?? 0),
          pending: Number(d.pending_count ?? d.unresolved ?? 0),
          discrepancy: Number(d.variance_total ?? d.discrepancy ?? 0.0),
        });
      }

      let count = 0;
      if (expRes.status === 'fulfilled') {
        const expList = Array.isArray(expRes.value) ? expRes.value : expRes.value?.data || [];
        count += expList.length;
      }
      if (incRes.status === 'fulfilled') {
        const incList = Array.isArray(incRes.value) ? incRes.value : incRes.value?.data || [];
        count += incList.length;
      }
      setJournalVouchersCount(count);

      if (usersRes.status === 'fulfilled') {
        const uList = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value?.data || [];
        let accountants = 0;
        let clerks = 0;
        let auditors = 0;

        uList.forEach((u: any) => {
          const r = (u.role || u.role_name || '').toLowerCase();
          if (r.includes('accountant') || r.includes('finance') || r.includes('cfo')) accountants++;
          else if (r.includes('clerk') || r.includes('cashier')) clerks++;
          else if (r.includes('audit') || r.includes('admin') || r.includes('director')) auditors++;
        });

        setStaffCounts({
          accountants,
          clerks,
          auditors,
        });
      }
    } catch (err) {
      console.error('Failed to load accounting overview metrics:', err);
    } finally {
      setLoadingAccounts(false);
      setLoadingRecon(false);
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTab]);

  return (
    <div className="space-y-3 w-full font-sans pb-6 text-slate-900 select-none">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-brand via-brand-hover to-brand-active rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Double-Entry Ledgers &amp; Cash Flow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Accounting &amp; Financial Operations
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed max-w-2xl">
            Double-entry general ledger, Accounts Receivable (AR), Accounts Payable (AP), bank reconciliations, and P&amp;L statements.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setModalType('expense');
              setIsEntryModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white text-brand font-extrabold text-xs shadow-sm hover:bg-brand-subtle transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-brand" />
            <span>Record Expense</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setModalType('income');
              setIsEntryModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Income</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBankModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Panel Rendering */}
      <AccountingTabPanels
        currentTab={currentTab}
        bankAccounts={bankAccounts}
        loadingAccounts={loadingAccounts}
        reconciliationStats={reconciliationStats}
        loadingRecon={loadingRecon}
        journalVouchersCount={journalVouchersCount}
        staffCounts={staffCounts}
        loadingStaff={loadingStaff}
        settingsSaved={settingsSaved}
        setSettingsSaved={setSettingsSaved}
      />

      {/* Modals */}
      <AddBankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSuccess={loadData}
      />

      <AddIncomeExpenseModal
        isOpen={isEntryModalOpen}
        defaultType={modalType}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export function AccountingManagementView(props: { initialTab?: string } = {}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
          <span>Loading financial ledger...</span>
        </div>
      }
    >
      <AccountingManagementViewContent {...props} />
    </Suspense>
  );
}

export default AccountingManagementView;
