/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Promotional Digital Voucher Studio & Issuance (BD-0148)
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  RefreshCw,
  Ticket,
  CheckCircle2,
  Copy,
  Calendar,
  DollarSign,
  Layers,
  Search,
  Sparkles,
  Tag,
  Clock,
  X,
} from 'lucide-react';
import {
  getGiftCardsApi,
  createGiftCardApi,
  getDigitalVouchersApi,
  issueDigitalVoucherApi,
} from '@/lib/api';
import { useToast } from '@/components/common';

export const SuperAdminGiftCardsView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'cards' | 'vouchers'>('cards');
  const [cards, setCards] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gift Card Modal
  const [showCardModal, setShowCardModal] = useState(false);
  const [customer, setCustomer] = useState('');
  const [balance, setBalance] = useState('50.00');

  // Digital Voucher Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherTitle, setVoucherTitle] = useState('Promotional Customer Gift Voucher');
  const [voucherValue, setVoucherValue] = useState('25.00');
  const [validityDays, setValidityDays] = useState('90');
  const [voucherNotes, setVoucherNotes] = useState('');
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'cards') {
        const res = await getGiftCardsApi();
        setCards(res.data || []);
      } else {
        const res = await getDigitalVouchersApi();
        setVouchers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGiftCardApi({
        customer: customer || 'Walk-in Customer',
        balance: parseFloat(balance) || 50,
      });
      setShowCardModal(false);
      setCustomer('');
      toast.success('Gift card issued successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue gift card');
    }
  };

  const handleIssueVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingVoucher(true);
      const res = await issueDigitalVoucherApi({
        value: parseFloat(voucherValue) || 25,
        title: voucherTitle.trim() || 'Promotional Customer Voucher',
        validity_days: parseInt(validityDays, 10) || 90,
        notes: voucherNotes.trim() || undefined,
      });

      if (res?.status === 'success' || res?.data) {
        toast.success(`Digital voucher ${res.data?.voucher_code || ''} generated successfully!`);
        setShowVoucherModal(false);
        setVoucherNotes('');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue promotional voucher.');
    } finally {
      setSubmittingVoucher(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Voucher code ${code} copied to clipboard!`);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-pink-500" />
            Gift Cards &amp; Store Credit Vouchers Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue physical gift cards, promotional coupon vouchers, and manage prepaid customer balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'cards' ? (
            <button
              onClick={() => setShowCardModal(true)}
              className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue Gift Card
            </button>
          ) : (
            <button
              onClick={() => setShowVoucherModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue Digital Voucher
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-pink-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Gift Cards ({cards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vouchers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Digital Promotional Vouchers ({vouchers.length})</span>
        </button>
      </div>

      {/* Table: Gift Cards */}
      {activeTab === 'cards' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Card Number</th>
                <th className="py-3 px-4">Assigned Customer</th>
                <th className="py-3 px-4">Remaining Balance ($)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-1 text-pink-500" />
                    Loading gift cards...
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                    No gift cards issued yet.
                  </td>
                </tr>
              ) : (
                cards.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{c.card_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{c.customer}</td>
                    <td className="py-3.5 px-4 font-mono font-black text-pink-600 text-sm">
                      ${Number(c.balance).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table: Digital Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher Promo Code</th>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Face Value</th>
                <th className="py-3 px-4">Validity / Expiry</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-1 text-indigo-600" />
                    Loading digital vouchers...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No promotional vouchers issued yet. Click &quot;Issue Digital Voucher&quot; to generate promotional codes.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const isRedeemed = v.status === 'redeemed';
                  const isExpired = v.status === 'expired';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-indigo-700 text-xs px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200">
                            {v.voucher_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(v.voucher_code)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                            title="Copy Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {v.title || 'Customer Gift Voucher'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-600 text-sm">
                        ${Number(v.value || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {v.expires_at ? new Date(v.expires_at).toLocaleDateString() : 'No Expiry'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isRedeemed
                              ? 'bg-slate-100 text-slate-600'
                              : isExpired
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {v.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Gift Card Issue Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Issue Gift Card</h3>
              <button onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGiftCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Balance ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-pink-500 font-bold text-white shadow-md hover:bg-pink-600"
                >
                  Confirm &amp; Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Voucher Issue Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Issue Promotional Voucher</h3>
                  <p className="text-[11px] text-slate-500">Generate unique coupon code with store credit value</p>
                </div>
              </div>
              <button onClick={() => setShowVoucherModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={voucherTitle}
                  onChange={(e) => setVoucherTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Face Value ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={voucherValue}
                    onChange={(e) => setVoucherValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    required
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes / Terms</label>
                <input
                  type="text"
                  placeholder="Optional conditions (e.g. Min spend $50)"
                  value={voucherNotes}
                  onChange={(e) => setVoucherNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVoucher}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 font-bold text-white shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  {submittingVoucher && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submittingVoucher ? 'Generating...' : 'Issue Voucher'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
