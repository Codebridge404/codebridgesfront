'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscriptionPlansApi } from '@/lib/api';
import { SubscriptionPlan } from '@/components/finance/billing/types';
import { AppIcons } from '@/components/ui/icons';
import { modalBackdrop, modalContent } from '@/lib/animations';
import { buttonStyles } from '@/lib/theme';
import { SubscriptionCapacityTab } from './subscription-hub/SubscriptionCapacityTab';
import { SubscriptionPlansTab } from './subscription-hub/SubscriptionPlansTab';
import { SubscriptionInvoicesTab } from './subscription-hub/SubscriptionInvoicesTab';

interface SubscriptionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  activeOrgName?: string;
}

export function SubscriptionHubModal({
  isOpen,
  onClose,
  user,
  activeOrgName,
}: SubscriptionHubModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'quotas' | 'plans' | 'invoices'>('quotas');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadPlans() {
      setLoading(true);
      try {
        const res = await getSubscriptionPlansApi();
        const data = Array.isArray(res) ? res : res?.data || [];
        if (isMounted) setPlans(data);
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlanName = user?.subscription_tier || user?.plan || 'Professional Tier';
  const currentPlan =
    plans.find(
      (p) => p.name.toLowerCase() === currentPlanName.toLowerCase() || p.id === 'pro'
    ) || plans[1] || plans[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md">
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute inset-0"
          onClick={onClose}
        />

        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden backdrop-blur-2xl bg-white/85 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl shadow-2xl"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/20">
                <AppIcons.Billing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Subscription &amp; Quotas</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand border border-brand/20 text-[10px] font-bold backdrop-blur-md">
                    {activeOrgName || 'Active Workspace'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Google One-style cloud capacity, subscriber quotas, and billing
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={buttonStyles.icon}
            >
              <AppIcons.Close className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 text-xs font-bold text-slate-500 shrink-0 bg-white/20 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setActiveTab('quotas')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'quotas'
                  ? 'border-brand text-brand'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Capacity &amp; Quotas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'plans'
                  ? 'border-brand text-brand'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Upgrade Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'invoices'
                  ? 'border-brand text-brand'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Invoices &amp; Receipts
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <AppIcons.Loading className="w-8 h-8 text-brand animate-spin" />
                <p className="text-xs font-bold text-slate-500">Syncing subscription quotas with cloud database...</p>
              </div>
            ) : activeTab === 'quotas' ? (
              <SubscriptionCapacityTab
                currentPlan={currentPlan}
                onNavigateToPlans={() => setActiveTab('plans')}
              />
            ) : activeTab === 'plans' ? (
              <SubscriptionPlansTab
                plans={plans}
                currentPlan={currentPlan}
                billingPeriod={billingPeriod}
                onToggleBillingPeriod={setBillingPeriod}
              />
            ) : (
              <SubscriptionInvoicesTab />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
