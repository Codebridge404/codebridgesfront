'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Check, Star, Wallet, Loader2, User, QrCode } from 'lucide-react';
import { getCustomersApi, createCustomerApi } from '@/lib/api';
import { PosCustomer } from './usePosCustomerAndTable';
import { PosLoyaltyQrScannerModal } from './PosLoyaltyQrScannerModal';

interface PosCustomerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: PosCustomer | null;
  onSelectCustomer: (customer: PosCustomer | null) => void;
}

export function PosCustomerSelectorModal({
  isOpen,
  onClose,
  selectedCustomer,
  onSelectCustomer,
}: PosCustomerSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadCustomers(search);
  }, [isOpen, search]);

  const loadCustomers = async (q: string) => {
    try {
      setLoading(true);
      const res = await getCustomersApi(q.trim() || undefined);
      const list = Array.isArray(res) ? res : res?.data || [];
      setCustomers(list);
    } catch (err) {
      console.warn('Could not search customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setSaving(true);
      const res = await createCustomerApi({
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
      });
      const created = res?.data || res;
      if (created) {
        onSelectCustomer(created);
        setIsAddingNew(false);
        setNewName('');
        setNewPhone('');
        onClose();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Select Order Customer</h3>
              <p className="text-[11px] text-slate-500 font-medium">Link customer to earn loyalty points or spend credit</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Search bar + New Customer Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name or phone..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => setShowQrScanner(true)}
              className="px-3 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Scan Customer VIP Loyalty Card with WebCam"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan VIP QR</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                isAddingNew
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-brand text-white border-brand shadow-xs hover:bg-brand-hover'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'Search List' : 'Quick Add'}</span>
            </button>
          </div>

          {/* Quick Add Form */}
          {isAddingNew ? (
            <form onSubmit={handleCreateCustomer} className="p-4 rounded-2xl bg-brand-subtle/40 border border-brand/20 space-y-3">
              <h4 className="font-extrabold text-xs text-brand">Register New Customer</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sophy Seng"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 012 345 678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newName.trim()}
                  className="px-4 py-1 rounded-lg bg-brand text-white font-black text-xs shadow-xs hover:bg-brand-hover disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Save &amp; Attach</span>
                </button>
              </div>
            </form>
          ) : (
            /* Customer Search Results */
            <div className="space-y-1.5">
              {/* Option to clear customer (revert to Walk-in) */}
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectCustomer(null);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-left transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-rose-700">Revert to Anonymous Walk-in Customer</span>
                  <X className="w-3.5 h-3.5 text-rose-500" />
                </button>
              )}

              {loading ? (
                <div className="py-8 text-center text-slate-400 font-medium text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                  <span>Searching customers...</span>
                </div>
              ) : customers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-bold text-slate-600">No matching customers found</p>
                  <p className="text-[11px]">Click "Quick Add" above to register this customer.</p>
                </div>
              ) : (
                customers.map((c) => {
                  const isSelected = selectedCustomer?.id === c.id;
                  const points = Number(c.loyalty_points || 0);
                  const credit = Number(c.store_credit || 0);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCustomer(c);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-brand bg-brand-subtle/80 ring-2 ring-brand/20 shadow-2xs'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 truncate">{c.name}</span>
                          {c.phone && <span className="font-mono text-[10px] text-slate-500 font-bold">{c.phone}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {points} pts
                          </span>
                          {credit > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-mono">
                              <Wallet className="w-3 h-3 text-emerald-500" />
                              ${credit.toFixed(2)} credit
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <PosLoyaltyQrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onSelectCustomer={(customer) => {
          onSelectCustomer(customer);
          setShowQrScanner(false);
          onClose();
        }}
      />
    </div>
  );
}
