'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import {
  getRolesApi,
  getPermissionsApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from '@/lib/api';
import { RoleItem, RolesListSidebar } from './RolesListSidebar';
import { RolePermissionsMatrix } from './RolePermissionsMatrix';
import { RoleModal } from './RoleModal';

export const SuperAdminRolesView: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoleName, setModalRoleName] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalSelectedPerms, setModalSelectedPerms] = useState<string[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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
      console.error('Failed to load roles/permissions:', err);
      showNotification('error', 'Failed to load roles and permissions matrix.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permId: string) => {
    if (!selectedRole) return;
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
    try {
      setSaving(true);
      const res = await updateRoleApi(selectedRole.id, { permission_ids: selectedRole.permission_ids });
      if (res.success) {
        showNotification('success', `Permissions updated for role "${selectedRole.name}".`);
        loadData();
      } else {
        showNotification('error', res.message || 'Failed to update role permissions.');
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      showNotification('error', 'An error occurred while saving role permissions.');
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

  const handleOpenEditModal = (role: RoleItem) => {
    setEditingRoleId(role.id);
    setModalRoleName(role.name);
    setModalDescription(role.description || '');
    setModalSelectedPerms(role.permission_ids || []);
    setIsModalOpen(true);
  };

  const handleToggleModalPermission = (permId: string) => {
    setModalSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRoleName.trim()) {
      showNotification('error', 'Please enter a valid role name.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: modalRoleName,
        description: modalDescription,
        permission_ids: modalSelectedPerms,
      };
      const res = editingRoleId ? await updateRoleApi(editingRoleId, payload) : await createRoleApi(payload);
      if (res.success) {
        showNotification('success', editingRoleId ? 'Role updated.' : 'New role created.');
        setIsModalOpen(false);
        loadData();
      } else {
        showNotification('error', res.message || 'Failed to save role.');
      }
    } catch (err) {
      console.error('Error saving role:', err);
      showNotification('error', 'An error occurred while saving role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.is_system) {
      showNotification('error', 'System default roles cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete custom role "${role.name}"?`)) return;
    try {
      setSaving(true);
      const res = await deleteRoleApi(role.id);
      if (res.success) {
        showNotification('success', `Role "${role.name}" deleted.`);
        if (selectedRole?.id === role.id) setSelectedRole(null);
        loadData();
      } else {
        showNotification('error', res.message || 'Failed to delete role.');
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      showNotification('error', 'An error occurred while deleting role.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-3 font-sans pb-6">
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
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-transparent p-4 sm:p-5 rounded-2xl border border-slate-300/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-subtle text-brand">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Roles &amp; Permissions
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Define custom roles and toggle dynamic database-backed permissions across all enterprise modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-300/80 bg-transparent hover:bg-slate-200/50 text-slate-700 shadow-2xs backdrop-blur-sm cursor-pointer transition-all"
            title="Reload permissions schema"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
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
        />
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRoleId={editingRoleId}
        roleName={modalRoleName}
        setRoleName={setModalRoleName}
        description={modalDescription}
        setDescription={setModalDescription}
        selectedPerms={modalSelectedPerms}
        onTogglePerm={handleToggleModalPermission}
        onSave={handleSaveModal}
        saving={saving}
        groupedPermissions={groupedPermissions}
      />
    </div>
  );
};
