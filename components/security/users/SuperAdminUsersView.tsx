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

  // Tenant Map lookup
  const tenantMap = useMemo(() => {
    const map = new Map<string, string>();
    tenants.forEach((t) => {
      if (t && t.id) {
        map.set(String(t.id), t.name || t.company_name || `Tenant #${t.id}`);
      }
    });
    return map;
  }, [tenants]);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const searchLower = search.trim().toLowerCase();
      const matchesSearch =
        !searchLower ||
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.phone?.toLowerCase().includes(searchLower);

      // Role
      const matchesRole =
        selectedRole === 'all' ||
        !selectedRole ||
        u.role === selectedRole ||
        u.role_slug === selectedRole;

      // Status
      const isActive = u.is_active === 1 || u.is_active === true;
      let matchesStatus = true;
      if (selectedStatus === 'active') matchesStatus = isActive;
      if (selectedStatus === 'inactive') matchesStatus = !isActive;

      // Tenant
      let matchesTenant = true;
      if (selectedTenant === 'root') {
        matchesTenant = !u.tenant_id;
      } else if (selectedTenant !== 'all') {
        matchesTenant = String(u.tenant_id) === String(selectedTenant);
      }

      return matchesSearch && matchesRole && matchesStatus && matchesTenant;
    });
  }, [users, search, selectedRole, selectedStatus, selectedTenant]);

  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.is_active === 1 || u.is_active === true).length;
  const superAdminsCount = users.filter((u) => u.role === 'super_admin' || u.role_slug === 'super_admin').length;

  // View User Details
  const handleViewUser = (u: any) => {
    setViewingUser(u);
  };

  // Open Edit User Modal
  const handleEditUser = (u: any) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || u.role_slug || 'admin',
      tenant_id: u.tenant_id ? String(u.tenant_id) : '',
      outlet_id: u.outlet_id ? String(u.outlet_id) : (u.outlet_uuid || ''),
      pin_code: u.pin_code || '',
      is_active: u.is_active === 1 || u.is_active === true,
    });
  };

  // Save User (Create or Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        tenant_id: formData.tenant_id ? Number(formData.tenant_id) : null,
        outlet_id: formData.outlet_id || null,
        pin_code: formData.pin_code || null,
        is_active: formData.is_active ?? true,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

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

  // Deactivate / Soft Delete User with Confirmation
  const handleDeleteUser = async (id: number | string, name: string) => {
    const confirmed = await confirm({
      title: 'Deactivate User Account',
      description: `Are you sure you want to deactivate ${name}? This user will immediately lose access to the platform and linked workspaces.`,
      confirmText: 'Deactivate Account',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteUserApi(id);
      toast.success(`User account for ${name} has been deactivated`);
      fetchData(true);
      if (viewingUser && viewingUser.id === id) {
        setViewingUser(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate user');
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

      {/* Data Table with Pinned Columns and Horizontal Scroll */}
      <UserTable
        users={filteredUsers}
        loading={loading}
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
