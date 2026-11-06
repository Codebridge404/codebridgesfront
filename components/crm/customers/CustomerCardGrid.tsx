/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Customer Store Credit & Tax Invoice Actions (BD-0137)
 */
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Users, Award, Phone, Mail, Trash2, Edit3, Wallet, Receipt, Gift, FileText } from 'lucide-react';

interface CustomerCardGridProps {
  customers: any[];
  loading: boolean;
  onEdit: (customer: any) => void;
  onDelete: (customer: any) => void;
  onTopupCredit?: (customer: any) => void;
  onRedeemVoucher?: (customer: any) => void;
  onViewStatement?: (customer: any) => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' as const },
  }),
};

export const CustomerCardGrid: React.FC<CustomerCardGridProps> = ({
  customers,
  loading,
  onEdit,
  onDelete,
  onTopupCredit,
  onRedeemVoucher,
  onViewStatement,
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-medium">
        Loading customer directory...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
        <Users className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">No registered customers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((cust, idx) => {
        const creditBalance = parseFloat(cust.store_credit || cust.store_credit_balance || '0');

        return (
          <motion.div
            key={cust.id}
            custom={idx}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center font-bold text-sm">
                    {cust.name ? cust.name[0] : 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cust.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">ID #{cust.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                    <Award className="w-3 h-3 text-amber-500" />
                    {cust.loyalty_points || 0} pts
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                    <Wallet className="w-3 h-3 text-purple-600" />
                    ${creditBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                {cust.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.phone}</span>
                  </p>
                )}
                {cust.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{cust.email}</span>
                  </p>
                )}
                {cust.address && (
                  <p className="text-slate-400 text-[11px] line-clamp-1">{cust.address}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {onTopupCredit && (
                  <button
                    type="button"
                    onClick={() => onTopupCredit(cust)}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-purple-200 shadow-2xs"
                    title="Prepay Store Credit & Issue Tax Invoice"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Top-Up</span>
                  </button>
                )}
                {onViewStatement && (
                  <button
                    type="button"
                    onClick={() => onViewStatement(cust)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                    title="View Store Credit Statement"
                  >
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>Statement</span>
                  </button>
                )}
                {onRedeemVoucher && (
                  <button
                    type="button"
                    onClick={() => onRedeemVoucher(cust)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-amber-200 shadow-2xs"
                    title="Redeem Gift Voucher"
                  >
                    <Gift className="w-3 h-3" />
                    <span>Voucher</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDelete(cust)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Customer Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(cust)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
