'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CreateOrgModal, TenantDetailDrawer, ImpersonateModal } from '@/components/tenant';
import { ConfirmDialog } from '@/components/common';
import { Tenant } from './types';
import { useTenantsManager } from './useTenantsManager';
import { TenantFilterBar } from './TenantFilterBar';
import { TenantTable } from './TenantTable';
import { EditTenantModal } from './EditTenantModal';

export function SuperAdminTenantsView() {
  const m = useTenantsManager();

  return (
    <div className="space-y-3 w-full font-sans pb-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {m.notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-sm ${
              m.notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {m.notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {m.notification.message}
            </div>
            <button
              type="button"
              onClick={() => {}}
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Metric Bar */}
      <TenantFilterBar
        stats={m.stats}
        loading={m.loading}
        search={m.search}
        setSearch={m.setSearch}
        filterTier={m.filterTier}
        setFilterTier={m.setFilterTier}
        filterStatus={m.filterStatus}
        setFilterStatus={m.setFilterStatus}
        onRefresh={m.loadTenants}
        onOpenCreateModal={() => m.setShowCreateModal(true)}
      />

      {/* Tenants Table */}
      <TenantTable
        tenants={m.tenants}
        loading={m.loading}
        onOpenCreateModal={() => m.setShowCreateModal(true)}
        onOpenDrawer={(tenant: Tenant) => m.setDrawerTenant(tenant)}
        onOpenImpersonate={(tenant: Tenant) => m.setImpersonateTenant(tenant)}
        onOpenEdit={(tenant: Tenant, e: React.MouseEvent) => m.handleOpenEditModal(tenant, e)}
        onOpenSub={(tenant: Tenant, e: React.MouseEvent) => {
          e.stopPropagation();
          m.setSelectedTenant(tenant);
          m.setShowSubModal(true);
        }}
        onToggleSuspend={(tenant: Tenant, e: React.MouseEvent) => m.handleSuspendToggle(tenant, e)}
        onDelete={(tenant: Tenant, e: React.MouseEvent) => m.handleDeleteTenant(tenant, e)}
      />

      {/* Create Tenant Modal */}
      <CreateOrgModal
        isOpen={m.showCreateModal}
        onClose={() => m.setShowCreateModal(false)}
        onOrgCreated={() => {
          m.setShowCreateModal(false);
          m.loadTenants();
        }}
      />

      {/* Edit Tenant & Owner Modal */}
      <EditTenantModal
        isOpen={m.showEditModal}
        onClose={() => m.setShowEditModal(false)}
        selectedTenant={m.selectedTenant}
        editForm={m.editForm}
        setEditForm={m.setEditForm}
        onSubmit={m.handleSaveEditTenant}
        actionLoading={m.actionLoading}
      />

      {/* Tenant Detail & Module Drawer */}
      <TenantDetailDrawer
        isOpen={Boolean(m.drawerTenant)}
        onClose={() => m.setDrawerTenant(null)}
        tenant={m.drawerTenant}
        onEditQuotas={(tenant: any) => m.handleOpenEditModal(tenant)}
        onImpersonate={(tenant: any) => m.setImpersonateTenant(tenant)}
      />

      {/* Impersonate Modal */}
      <ImpersonateModal
        isOpen={Boolean(m.impersonateTenant)}
        onClose={() => m.setImpersonateTenant(null)}
        tenant={m.impersonateTenant}
        onConfirm={m.handleStartImpersonate}
      />

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={m.confirmModal.isOpen}
        title={m.confirmModal.title}
        description={m.confirmModal.description}
        variant={m.confirmModal.variant}
        confirmText={m.confirmModal.confirmText}
        requireTypingMatch={m.confirmModal.requireTypingMatch}
        details={m.confirmModal.details}
        onConfirm={m.confirmModal.onConfirm}
        onClose={() => m.setConfirmModal((prev: any) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
