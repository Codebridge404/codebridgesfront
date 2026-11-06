/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0141
 */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getUsersApi,
  getRolesApi,
  getRolePermissionsApi,
  createUserApi,
  updateUserApi,
  resetUserPasswordApi,
  deleteUserApi,
  getSuperAdminTenantsApi,
} from '@/lib/api';
import {
  UserStatsHeader,
  UserFilterToolbar,
  UserTable,
  UserFormModal,
  UserFormData,
  UserDetailModal,
  ResetPasswordModal,
  PermissionsMatrixModal,
} from './index';
import { useConfirm, useToast } from '@/components/common';

const INITIAL_FORM: UserFormData = {
  name: '',
  email: '',
  phone: '',
  avatar_url: '',
  password: '',
  role: 'admin',
  tenant_id: '',
  outlet_id: '',
  pin_code: '',
  is_active: true,
};

export function SuperAdminUsersView() {
  const confirm = useConfirm();
  const toast = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState('all');

  // Multi-select state
  const [selectedUserIds, setSelectedUserIds] = useState<Array<number | string>>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsMatrix, setPermissionsMatrix] = useState<any>(null);

  // Fetch initial data
  const fetchData = useCallback(async (isSilentRefresh = false) => {
    try {
      if (isSilentRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const [usersRes, rolesRes, tenantsRes] = await Promise.allSettled([
        getUsersApi(undefined, undefined, 'all'),
        getRolesApi(),
        getSuperAdminTenantsApi(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const d = usersRes.value.data ?? usersRes.value;
        setUsers(Array.isArray(d) ? d : d.users || []);
      }
      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        const r = rolesRes.value.data ?? rolesRes.value;
        setRoles(Array.isArray(r) ? r : r.roles || []);
      }
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value) {
        const t = tenantsRes.value.data ?? tenantsRes.value;
        setTenants(Array.isArray(t) ? t : []);
      }
    } catch (err: any) {
      toast.error('Failed to load user accounts and infrastructure data');
      setUsers([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tenant Map lookup for display
  const tenantMap = useMemo(() => {
    const map = new Map<string, string>();
    tenants.forEach((t) => {
      const name = t.name || t.company_name;
      if (t.id && name) {
        map.set(String(t.id), name);
      }
    });
    return map;
  }, [tenants]);

  // Filtered Users Pipeline
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search by name, email, phone
      if (search.trim()) {
        const term = search.toLowerCase();
        const nameMatch = (u.name || '').toLowerCase().includes(term);
        const emailMatch = (u.email || '').toLowerCase().includes(term);
        const phoneMatch = (u.phone || '').toLowerCase().includes(term);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }

      // Filter by Role
      if (selectedRole !== 'all') {
        const userRole = u.role || 'employee';
        if (userRole !== selectedRole && u.role_name !== selectedRole && u.role_slug !== selectedRole) {
          return false;
        }
      }

      // Filter by Status (active vs suspended)
      if (selectedStatus !== 'all') {
        const isActive = u.is_active === 1 || u.is_active === true;
        if (selectedStatus === 'active' && !isActive) return false;
        if (selectedStatus === 'suspended' && isActive) return false;
      }

      // Filter by Organization / Tenant
      if (selectedTenant !== 'all') {
        if (selectedTenant === 'platform') {
          if (u.tenant_id) return false;
        } else {
          if (String(u.tenant_id) !== String(selectedTenant)) return false;
        }
      }

      return true;
    });
  }, [users, search, selectedRole, selectedStatus, selectedTenant]);

  // Calculated Stats Header Counts
  const totalUsers = users.length;
  const activeUsersCount = useMemo(
    () => users.filter((u) => u.is_active === 1 || u.is_active === true).length,
    [users]
  );
  const superAdminsCount = useMemo(
    () => users.filter((u) => u.role === 'super_admin' || u.role_slug === 'super_admin').length,
    [users]
  );

  // Multi-select handlers
  const handleToggleSelectUser = (id: number | string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  // Bulk Activate
  const handleBulkActivate = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Activate Users',
      description: `Are you sure you want to activate ${selectedUserIds.length} selected user accounts? They will immediately regain platform sign-in access.`,
      confirmText: 'Activate Selected',
      variant: 'success',
    });
    if (!confirmed) return;

    try {
      const results = await Promise.allSettled(
        selectedUserIds.map((id) => updateUserApi(id, { is_active: true }))
      );
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      toast.success(`Successfully activated ${successful} user accounts`);
      fetchData(true);
      setSelectedUserIds([]);
    } catch {
      toast.error('Failed to complete bulk activation');
    }
  };

  // Bulk Deactivate / Suspend
  const handleBulkDeactivate = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Suspend Users',
      description: `Are you sure you want to suspend ${selectedUserIds.length} selected user accounts? Their active sessions and sign-in abilities will be revoked.`,
      confirmText: 'Suspend Selected',
      variant: 'warning',
    });
    if (!confirmed) return;

    try {
      const results = await Promise.allSettled(
        selectedUserIds.map((id) => updateUserApi(id, { is_active: false }))
      );
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      toast.success(`Successfully suspended ${successful} user accounts`);
      fetchData(true);
      setSelectedUserIds([]);
    } catch {
      toast.error('Failed to complete bulk suspension');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Delete Users',
      description: `Are you sure you want to permanently delete ${selectedUserIds.length} selected user accounts? This action cannot be undone.`,
      confirmText: 'Delete Selected',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      const results = await Promise.allSettled(
        selectedUserIds.map((id) => deleteUserApi(id))
      );
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      toast.success(`Successfully deleted ${successful} user accounts`);
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
      fetchData(true);
    } catch {
      toast.error('Failed to complete bulk deletion');
    }
  };

  // Open Edit User Modal
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || user.avatar || user.photo_url || '',
      password: '',
      role: user.role_slug || user.role || 'employee',
      tenant_id: user.tenant_id ? Number(user.tenant_id) : undefined,
      outlet_id: user.outlet_id ? String(user.outlet_id) : '',
      pin_code: user.pin_code || '',
      is_active: user.is_active === 1 || user.is_active === true,
    });
  };

  // Open View User Detail Modal
  const handleViewUser = (user: any) => {
    setViewingUser(user);
  };

  // Submit User Create or Update
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active !== false,
      };

      if (formData.phone) payload.phone = formData.phone.trim();
      if (formData.avatar_url) payload.avatar_url = formData.avatar_url.trim();
      if (formData.tenant_id) payload.tenant_id = formData.tenant_id;
      if (formData.outlet_id) payload.outlet_id = formData.outlet_id;
      if (formData.pin_code) payload.pin_code = formData.pin_code;
      if (formData.password) payload.password = formData.password;

      if (editingUser) {
        await updateUserApi(editingUser.id, payload);
        toast.success(`User ${formData.name} updated successfully`);
        // If currently viewing the same user, update viewing user state
        if (viewingUser && viewingUser.id === editingUser.id) {
          setViewingUser((prev: any) => ({ ...prev, ...payload }));
        }
      } else {
        await createUserApi(payload);
        toast.success(`User account for ${formData.name} created successfully`);
      }

      setShowCreateModal(false);
      setEditingUser(null);
      setFormData(INITIAL_FORM);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user account');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Active / Suspended Status
  const handleToggleStatus = async (user: any) => {
    const currentActive = user.is_active === 1 || user.is_active === true;
    const nextActive = !currentActive;
    try {
      await updateUserApi(user.id, { is_active: nextActive });
      toast.success(
        `User ${user.name} has been ${nextActive ? 'activated' : 'suspended'}`
      );
      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextActive } : u))
      );
      if (viewingUser && viewingUser.id === user.id) {
        setViewingUser((prev: any) => ({ ...prev, is_active: nextActive }));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;
    try {
      setSaving(true);
      await resetUserPasswordApi(selectedUserForReset.id, newPassword);
      toast.success(`Password reset successfully for ${selectedUserForReset.name}`);
      setSelectedUserForReset(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  // Delete User with Permanent Removal & Confirmation
  const handleDeleteUser = async (id: number | string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete User Account',
      description: `Are you sure you want to permanently delete "${name}"? This account will be removed from the platform and linked workspaces. This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteUserApi(id);
      toast.success(`User account for ${name} has been permanently deleted`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUserIds((prev) => prev.filter((i) => i !== id));
      if (viewingUser && viewingUser.id === id) {
        setViewingUser(null);
      }
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4 w-full pb-8 font-sans">
      {/* User Statistics & Header Actions */}
      <UserStatsHeader
        totalUsers={totalUsers}
        activeUsersCount={activeUsersCount}
        superAdminsCount={superAdminsCount}
        onOpenCreateModal={() => {
          setEditingUser(null);
          setFormData(INITIAL_FORM);
          setShowCreateModal(true);
        }}
        onOpenPermissionsModal={async () => {
          if (!permissionsMatrix) {
            try {
              const res = await getRolePermissionsApi();
              setPermissionsMatrix(res?.data || res?.matrix || {});
            } catch {
              setPermissionsMatrix({});
            }
          }
          setShowPermissionsModal(true);
        }}
      />

      {/* Filter and Search Toolbar */}
      <UserFilterToolbar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={(e) => {
          e.preventDefault();
          fetchData(true);
        }}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedTenant={selectedTenant}
        onTenantChange={setSelectedTenant}
        dynamicRoles={roles}
        tenants={tenants}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Data Table with Checkbox Multi-Select and Horizontal Scroll */}
      <UserTable
        users={filteredUsers}
        loading={loading}
        selectedUserIds={selectedUserIds}
        onToggleSelectUser={handleToggleSelectUser}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onResetPassword={(u) => {
          setSelectedUserForReset(u);
          setNewPassword('');
        }}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        tenantMap={tenantMap}
      />

      {/* Create / Edit User Modal */}
      <UserFormModal
        isOpen={showCreateModal || Boolean(editingUser)}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleSaveUser}
        saving={saving}
        dynamicRoles={roles}
        tenants={tenants}
        existingUsers={users}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={(u) => {
          setViewingUser(null);
          handleEditUser(u);
        }}
        onResetPassword={(u) => {
          setSelectedUserForReset(u);
          setNewPassword('');
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={(u) => handleDeleteUser(u.id, u.name)}
        tenantName={viewingUser?.tenant_id ? tenantMap.get(String(viewingUser.tenant_id)) : undefined}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        user={selectedUserForReset}
        newPasswordInput={newPassword}
        onPasswordChange={setNewPassword}
        onClose={() => setSelectedUserForReset(null)}
        onSubmit={handleResetPassword}
        saving={saving}
      />

      {/* RBAC Permissions Matrix Modal */}
      <PermissionsMatrixModal
        isOpen={showPermissionsModal}
        permissionsMatrix={permissionsMatrix}
        onClose={() => setShowPermissionsModal(false)}
      />
    </div>
  );
}
