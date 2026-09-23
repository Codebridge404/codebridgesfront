'use client';

import React, { useState, useEffect } from 'react';
import {
  getUsersApi,
  getRolesApi,
  getRolePermissionsApi,
  createUserApi,
  updateUserApi,
  resetUserPasswordApi,
  deleteUserApi,
} from '@/lib/api';
import {
  UserStatsHeader,
  UserFilterToolbar,
  UserTable,
  UserFormModal,
  UserFormData,
  ResetPasswordModal,
  PermissionsMatrixModal,
} from './index';

const INITIAL_FORM: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'admin',
  outlet_id: '',
  pin_code: '',
};

export function SuperAdminUsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsMatrix, setPermissionsMatrix] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.allSettled([
        getUsersApi(),
        getRolesApi(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const d = usersRes.value.data ?? usersRes.value;
        setUsers(Array.isArray(d) ? d : d.users || []);
      }
      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        const r = rolesRes.value.data ?? rolesRes.value;
        setRoles(Array.isArray(r) ? r : r.roles || []);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'all' || !selectedRole || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.status !== 'inactive' && u.is_active !== false && u.is_active !== 0).length;
  const superAdminsCount = users.filter((u) => u.role === 'super_admin' || u.role === 'admin').length;

  const handleEditUser = (u: any) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'admin',
      outlet_id: u.outlet_id ? String(u.outlet_id) : '',
      pin_code: u.pin_code || '',
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingUser) {
        await updateUserApi(editingUser.id, formData);
      } else {
        await createUserApi(formData);
      }
      setShowCreateModal(false);
      setEditingUser(null);
      setFormData(INITIAL_FORM);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;
    try {
      setSaving(true);
      await resetUserPasswordApi(selectedUserForReset.id, newPassword);
      setSelectedUserForReset(null);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateUser = async (id: number | string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await deleteUserApi(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate user');
    }
  };

  return (
    <div className="space-y-3 w-full pb-6 font-sans">
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

      <UserFilterToolbar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={(e) => {
          e.preventDefault();
          fetchUsers();
        }}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        dynamicRoles={roles}
      />

      <UserTable
        users={filteredUsers}
        loading={loading}
        onResetPassword={(u) => {
          setSelectedUserForReset(u);
          setNewPassword('');
        }}
        onEditUser={handleEditUser}
        onDeactivateUser={handleDeactivateUser}
      />

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
      />

      <ResetPasswordModal
        user={selectedUserForReset}
        newPasswordInput={newPassword}
        onPasswordChange={setNewPassword}
        onClose={() => setSelectedUserForReset(null)}
        onSubmit={handleResetPassword}
        saving={saving}
      />

      <PermissionsMatrixModal
        isOpen={showPermissionsModal}
        permissionsMatrix={permissionsMatrix}
        onClose={() => setShowPermissionsModal(false)}
      />
    </div>
  );
}
