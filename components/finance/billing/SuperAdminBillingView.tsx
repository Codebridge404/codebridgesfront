'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, RefreshCw } from 'lucide-react';
import { getSubscriptionPlansApi } from '@/lib/api';
import { SubscriptionPlan } from './types';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';

export function SuperAdminBillingView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const res = await getSubscriptionPlansApi();
        if (res && res.data) {
          setPlans(res.data);
        }
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand/20 shadow-2xs flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Bill-Subscription
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Subscriber Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage multi-tenant subscription tiers, storage quotas, subscriber entitlements, and recurring billing cycles.
            </p>
          </div>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-black">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-white text-brand shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              billingPeriod === 'annual'
                ? 'bg-white text-brand shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Annual (2 Mo Free)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-brand-subtle text-brand text-[9px] font-bold border border-brand/20">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading dynamic subscription tiers from cloud database...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/90 p-8 space-y-2">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No Subscription Tiers Found</h3>
          <p className="text-xs text-slate-500">Platform subscription tiers are not currently configured in database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              onConfigure={(name) => showToast(`Plan configuration opened for "${name}".`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
