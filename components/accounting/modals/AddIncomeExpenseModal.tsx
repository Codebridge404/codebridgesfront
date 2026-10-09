'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import { createExpenseApi, createIncomeApi } from '@/lib/api';

interface AddIncomeExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'expense' | 'income';
}

export function AddIncomeExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'expense',
}: AddIncomeExpenseModalProps) {
  const [entryType, setEntryType] = useState<'expense' | 'income'>(defaultType);
  const [category, setCategory] = useState(defaultType === 'expense' ? 'Rent & Utilities' : 'Consulting / Sales');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please fill out all required fields with a valid amount.');
      return;
    }

    try {
      setSaving(true);
      if (entryType === 'expense') {
        await createExpenseApi({
          category,
          description: description.trim(),
          amount: numAmount,
          date_paid: date,
        });
      } else {
        await createIncomeApi({
          source: category,
          description: description.trim(),
          amount: numAmount,
          date_received: date,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to record ledger entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs text-white ${
              entryType === 'expense' ? 'bg-rose-500' : 'bg-emerald-600'
            }`}>
              {entryType === 'expense' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                {entryType === 'expense' ? 'Record General Expense' : 'Record Operating Income'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Post journal voucher to general ledger</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => {
                setEntryType('expense');
                setCategory('Rent & Utilities');
              }}
              className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                entryType === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Expense (Debit)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryType('income');
                setCategory('Consulting / Sales');
              }}
              className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                entryType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income (Credit)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {entryType === 'expense' ? 'Expense Category *' : 'Income Source *'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {entryType === 'expense' ? (
                <>
                  <option value="Rent & Utilities">Rent &amp; Utilities</option>
                  <option value="Salaries & Payroll">Salaries &amp; Payroll</option>
                  <option value="Office & Store Supplies">Office &amp; Store Supplies</option>
                  <option value="Marketing & Advertising">Marketing &amp; Advertising</option>
                  <option value="Hardware & Software Maintenance">Hardware &amp; Maintenance</option>
                  <option value="Logistics & Delivery">Logistics &amp; Delivery</option>
                  <option value="Other Operating Expense">Other Operating Expense</option>
                </>
              ) : (
                <>
                  <option value="Consulting / Sales">Consulting &amp; Direct Sales</option>
                  <option value="Service Fees">Service Fees &amp; Retainers</option>
                  <option value="Interest & Treasury Dividends">Interest &amp; Dividends</option>
                  <option value="Sublease & Rental">Sublease &amp; Rental</option>
                  <option value="Miscellaneous Revenue">Miscellaneous Revenue</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Memo *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly electricity bill for Main Store"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($) *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !description.trim() || !amount}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                entryType === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Post Ledger Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddIncomeExpenseModal;
