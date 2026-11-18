/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: BD-0153
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Users,
  Shield,
  Building2,
  Plus,
} from 'lucide-react';
import {
  getRolesApi,
  getPermissionsApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  getAuthUser,
} from '@/lib/api';
import { RoleItem, RolesListSidebar } from './RolesListSidebar';
import { RolePermissionsMatrix } from './RolePermissionsMatrix';
import { RoleModal } from './RoleModal';
import { useConfirm, useToast } from '@/components/common';

export const OrganizationRolesView: React.FC = () => {
  const confirm = useConfirm();
  const toast = useToast();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [orgName, setOrgName] = useState<string>('Primary Organization');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoleName, setModalRoleName] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalSelectedPerms, setModalSelectedPerms] = useState<string[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([getRolesApi(), getPermissionsApi()]);

      if ((rolesRes?.success || rolesRes?.status === 'success') && rolesRes?.data) {
        setRoles(rolesRes.data);
        if (rolesRes.data.length > 0 && !selectedRole) {
          setSelectedRole(rolesRes.data[0]);
        } else if (selectedRole) {
          const updated = rolesRes.data.find((r: RoleItem) => r.id === selectedRole.id);
          if (updated) setSelectedRole(updated);
        }
      }

      if (permsRes?.success || permsRes?.status === 'success') {
        setPermissions(permsRes.data || []);
        setGroupedPermissions(permsRes.grouped || {});
      }
    } catch (err) {
      console.error('Failed to load organization roles/permissions:', err);
      showNotification('error', 'Failed to load organization roles and permissions matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active =
        localStorage.getItem('active_org') ||
        localStorage.getItem('cb_active_org_name') ||
        getAuthUser()?.tenant_name ||
        getAuthUser()?.company_name ||
        'Primary Organization';
      setOrgName(active);
    }
    loadData();
  }, []);

  const broadcastRolesUpdated = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cb_roles_updated', { detail: { timestamp: Date.now() } }));
    }
  };

  const handleTogglePermission = (permId: string) => {
    if (!selectedRole) return;
    if (selectedRole.is_system) {
      toast.warning('System default roles are read-only templates. Clone or create a custom role to edit permissions.');
      return;
    }

    const currentPerms = selectedRole.permission_ids || [];
    const isAssigned = currentPerms.includes(permId);
    const updatedPermIds = isAssigned
      ? currentPerms.filter((id) => id !== permId)
      : [...currentPerms, permId];

    setSelectedRole({
      ...selectedRole,
      permission_ids: updatedPermIds,
      permissions_count: updatedPermIds.length,
    });
  };

  const handleSaveSelectedRolePermissions = async () => {
    if (!selectedRole) return;
    if (selectedRole.is_system) {
      toast.warning('System default roles are protected and cannot be modified.');
      return;
    }

    try {
      setSaving(true);
      const res = await updateRoleApi(selectedRole.id, { permission_ids: selectedRole.permission_ids });
      if (res.success || res.status === 'success') {
        showNotification('success', `Permissions updated for custom role "${selectedRole.name}".`);
        broadcastRolesUpdated();
        await loadData();
      } else {
        showNotification('error', res.message || 'Failed to update role permissions.');
      }
    } catch (err: any) {
      console.error('Error updating permissions:', err);
      showNotification('error', err?.message || 'An error occurred while saving role permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoleId(null);
    setModalRoleName('');
    setModalDescription('');
    setModalSelectedPerms([]);
    setIsModalOpen(true);
  };

  const handleCloneRole = (role: RoleItem) => {
    setEditingRoleId(null);
    setModalRoleName(`${role.name} (Custom)`);
    setModalDescription(role.description ? `Customized based on ${role.name}` : `Custom role based on ${role.name}`);
    setModalSelectedPerms(role.permission_ids ? [...role.permission_ids] : []);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleItem) => {
    if (role.is_system) {
      toast.warning('System default roles cannot be edited directly. Use "Clone as Custom Role" instead.');
      return;
    }
    setEditingRoleId(role.id);
    setModalRoleName(role.name);
    setModalDescription(role.description || '');
    setModalSelectedPerms(role.permission_ids || []);
    setIsModalOpen(true);
  };

  const handleSaveModalRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRoleName.trim()) {
      showNotification('error', 'Role name is required.');
      return;
    }

    try {
      setSaving(true);
      if (editingRoleId) {
        const res = await updateRoleApi(editingRoleId, {
          name: modalRoleName.trim(),
          description: modalDescription.trim(),
          permission_ids: modalSelectedPerms,
        });
        if (res.success || res.status === 'success') {
          showNotification('success', `Role "${modalRoleName}" updated successfully.`);
          setIsModalOpen(false);
          broadcastRolesUpdated();
          await loadData();
        } else {
          showNotification('error', res.message || 'Failed to update role.');
        }
      } else {
        const res = await createRoleApi({
          name: modalRoleName.trim(),
          description: modalDescription.trim(),
          permission_ids: modalSelectedPerms,
        });
        if (res.success || res.status === 'success') {
          showNotification('success', `Custom role "${modalRoleName}" created successfully.`);
          setIsModalOpen(false);
          broadcastRolesUpdated();
          await loadData();
        } else {
          showNotification('error', res.message || 'Failed to create custom role.');
        }
      }
    } catch (err: any) {
      console.error('Error saving role:', err);
      showNotification('error', err?.message || 'An error occurred while saving role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.is_system) {
      toast.warning('System default roles are protected and cannot be deleted.');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Custom Role',
      description: `Are you sure you want to permanently delete custom role "${role.name}"? Staff currently assigned to this role will lose their granted permissions until reassigned.`,
      variant: 'danger',
      confirmText: 'Delete Role',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      setSaving(true);
      const res = await deleteRoleApi(role.id);
      if (res.success || res.status === 'success') {
        showNotification('success', `Role "${role.name}" removed successfully.`);
        if (selectedRole?.id === role.id) {
          setSelectedRole(null);
        }
        broadcastRolesUpdated();
        await loadData();
      } else {
        showNotification('error', res.message || 'Failed to delete role.');
      }
    } catch (err: any) {
      console.error('Error deleting role:', err);
      showNotification('error', err?.message || 'An error occurred while deleting role.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleModalPerm = (permId: string) => {
    setModalSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  return (
    <div className="w-full max-w-full space-y-4 font-sans pb-12">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-4 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between border ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-transparent p-4 sm:p-5 rounded-2xl border border-slate-300/80">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-subtle text-brand border border-brand/20 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Workspace Identity &amp; RBAC</span>
            </span>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-700 font-extrabold" suppressHydrationWarning>
                {orgName}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-subtle text-brand">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dynamic Roles &amp; RBAC
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Define custom enterprise roles, configure granular permissions across business modules, and control staff register capabilities.
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <Link
            href="/organization/staff"
            className="px-4 py-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Users className="w-4 h-4 text-brand" />
            <span>Staff Directory</span>
          </Link>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-slate-300/80 bg-transparent hover:bg-slate-200/50 text-slate-700 shadow-2xs backdrop-blur-sm cursor-pointer transition-all"
            title="Refresh Roles & Permissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Main Studio View: Roles Sidebar + Permissions Matrix */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <RolesListSidebar
          roles={roles}
          search={search}
          setSearch={setSearch}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onOpenCreateModal={handleOpenCreateModal}
          onOpenEditModal={handleOpenEditModal}
          onDeleteRole={handleDeleteRole}
        />

        <RolePermissionsMatrix
          selectedRole={selectedRole}
          permissions={permissions}
          groupedPermissions={groupedPermissions}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onTogglePermission={handleTogglePermission}
          onSaveRolePermissions={handleSaveSelectedRolePermissions}
          saving={saving}
          onCloneRole={handleCloneRole}
        />
      </div>

      {/* Create / Edit Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRoleId={editingRoleId}
        roleName={modalRoleName}
        setRoleName={setModalRoleName}
        description={modalDescription}
        setDescription={setModalDescription}
        selectedPerms={modalSelectedPerms}
        onTogglePerm={handleToggleModalPerm}
        onSave={handleSaveModalRole}
        saving={saving}
        groupedPermissions={groupedPermissions}
      />
    </div>
  );
};

