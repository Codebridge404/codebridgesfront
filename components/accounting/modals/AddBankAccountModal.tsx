'use client';

import React, { useState } from 'react';
import { X, Landmark, Loader2, CheckCircle2 } from 'lucide-react';
import { createBankAccountApi } from '@/lib/api';

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBankAccountModal({ isOpen, onClose, onSuccess }: AddBankAccountModalProps) {
  const [bankName, setBankName] = useState('ABA Bank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !accountNumber.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setSaving(true);
      await createBankAccountApi({
        bank_name: bankName,
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        currency,
        status: 'active',
      });
      setAccountName('');
      setAccountNumber('');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create bank account');
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
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Add Bank Account</h3>
              <p className="text-[11px] text-slate-500 font-medium">Link treasury or merchant depository account</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Financial Institution *</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="ABA Bank">ABA Bank</option>
              <option value="Canadia Bank">Canadia Bank</option>
              <option value="Acleda Bank">Acleda Bank</option>
              <option value="Wing Bank">Wing Bank</option>
              <option value="Sathapana Bank">Sathapana Bank</option>
              <option value="Bakong Central Treasury">Bakong Central Treasury</option>
              <option value="Cash Vault / Physical Drawer">Cash Vault / Drawer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Freshmart Retail Ops Co."
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Number / IBAN *</label>
            <input
              type="text"
              required
              placeholder="e.g. 001 234 567"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'border-brand bg-brand-subtle text-brand shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('KHR')}
                className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  currency === 'KHR'
                    ? 'border-brand bg-brand-subtle text-brand shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                KHR (៛)
              </button>
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
              disabled={saving || !accountName.trim() || !accountNumber.trim()}
              className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Bank Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBankAccountModal;
