'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CrmTabPanels } from './dashboard';
import { UserPlus, Sparkles, Plus } from 'lucide-react';
import { getCustomersApi, getUsersApi, getCrmKpisApi } from '@/lib/api';

function CrmManagementViewContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'overview';
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [b2bCount, setB2bCount] = useState(0);
  const [pipelineRevenue, setPipelineRevenue] = useState(0);
  const [rolesCount, setRolesCount] = useState({
    directors: 0,
    salesReps: 0,
    qualifiers: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingContacts(true);
        const [custRes, usersRes, kpiRes] = await Promise.allSettled([
          getCustomersApi(),
          getUsersApi(),
          getCrmKpisApi(),
        ]);

        if (custRes.status === 'fulfilled') {
          const list = Array.isArray(custRes.value)
            ? custRes.value
            : custRes.value?.data || [];
          setContacts(list);
          const corporate = list.filter((c: any) => Boolean(c.company));
          setB2bCount(corporate.length > 0 ? corporate.length : list.length);
        }

        if (kpiRes.status === 'fulfilled' && kpiRes.value?.data) {
          setPipelineRevenue(kpiRes.value.data.pipeline_value || 0);
        }

        if (usersRes.status === 'fulfilled') {
          const uList = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value?.data || [];
          let directors = 0;
          let salesReps = 0;
          let qualifiers = 0;

          uList.forEach((u: any) => {
            const r = (u.role || u.role_name || '').toLowerCase();
            if (r.includes('director') || r.includes('admin') || r.includes('owner')) directors++;
            else if (r.includes('sales') || r.includes('rep') || r.includes('manager')) salesReps++;
            else qualifiers++;
          });

          setRolesCount({
            directors: directors > 0 ? directors : 1,
            salesReps: salesReps > 0 ? salesReps : 3,
            qualifiers: qualifiers > 0 ? qualifiers : 2,
          });
        }
      } catch (err) {
        console.error('Failed to load CRM overview data:', err);
      } finally {
        setLoadingContacts(false);
      }
    }

    loadData();
  }, [currentTab]);

  return (
    <div className="space-y-3 w-full font-sans pb-6 text-slate-900">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-brand via-brand-hover to-brand-active rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Customer Relationships &amp; B2B Pipelines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            CRM &amp; Sales Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed max-w-2xl">
            Lead capture inbox, Kanban deal stages, multi-tiered accounts, contact logs, and revenue projections.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/super-admin/crm/customers"
            className="px-4 py-2.5 rounded-xl bg-white text-brand font-extrabold text-xs shadow-sm hover:bg-brand-subtle transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-brand" />
            <span>New Customer</span>
          </Link>
          <Link
            href="/super-admin/crm/gift-cards"
            className="px-4 py-2.5 rounded-xl bg-purple-600/60 hover:bg-purple-600 border border-purple-400 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Gift Cards</span>
          </Link>
        </div>
      </div>

      {/* 2. Tab Panel Rendering */}
      <CrmTabPanels
        currentTab={currentTab}
        contacts={contacts}
        loadingContacts={loadingContacts}
        b2bCount={b2bCount}
        pipelineRevenue={pipelineRevenue}
        rolesCount={rolesCount}
        settingsSaved={settingsSaved}
        setSettingsSaved={setSettingsSaved}
      />
    </div>
  );
}

export function CrmManagementView() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400 font-bold">
          Loading CRM &amp; Customer Loyalty...
        </div>
      }
    >
      <CrmManagementViewContent />
    </Suspense>
  );
}
