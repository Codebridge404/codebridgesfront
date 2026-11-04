/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Customer Store Credit Prepayment & Official Tax Invoice (BD-0137)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
  DollarSign,
  Printer,
  QrCode,
  CreditCard,
  Building2,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { topupCustomerCreditInvoiceApi, TopUpStoreCreditPayload } from '@/lib/api/tenants';
import { useToast } from '@/components/common';

interface CustomerCreditTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [20, 50, 100, 200, 500];

export function CustomerCreditTopupModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: CustomerCreditTopupModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<string>('100');
  const [bonusCredit, setBonusCredit] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'khqr' | 'card' | 'bank_transfer'>('cash');
  const [customerTin, setCustomerTin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && customer) {
      setInvoiceResult(null);
      setAmount('100');
      setBonusCredit('0');
      setPaymentMethod('cash');
      setCustomerTin(customer.tax_number || '');
      setCompanyName(customer.company || customer.name || '');
      setNotes('');
    }
  }, [isOpen, customer]);

  if (!isOpen || !mounted) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const parsedBonus = parseFloat(bonusCredit) || 0;
  const totalCredited = parsedAmount + parsedBonus;

  // 10% VAT calculation
  const vatRate = 10;
  const taxAmount = roundToTwo((parsedAmount * vatRate) / (100 + vatRate));
  const subtotal = roundToTwo(parsedAmount - taxAmount);

  function roundToTwo(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      toast.error('Please enter a valid deposit amount.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: TopUpStoreCreditPayload = {
        amount_paid: parsedAmount,
        bonus_credit: parsedBonus > 0 ? parsedBonus : undefined,
        payment_method: paymentMethod,
        notes: notes ? `${notes} (TIN: ${customerTin || 'N/A'})` : `Prepayment Tax Invoice (TIN: ${customerTin || 'N/A'})`,
      };

      const res = await topupCustomerCreditInvoiceApi(customer.id, payload);
      if (res?.data || res?.status === 'success') {
        const invData = res.data || {};
        setInvoiceResult({
          ...invData,
          invoice_number: invData.invoice_number || `TAX-INV-${Date.now().toString().slice(-6)}`,
          customer_name: customer.name,
          customer_tin: customerTin || 'N/A',
          company_name: companyName || customer.name,
          amount_paid: parsedAmount,
          bonus_credit: parsedBonus,
          total_credited: totalCredited,
          tax_amount: taxAmount,
          subtotal: subtotal,
          payment_method: paymentMethod,
          issued_at: new Date().toISOString(),
        });
        toast.success(`Store credit +$${totalCredited.toFixed(2)} added & Tax Invoice generated!`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to issue store credit tax invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentBalance = parseFloat(customer?.store_credit || customer?.store_credit_balance || '0');

  const content = (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Store Credit Prepayment &amp; Tax Invoice
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {customer?.name} &bull; Current Balance: <span className="font-bold text-purple-700 font-mono">${currentBalance.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {invoiceResult ? (
            /* Printable Tax Invoice Display */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Deposit completed! Official Tax Invoice generated for corporate records.</span>
              </div>

              {/* Thermal Invoice Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <h4 className="font-black text-sm uppercase text-slate-900">CodeBridges ERP &amp; Retail</h4>
                  <p className="text-[10px] text-slate-500">Official Prepayment Tax Invoice (VAT 10%)</p>
                  <p className="text-[11px] font-bold text-slate-800 mt-1">{invoiceResult.invoice_number}</p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <strong className="text-slate-900">{invoiceResult.customer_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <strong className="text-slate-900">{invoiceResult.company_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT / TIN:</span>
                    <strong className="text-slate-900">{invoiceResult.customer_tin}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <strong className="uppercase text-indigo-700">{invoiceResult.payment_method}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Issued Date:</span>
                    <span>{new Date(invoiceResult.issued_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Prepayment Subtotal:</span>
                    <span>${invoiceResult.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT 10% (Included):</span>
                    <span>${invoiceResult.tax_amount.toFixed(2)}</span>
                  </div>
                  {invoiceResult.bonus_credit > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promotional Bonus:</span>
                      <span>+${invoiceResult.bonus_credit.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount Paid:</span>
                    <span>${invoiceResult.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-purple-700">
                    <span>New Wallet Balance:</span>
                    <span>${(currentBalance + invoiceResult.total_credited).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Topup Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Input & Preset Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Prepayment Deposit Amount ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-base font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    required
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        parsedAmount === val
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bonus Incentive */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bonus Store Credit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={bonusCredit}
                    onChange={(e) => setBonusCredit(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Credited to Wallet
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-black text-xs font-mono">
                    ${totalCredited.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('khqr')}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                      paymentMethod === 'khqr'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-rose-600" />
                    <span>KHQR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Bank</span>
                  </button>
                </div>
              </div>

              {/* Tax Invoice Details: TIN & Company */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer TIN / Tax No.
                  </label>
                  <input
                    type="text"
                    value={customerTin}
                    onChange={(e) => setCustomerTin(e.target.value)}
                    placeholder="e.g. K008-9021-3441"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Registered Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name for invoice..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Live VAT 10% Breakdown Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Prepayment Subtotal (Net of VAT):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT 10% Tax Itemization:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Due &amp; Invoiced:</span>
                  <span className="text-purple-700">${parsedAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || parsedAmount <= 0}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span>Generate Official Tax Invoice</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

